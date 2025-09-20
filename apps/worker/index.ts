import axios from "axios";
import { xReadBulk, xAckBulk, xAdd, WebsiteEvent } from "@uptimematrix/redisstream";
import { prismaClient, WebsiteStatus, IncidentStatus, Website, Incident, EscalationPolicy, EscalationStep } from "@uptimematrix/store";
import { handleEscalation, getRecipientsEmails } from "./escalation/handleEscalation.js";
import { sendEmail } from "./notifications/email.js";

// Define a type for the selected escalation steps to avoid type mismatches
type SelectedEscalationStep = {
    id: string;
    stepOrder: number;
    escalateAfter: number;
    primaryMethods: string[];
    additionalMethods: string[];
    recipients: string[];
    customMessage: string | null;
};

const GROUP_NAME = process.env.GROUP_NAME!;
const CONSUMER_NAME = process.env.CONSUMER_NAME!;
if (!GROUP_NAME || !CONSUMER_NAME) throw new Error("GROUP_NAME and CONSUMER_NAME required");

async function workerLoop() {
    console.log("Worker started");

    while (true) {
        // Process new website checks
        const messages = await xReadBulk(GROUP_NAME, CONSUMER_NAME);
        if (messages && messages.length) {
        for (const stream of messages) {
            const ackIds: string[] = [];
            const promises = stream.messages.map(async (msg: any) => {
                try {
                    const rawSite = msg.message;
                    
                    // Parse Redis data properly
                        const site: WebsiteEvent = {
                        ...rawSite,
                        checkInterval: rawSite.checkInterval ? parseInt(rawSite.checkInterval) : undefined,
                            regions: rawSite.regions ? JSON.parse(rawSite.regions) : undefined,
                            // Include incident-specific data if available (for re-queued escalations)
                            currentIncidentId: rawSite.currentIncidentId || undefined,
                            escalationStepIndex: rawSite.escalationStepIndex ? parseInt(rawSite.escalationStepIndex) : 0,
                            organizationId: rawSite.organizationId || undefined // Extract organizationId
                    };
                    
                    console.log(`🔄 Worker processing: ${site.url} (interval: ${site.checkInterval}ms)`);
                    await processWebsite(site);
                    ackIds.push(msg.id);
                } catch (error) {
                    console.error(`❌ Error processing message ${msg.id}:`, error);
                    ackIds.push(msg.id); // Still acknowledge to prevent infinite retries
                }
            });

            await Promise.all(promises);
            await xAckBulk(GROUP_NAME, ackIds);
        }
        }

        // Periodically check for scheduled escalations
        await checkScheduledEscalations();

        await sleep(2000); // Sleep for a bit before checking for new messages or scheduled escalations
    }
}

