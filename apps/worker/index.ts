// Removed axios import to reduce memory usage
import { xReadBulk, xAckBulk, xAdd, WebsiteEvent } from "@uptimematrix/redisstream";
import { prismaClient, WebsiteStatus, IncidentStatus, Website, Incident, EscalationPolicy, EscalationStep } from "@uptimematrix/store";
import { handleEscalation, getRecipientsEmails } from "./escalation/handleEscalation.js";
import { sendEmail } from "./notifications/email.js";

const GROUP_NAME = process.env.GROUP_NAME!;
const CONSUMER_NAME = process.env.CONSUMER_NAME!;
if (!GROUP_NAME || !CONSUMER_NAME) throw new Error("GROUP_NAME and CONSUMER_NAME required");

// Add a processing lock to prevent duplicate processing
const processingIncidents = new Set<string>();

async function workerLoop() {
    console.log("Worker started");

    while (true) {
        try {
            // Process new website checks
            const messages = await xReadBulk(GROUP_NAME, CONSUMER_NAME);
            if (messages && messages.length) {
                for (const stream of messages) {
                    const ackIds: string[] = [];
                    const promises = stream.messages.map(async (msg: any) => {
                        try {
                            const rawSite = msg.message;
                            
                            const site: WebsiteEvent = {
                                ...rawSite,
                                checkInterval: rawSite.checkInterval ? parseInt(rawSite.checkInterval) : undefined,
                                regions: rawSite.regions ? JSON.parse(rawSite.regions) : undefined,
                                currentIncidentId: rawSite.currentIncidentId || undefined,
                                organizationId: rawSite.organizationId || undefined
                            };
                            
                            console.log(`🔄 Worker processing: ${site.url} (interval: ${site.checkInterval}ms)`);
                            await processWebsite(site);
                            ackIds.push(msg.id);
                        } catch (error) {
                            console.error(`❌ Error processing message ${msg.id}:`, error);
                            ackIds.push(msg.id);
                        }
                    });

                    await Promise.allSettled(promises); // Use allSettled to handle individual failures
                    await xAckBulk(GROUP_NAME, ackIds);
                }
            }

            // Check for scheduled escalations
            await checkScheduledEscalations();

            await sleep(5000); // Increased from 2s to 5s for better performance

        } catch (error) {
            console.error("Worker loop error:", error);
            await sleep(10000); // Wait longer on critical errors
        }
    }
}

async function processWebsite(site: WebsiteEvent) {
    const startTime = Date.now();
    let isOnline = false;
    let statusCode = 0;

    try {
        const method = site.method ? site.method.toLowerCase() as "get" | "post" | "put" | "delete" | "head" : "get";
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(site.url, {
            method: method.toUpperCase(),
            signal: controller.signal,
            headers: {
                'User-Agent': 'UptimeMatrix-Monitor/1.0'
            }
        });
        
        clearTimeout(timeoutId);
        statusCode = response.status;
        isOnline = (statusCode >= 200 && statusCode < 400);
        const responseTime = Date.now() - startTime;

        const region = await prismaClient.region.findUnique({
            where: { name: site.region || "India" },
        });

        if (!region) {
            console.error(`Region ${site.region || "India"} not found. Please ensure it is seeded.`);
            return;
        }

        // Create website tick
        await prismaClient.websiteTick.create({
            data: {
                response_time_ms: responseTime,
                status: isOnline ? WebsiteStatus.Online : WebsiteStatus.Offline,
                website_id: site.id,
                region_id: region.id
            }
        });

        // Get website details
        const website = await prismaClient.website.findUnique({
            where: { id: site.id },
            select: { 
                checkInterval: true, 
                createdById: true, 
                escalationPolicyId: true, 
                regions: true, 
                organizationId: true,
                isActive: true
            }
        });

        if (!website || !website.organizationId || !website.isActive) {
            console.error(`Website ${site.id} not found, inactive, or missing organization ID.`);
            return;
        }

        const organizationId = website.organizationId;

        if (!isOnline) {
            await handleEscalation(
                { 
                    ...site, 
                    escalationPolicyId: site.escalationPolicyId || website.escalationPolicyId || undefined, 
                    createdById: site.createdById || website.createdById || undefined, 
                    region: site.region || undefined 
                },
                WebsiteStatus.Offline,
                organizationId,
                site.currentIncidentId,
            );
            console.log(`❌ ${site.url} (${region.name}) is offline, Status: ${statusCode}, ${responseTime}ms`);
        } else {
            console.log(`✅ ${site.url} (${region.name}) is online, ${responseTime}ms`);
            await resolveActiveIncidents(site.id, organizationId);
        }

    } catch (error) {
        const responseTime = Date.now() - startTime;
        
        try {
            const region = await prismaClient.region.findUnique({
                where: { name: site.region || "India" },
            });

            if (!region) {
                console.error(`Region ${site.region || "India"} not found.`);
                return;
            }

            const websiteForError = await prismaClient.website.findUnique({
                where: { id: site.id },
                select: { organizationId: true, escalationPolicyId: true, createdById: true, isActive: true },
            });

            if (!websiteForError?.organizationId || !websiteForError.isActive) {
                console.error(`Website ${site.id} not found, inactive, or missing organization ID.`);
                return;
            }

            // Create error tick
            await prismaClient.websiteTick.create({
                data: {
                    response_time_ms: responseTime,
                    status: WebsiteStatus.Offline,
                    website_id: site.id,
                    region_id: region.id
                }
            });

            await handleEscalation(
                { 
                    ...site, 
                    escalationPolicyId: site.escalationPolicyId || websiteForError.escalationPolicyId || undefined, 
                    createdById: site.createdById || websiteForError.createdById || undefined, 
                    region: site.region || undefined 
                },
                WebsiteStatus.Offline,
                websiteForError.organizationId,
                site.currentIncidentId,
            );
            console.error(`❌ ${site.url} (${region.name}) is offline (Error: ${error}), ${responseTime}ms`);
            
        } catch (innerError) {
            console.error(`Failed to handle error for ${site.url}:`, innerError);
        }
    }

    // Update website status
    try {
        const website = await prismaClient.website.findUnique({
            where: { id: site.id },
            select: { checkInterval: true }
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
        
    } catch (updateError) {
        console.error(`Failed to update website ${site.id}:`, updateError);
    }
}

async function resolveActiveIncidents(websiteId: string, organizationId: string) {
    try {
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
            try {
                await prismaClient.incident.update({
                    where: { id: incident.id },
                    data: {
                        status: IncidentStatus.RESOLVED,
                        endTime: new Date(),
                        nextEscalationTime: null,
                    },
                });
                console.log(`✅ Incident ${incident.id} for website ${websiteId} resolved.`);

                // Send resolved notification
                if (incident.website && incident.website.createdById) {
                    try {
                        const recipientEmails = await getRecipientsEmails([incident.website.createdById], organizationId);
                        
                        for (const email of recipientEmails) {
                            await sendEmail(
                                email,
                                `[Resolved] Incident for ${incident.website.url}`,
                                'incidentResolved',
                                {
                                    recipientName: email,
                                    websiteUrl: incident.website.url,
                                    incidentId: incident.id,
                                    serviceName: incident.website.url,
                                    ctaLink: `${process.env.FRONTEND_URL}/dashboard/incidents/${incident.id}`,
                                }
                            );
                        }
                    } catch (emailError) {
                        console.error(`Failed to send resolved notification for incident ${incident.id}:`, emailError);
                    }
                }
            } catch (resolveError) {
                console.error(`Failed to resolve incident ${incident.id}:`, resolveError);
            }
        }
    } catch (error) {
        console.error(`Error in resolveActiveIncidents for website ${websiteId}:`, error);
    }
}

async function checkScheduledEscalations() {
    try {
        const now = new Date();
        const incidentsDue = await prismaClient.incident.findMany({
            where: {
                nextEscalationTime: { lte: now },
                status: IncidentStatus.INVESTIGATING,
                Acknowledged: false, // Only process unacknowledged incidents
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
                        organizationId: true,
                        isActive: true
                    }
                },
            },
        });

        for (const incident of incidentsDue) {
            // Prevent duplicate processing
            if (processingIncidents.has(incident.id)) {
                continue;
            }
            processingIncidents.add(incident.id);

            try {
                if (!incident.website || !incident.website.organizationId || !incident.website.isActive) {
                    console.error(`Skipping incident ${incident.id}: Invalid website or inactive`);
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

                await xAdd({
                    id: website.id,
                    url: website.url,
                    escalationPolicyId: website.escalationPolicyId || undefined,
                    createdById: website.createdById || undefined,
                    regions: website.regions || [],
                    checkInterval: website.checkInterval || undefined,
                    currentIncidentId: incident.id,
                    escalationStepIndex: 0,
                    organizationId: website.organizationId,
                });
                
                console.log(`Re-queued incident ${incident.id} for escalation processing`);
                
            } catch (error) {
                console.error(`Failed to re-queue incident ${incident.id}:`, error);
            } finally {
                processingIncidents.delete(incident.id);
            }
        }
    } catch (error) {
        console.error("Error in checkScheduledEscalations:", error);
    }
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

workerLoop().catch(console.error);