async function processWebsite(site: WebsiteEvent) {
    const startTime = Date.now();
    let isOnline = false;
    let statusCode = 0;

    try {
        const method = site.method ? site.method.toLowerCase() as "get" | "post" | "put" | "delete" | "head" : "get";
        const dataOfWebsite = await axios({ url: site.url, method, timeout: 10000 });
        statusCode = dataOfWebsite.status;
        isOnline = (statusCode === 200);
        const responseTime = Date.now() - startTime;

        // Removed region upsert logic as it belongs in seed.ts
        const region = await prismaClient.region.findUnique({
            where: { name: site.region || "India" },
        });

        if (!region) {
            console.error(`Region ${site.region || "India"} not found. Please ensure it is seeded.`);
            return; // Or handle error appropriately
        }

        await prismaClient.websiteTick.create({
            data: {
                response_time_ms: responseTime,
                status: isOnline ? WebsiteStatus.Online : WebsiteStatus.Offline,
                website_id: site.id,
                region_id: region.id
            }
        });

        // Get the website from database to ensure we have the correct checkInterval and organizationId
        const website = await prismaClient.website.findUnique({
            where: { id: site.id },
            select: { checkInterval: true, createdById: true, escalationPolicyId: true, regions: true, organizationId: true }
        });

        if (!website || !website.organizationId) {
            console.error(`Website ${site.id} or its organization ID not found. Skipping website processing.`);
            return;
        }
        const organizationId = website.organizationId;

        if (!isOnline) {
            await handleEscalation(
                { ...site, escalationPolicyId: site.escalationPolicyId || undefined, createdById: site.createdById || undefined, region: site.region || undefined },
                WebsiteStatus.Offline,
                organizationId,
                site.currentIncidentId,
                site.escalationStepIndex
            );
            console.log(`❌ ${site.url} (${region.name}) is offline, Status: ${statusCode}, ${responseTime}ms`);
        } else {
            console.log(`✅ ${site.url} (${region.name}) is online, ${responseTime}ms`);
            // If website is now online, resolve any active incidents
            await resolveActiveIncidents(site.id, organizationId);
        }
    } catch (error) {
        const responseTime = Date.now() - startTime; // Calculate response time even on error
        // Removed region upsert logic as it belongs in seed.ts
        const region = await prismaClient.region.findUnique({
            where: { name: site.region || "India" },
        });

        if (!region) {
            console.error(`Region ${site.region || "India"} not found. Please ensure it is seeded.`);
            return; // Or handle error appropriately
        }

        // Get the organizationId from the website (needed for handleEscalation in catch block)
        const websiteForError = await prismaClient.website.findUnique({
            where: { id: site.id },
            select: { organizationId: true },
        });

        if (!websiteForError?.organizationId) {
            console.error(`Organization ID not found for website ${site.id} in error handling. Skipping escalation.`);
            return; // Cannot proceed without organizationId
        }
        const organizationIdForError = websiteForError.organizationId;

        await prismaClient.websiteTick.create({
            data: {
                response_time_ms: 0, // Assuming 0 or a specific error code for response time on error
                status: WebsiteStatus.Offline,
                website_id: site.id,
                region_id: region.id
            }
        });

        await handleEscalation(
            { ...site, escalationPolicyId: site.escalationPolicyId || undefined, createdById: site.createdById || undefined, region: site.region || undefined },
            WebsiteStatus.Offline,
            organizationIdForError,
            site.currentIncidentId,
            site.escalationStepIndex
        );
        console.error(`❌ ${site.url} (${region.name}) is offline (Error: ${error}), ${responseTime}ms`);
    }

    // Get the website from database to ensure we have the correct checkInterval
    const website = await prismaClient.website.findUnique({
        where: { id: site.id },
        select: { checkInterval: true, createdById: true, escalationPolicyId: true, regions: true }
    });
    
    const checkInterval = website?.checkInterval || site.checkInterval || 60000;
    
    await prismaClient.website.update({
        where: { id: site.id },
        data: {
            lastChecked: new Date(),
            nextCheckTime: new Date(Date.now() + checkInterval),
            currently_upForIndays: { increment: 1 }
        }
    });
    
    console.log(`⏰ Next check for ${site.url} scheduled for: ${new Date(Date.now() + checkInterval).toISOString()} (interval: ${checkInterval}ms)`);
}

async function resolveActiveIncidents(websiteId: string, organizationId: string) {
    const website = await prismaClient.website.findUnique({ where: { id: websiteId } });
    if (!website) {
        console.error(`Website with ID ${websiteId} not found for resolving incidents.`);
        return;
    }

    const incidentsToResolve = await prismaClient.incident.findMany({
        where: {
            websiteId: websiteId,
            status: IncidentStatus.INVESTIGATING,
        },
        include: {
            website: { select: { url: true, createdById: true } },
        },
    });

    for (const incident of incidentsToResolve) {
        await prismaClient.incident.update({
            where: { id: incident.id },
            data: {
                status: IncidentStatus.RESOLVED,
                endTime: new Date(),
                nextEscalationTime: null,
            },
        });
        console.log(`✅ Incident ${incident.id} for website ${websiteId} resolved.`);

        // Send incident resolved notification
        if (incident.website && incident.website.createdById) {
            const recipientEmails = await getRecipientsEmails([incident.website.createdById], organizationId);
            for (const email of recipientEmails) {
                await sendEmail(
                    email,
                    `[Resolved] Incident for ${incident.website.url}`,
                    'incidentResolved', // Template name
                    {
                        recipientName: email, // Placeholder
                        websiteUrl: incident.website.url,
                        incidentId: incident.id,
                        serviceName: incident.website.url,
                        ctaLink: `${process.env.FRONTEND_URL}/dashboard/incidents/${incident.id}`,
                    }
                );
            }
        }
    }
}

async function checkScheduledEscalations() {
    const now = new Date();
    const incidentsDue = await prismaClient.incident.findMany({
        where: {
            nextEscalationTime: { lte: now },
            status: IncidentStatus.INVESTIGATING,
        },
        include: {
            website: {
                select: {
                    id: true,
                    url: true,
                    checkInterval: true,
                    method: true,
                    monitorType: true,
                    escalationPolicyId: true,
                    regions: true,
                    createdById: true,
                    organizationId: true, // Include organizationId
                    escalationPolicy: {
                        select: {
                            terminationCondition: true,
                            repeatLastStepIntervalMinutes: true,
                            isActive: true,
                            name: true,
                            steps: {
                                select: {
                                    id: true,
                                    stepOrder: true,
                                    escalateAfter: true,
                                    primaryMethods: true,
                                    additionalMethods: true,
                                    recipients: true,
                                    customMessage: true,
                                }
                            },
                            priorityLevel: true // Ensure priorityLevel is selected
                        }
                    },
                },
            },
        },
    });

    for (const incident of incidentsDue) {
        // Ensure website and escalation policy are available
        if (!incident.website || !incident.website.escalationPolicy) {
            console.error(`Skipping scheduled escalation: Incident ${incident.id} has no associated website or escalation policy.`);
            // Mark incident as resolved or handle appropriately if no valid policy can be found
            await prismaClient.incident.update({
                where: { id: incident.id },
                data: {
                    status: IncidentStatus.RESOLVED,
                    endTime: new Date(),
                    nextEscalationTime: null,
                },
            });
            continue;
        }

        const website = incident.website;
        const policy = website.escalationPolicy;

        if (!policy) {
            console.error(`Skipping scheduled escalation: Website ${website.id} has no associated escalation policy for incident ${incident.id}.`);
            await prismaClient.incident.update({
                where: { id: incident.id },
                data: {
                    status: IncidentStatus.RESOLVED,
                    endTime: new Date(),
                    nextEscalationTime: null,
                },
            });
            continue;
        }

        if (!policy.isActive) {
            console.log(`Incident ${incident.id}: Policy ${policy.name} is inactive, marking incident as resolved.`);
            await prismaClient.incident.update({
                where: { id: incident.id },
                data: {
                    status: IncidentStatus.RESOLVED,
                    endTime: new Date(),
                    nextEscalationTime: null,
                },
            });
            continue;
        }

        if (!policy || !policy.isActive || policy.steps.length === 0) {
            console.log(`Incident ${incident.id}: Associated escalation policy is inactive or has no steps. Resolving incident.`);
            await prismaClient.incident.update({
                where: { id: incident.id },
                data: {
                    status: IncidentStatus.RESOLVED,
                    endTime: new Date(),
                    nextEscalationTime: null,
                },
            });
            continue; // Skip to the next incident
        }

        // Cast steps to the defined type
        const steps: SelectedEscalationStep[] = policy.steps as SelectedEscalationStep[];
        const sortedSteps = steps.sort((a: SelectedEscalationStep, b: SelectedEscalationStep) => a.stepOrder - b.stepOrder);

        let nextStepIndex = 0;
        if (incident.currentEscalationStepId) {
            const currentStep = sortedSteps.find((step: SelectedEscalationStep) => step.id === incident.currentEscalationStepId);
            if (currentStep) {
                nextStepIndex = sortedSteps.indexOf(currentStep) + 1;
            }
        }

        if (nextStepIndex < sortedSteps.length) {
            // Re-queue message to trigger handleEscalation for the next step
            await xAdd({
                id: website.id,
                url: website.url,
                escalationPolicyId: website.escalationPolicyId || undefined, // Handle null to undefined
                createdById: website.createdById || undefined, // Handle null to undefined
                regions: website.regions || [], // Ensure regions is an array
                checkInterval: website.checkInterval || undefined, // Handle null to undefined
                currentIncidentId: incident.id,
                escalationStepIndex: nextStepIndex,
                organizationId: website.organizationId, 
            });
            console.log(`Re-queued incident ${incident.id} for escalation step ${nextStepIndex + 1}`);
        } else {
            // All steps have been processed, check termination condition
            if (policy.terminationCondition === "repeat_last_step" && policy.repeatLastStepIntervalMinutes !== null && policy.repeatLastStepIntervalMinutes !== undefined) {
                const lastStep = sortedSteps[sortedSteps.length - 1];
                const repeatIntervalMs = policy.repeatLastStepIntervalMinutes * 60 * 1000;
                const nextRepeatTime = new Date(Date.now() + repeatIntervalMs);

                await prismaClient.incident.update({
                    where: { id: incident.id },
                    data: {
                        nextEscalationTime: nextRepeatTime,
                        // Re-queue the last step to repeat
                        currentEscalationStepId: lastStep.id,
                    },
                });
                // Re-queue the message to trigger handleEscalation for the last step again
                await xAdd({
                    id: website.id,
                    url: website.url,
                    escalationPolicyId: website.escalationPolicyId || undefined,
                    createdById: website.createdById || undefined,
                    regions: website.regions || [],
                    checkInterval: website.checkInterval || undefined,
                    currentIncidentId: incident.id,
                    escalationStepIndex: sortedSteps.length - 1, // Repeat the last step
                    organizationId: website.organizationId, 
                });
                console.log(`Incident ${incident.id}: Repeating last escalation step in ${policy.repeatLastStepIntervalMinutes} minutes.`);
            } else {
                // No more steps or termination condition is stop_after_last_step, resolve incident
                await prismaClient.incident.update({
                    where: { id: incident.id },
                    data: {
                        status: IncidentStatus.RESOLVED,
                        endTime: new Date(),
                        nextEscalationTime: null,
                    },
                });
                console.log(`Incident ${incident.id} fully escalated and resolved.`);
            }
        }
    }
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

workerLoop().catch(console.error);