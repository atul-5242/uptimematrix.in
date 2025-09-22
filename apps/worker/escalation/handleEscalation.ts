import { prismaClient, WebsiteStatus, IncidentStatus, IncidentSeverity, EscalationStep, Priority } from "@uptimematrix/store";
import { WebsiteEvent } from "@uptimematrix/redisstream";
import { sendEmail } from "../notifications/email.js";
import axios from "axios";

const DEFAULT_REGION = "India";

function mapPriorityToIncidentSeverity(priority: Priority): IncidentSeverity {
    switch (priority) {
        case Priority.critical: return IncidentSeverity.CRITICAL;
        case Priority.high: return IncidentSeverity.MAJOR;
        case Priority.medium: return IncidentSeverity.MINOR;
        case Priority.low: return IncidentSeverity.NONE;
        default: return IncidentSeverity.NONE;
    }
}

async function getUserEmail(userId: string): Promise<string> {
    const user = await prismaClient.user.findUnique({
        where: { id: userId },
        select: { email: true },
    });
    return user?.email || "user@example.com";
}

async function getTeamMemberEmails(teamId: string): Promise<string[]> {
    const teamMembers = await prismaClient.teamMember.findMany({
        where: { teamId: teamId },
        include: { user: { select: { email: true } } },
    });
    return teamMembers.map(member => member.user?.email).filter((email): email is string => !!email);
}

async function getOncallUserEmails(scheduleId: string): Promise<string[]> {
    const schedule = await prismaClient.onCallSchedule.findUnique({
        where: { id: scheduleId },
        include: {
            userAssignments: { include: { user: { select: { email: true } } } },
            teamAssignments: { include: { team: { include: { members: { include: { user: { select: { email: true } } } } } } } },
        },
    });

    if (!schedule) return [];

    const emails: string[] = [];
    const addedEmails = new Set<string>();

    schedule.userAssignments.forEach(assignment => {
        if (assignment.user?.email && !addedEmails.has(assignment.user.email)) {
            emails.push(assignment.user.email);
            addedEmails.add(assignment.user.email);
        }
    });

    for (const teamAssignment of schedule.teamAssignments) {
        if (teamAssignment.team) {
            const teamEmails = await getTeamMemberEmails(teamAssignment.team.id);
            teamEmails.forEach(email => {
                if (!addedEmails.has(email)) {
                    emails.push(email);
                    addedEmails.add(email);
                }
            });
        }
    }

    return emails;
}

export async function getRecipientsEmails(recipientIds: string[], organizationId: string): Promise<string[]> {
    const allEmails: string[] = [];
    const addedEmails = new Set<string>();

    for (const recipientId of recipientIds) {
        const isEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(recipientId);

        if (isEmail) {
            const organizationMemberByEmail = await prismaClient.organizationMember.findFirst({
                where: {
                    organizationId: organizationId,
                    user: { email: recipientId },
                },
                include: { user: { select: { email: true } } },
            });
            if (organizationMemberByEmail?.user?.email && !addedEmails.has(organizationMemberByEmail.user.email)) {
                allEmails.push(organizationMemberByEmail.user.email);
                addedEmails.add(organizationMemberByEmail.user.email);
            }
            continue;
        }

        const organizationMember = await prismaClient.organizationMember.findFirst({
            where: { userId: recipientId, organizationId: organizationId },
            include: { user: { select: { email: true } } },
        });
        if (organizationMember?.user?.email && !addedEmails.has(organizationMember.user.email)) {
            allEmails.push(organizationMember.user.email);
            addedEmails.add(organizationMember.user.email);
            continue;
        }

        const team = await prismaClient.team.findUnique({
            where: { id: recipientId, organizationId: organizationId },
            select: { id: true },
        });
        if (team) {
            const teamEmails = await getTeamMemberEmails(team.id);
            teamEmails.forEach(email => {
                if (!addedEmails.has(email)) {
                    allEmails.push(email);
                    addedEmails.add(email);
                }
            });
            continue;
        }

        const onCallSchedule = await prismaClient.onCallSchedule.findUnique({
            where: { id: recipientId, organizationId: organizationId },
            select: { id: true },
        });
        if (onCallSchedule) {
            const scheduleEmails = await getOncallUserEmails(onCallSchedule.id);
            scheduleEmails.forEach(email => {
                if (!addedEmails.has(email)) {
                    allEmails.push(email);
                    addedEmails.add(email);
                }
            });
            continue;
        }

        console.warn(`Recipient ID ${recipientId} not found as a user, team, or on-call schedule.`);
    }

    return allEmails;
}

export async function handleEscalation(
    site: Omit<WebsiteEvent, 'currentIncidentId' | 'escalationStepIndex' | 'regions' | 'checkInterval'> & {
        createdById: string | null | undefined;
        escalationPolicyId: string | null | undefined;
        region: string | undefined;
    },
    status: WebsiteStatus,
    organizationId: string,
    currentIncidentId?: string,
    escalationStepIndex: number = 0
) {
    let incident = null;
    const now = new Date();

    // Fetch the escalation policy with steps first
    let escalationPolicy = null;
    if (site.escalationPolicyId) {
        escalationPolicy = await prismaClient.escalationPolicy.findUnique({
            where: { id: site.escalationPolicyId },
            select: {
                name: true,
                isActive: true,
                terminationCondition: true,
                repeatLastStepIntervalMinutes: true,
                steps: {
                    select: {
                        id: true,
                        policyId: true,
                        stepOrder: true,
                        primaryMethods: true,
                        additionalMethods: true,
                        recipients: true,
                        delayMinutes: true,
                        repeatCount: true,
                        escalateAfter: true,
                        customMessage: true,
                        createdAt: true,
                        updatedAt: true,
                    }
                },
                priorityLevel: true
            }
        });
    }

    if (site.escalationPolicyId && !escalationPolicy) {
        console.error(`Escalation policy with ID ${site.escalationPolicyId} not found for website ${site.url}.`);
        return;
    }

    if (!escalationPolicy || !escalationPolicy.isActive) {
        console.log(`No active escalation policy found for website ${site.url}. Sending generic notification.`);
        const adminEmails = await getRecipientsEmails([site.createdById || ""], organizationId);
        for (const email of adminEmails) {
            await sendEmail(
                email,
                `[${status}] ${site.url} is ${status} - ${!escalationPolicy ? 'No Active Policy' : 'Inactive Policy'}`,
                'generic',
                { 
                    websiteUrl: site.url,
                    status: status,
                }
            );
        }
        return;
    }

    // Get or create incident
    if (currentIncidentId) {
        incident = await prismaClient.incident.findUnique({
            where: { id: currentIncidentId },
            include: { website: true }
        });
    }

    if (!incident) {
        const existingIncident = await prismaClient.incident.findFirst({
            where: {
                websiteId: site.id,
                status: IncidentStatus.INVESTIGATING,
            },
            include: { website: true }
        });

        if (existingIncident) {
            incident = existingIncident;
            console.log(`Using existing incident ${incident.id} for ${site.url}`);
        } else {
            const websiteDetails = await prismaClient.website.findUnique({ where: { id: site.id } });
            if (!websiteDetails) {
                console.error(`Website ${site.id} not found when trying to create an incident.`);
                return;
            }

            const sortedSteps = escalationPolicy.steps.sort((a: EscalationStep, b: EscalationStep) => a.stepOrder - b.stepOrder);
            const firstStep = sortedSteps[0];
            
            // Calculate when the first step should start (after delayMinutes)
            const firstStepStartTime = new Date(now.getTime() + (firstStep.delayMinutes * 60 * 1000));
            const nextEscalationTime = firstStep.delayMinutes > 0 ? firstStepStartTime : new Date(now.getTime() + (firstStep.escalateAfter * 60 * 1000));

            incident = await prismaClient.incident.create({
                data: {
                    website: { connect: { id: site.id } },
                    organization: { connect: { id: websiteDetails.organizationId } },
                    status: IncidentStatus.INVESTIGATING,
                    severity: escalationPolicy?.priorityLevel ? mapPriorityToIncidentSeverity(escalationPolicy.priorityLevel) : IncidentSeverity.MAJOR,
                    Acknowledged: false,
                    startTime: now,
                    title: `${site.url} is ${status}`,
                    serviceName: site.url,
                    impact: "Service Outage",
                    duration: "0",
                    createdById: site.createdById || undefined,
                    currentEscalationStepId: firstStep.id,
                    nextEscalationTime: nextEscalationTime,
                    escalationStepStartTime: firstStep.delayMinutes > 0 ? null : now,
                    currentRepeatCount: 0,
                    stepDelayCompleted: firstStep.delayMinutes === 0,
                },
                include: { website: true }
            });
            
            console.log(`Incident created for ${site.url}: ${incident.id}`);
            console.log(`First step delay: ${firstStep.delayMinutes} minutes, next escalation time: ${nextEscalationTime.toISOString()}`);

            // If no delay for first step, send notification immediately
            if (firstStep.delayMinutes === 0) {
                await sendStepNotification(incident, firstStep, site.url, status, organizationId, escalationPolicy.name);
                
                // Update the incident with the first notification sent
                await prismaClient.incident.update({
                    where: { id: incident.id },
                    data: {
                        currentRepeatCount: 1,
                        escalationStepStartTime: now,
                    },
                });
            }

            return;
        }
    }

    // CRITICAL: Check if it's time to process this incident
    if (incident.nextEscalationTime && now < incident.nextEscalationTime) {
        console.log(`Incident ${incident.id} not ready for escalation. Next escalation time: ${incident.nextEscalationTime.toISOString()}, Current time: ${now.toISOString()}`);
        return;
    }

    console.log(`Processing escalation for incident ${incident.id} for ${site.url}.`);
    
    const sortedSteps = escalationPolicy.steps.sort((a: EscalationStep, b: EscalationStep) => a.stepOrder - b.stepOrder);
    const currentStep = sortedSteps.find(step => step.id === incident.currentEscalationStepId);
    
    if (!currentStep) {
        console.log(`No current step found for incident ${incident.id}. Resolving.`);
        await prismaClient.incident.update({
            where: { id: incident.id },
            data: {
                status: IncidentStatus.RESOLVED,
                endTime: now,
                nextEscalationTime: null,
            },
        });
        return;
    }

    // Check if we need to handle delay period
    if (!incident.stepDelayCompleted) {
        console.log(`Starting step ${currentStep.stepOrder} for incident ${incident.id} (delay period completed)`);
        
        await sendStepNotification(incident, currentStep, site.url, status, organizationId, escalationPolicy.name);
        
        // Calculate next action time based on escalateAfter
        const nextActionTime = new Date(now.getTime() + (currentStep.escalateAfter * 60 * 1000));
        await prismaClient.incident.update({
            where: { id: incident.id },
            data: {
                stepDelayCompleted: true,
                escalationStepStartTime: now,
                currentRepeatCount: 1,
                nextEscalationTime: nextActionTime,
            },
        });
        console.log(`Step ${currentStep.stepOrder} notification sent. Next action in ${currentStep.escalateAfter} minutes at ${nextActionTime.toISOString()}`);
        return;
    }
    
    // Handle repeats or escalation properly
    if (incident.currentRepeatCount < currentStep.repeatCount) {
        // Send repeat notification
        console.log(`Sending repeat ${incident.currentRepeatCount + 1} of step ${currentStep.stepOrder} for incident ${incident.id}`);
        
        await sendStepNotification(incident, currentStep, site.url, status, organizationId, escalationPolicy.name);
        
        const nextRepeatCount = incident.currentRepeatCount + 1;
        
        if (nextRepeatCount < currentStep.repeatCount) {
            // Schedule next repeat after escalateAfter minutes
            const nextRepeatTime = new Date(now.getTime() + (currentStep.escalateAfter * 60 * 1000));
            await prismaClient.incident.update({
                where: { id: incident.id },
                data: {
                    currentRepeatCount: nextRepeatCount,
                    nextEscalationTime: nextRepeatTime,
                },
            });
            console.log(`Scheduled repeat ${nextRepeatCount + 1} for step ${currentStep.stepOrder} in ${currentStep.escalateAfter} minutes at ${nextRepeatTime.toISOString()}`);
            return;
        } else {
            // All repeats done, prepare for next step
            const currentStepIndex = sortedSteps.indexOf(currentStep);
            const nextStepIndex = currentStepIndex + 1;
            
            if (nextStepIndex < sortedSteps.length) {
                // Move to next step
                const nextStep = sortedSteps[nextStepIndex];
                const nextStepStartTime = new Date(now.getTime() + (nextStep.delayMinutes * 60 * 1000));
                
                await prismaClient.incident.update({
                    where: { id: incident.id },
                    data: {
                        currentEscalationStepId: nextStep.id,
                        currentRepeatCount: 0,
                        stepDelayCompleted: nextStep.delayMinutes === 0,
                        escalationStepStartTime: nextStep.delayMinutes === 0 ? now : null,
                        nextEscalationTime: nextStepStartTime,
                    },
                });
                console.log(`Moving to step ${nextStep.stepOrder} after ${nextStep.delayMinutes} minute delay. Next escalation at ${nextStepStartTime.toISOString()}`);
                
                // If no delay for next step, send notification immediately and set proper next escalation time
                if (nextStep.delayMinutes === 0) {
                    await sendStepNotification(incident, nextStep, site.url, status, organizationId, escalationPolicy.name);
                    
                    const nextActionTime = new Date(now.getTime() + (nextStep.escalateAfter * 60 * 1000));
                    await prismaClient.incident.update({
                        where: { id: incident.id },
                        data: {
                            stepDelayCompleted: true,
                            escalationStepStartTime: now,
                            currentRepeatCount: 1,
                            nextEscalationTime: nextActionTime,
                        },
                    });
                    console.log(`Step ${nextStep.stepOrder} notification sent immediately. Next action at ${nextActionTime.toISOString()}`);
                }
                return;
            } else {
                // No more steps - handle termination condition
                if (escalationPolicy.terminationCondition === "repeat_last_step" && 
                    escalationPolicy.repeatLastStepIntervalMinutes) {
                    
                    const nextRepeatTime = new Date(now.getTime() + (escalationPolicy.repeatLastStepIntervalMinutes * 60 * 1000));
                    await prismaClient.incident.update({
                        where: { id: incident.id },
                        data: {
                            currentRepeatCount: 0,
                            stepDelayCompleted: true,
                            nextEscalationTime: nextRepeatTime,
                        },
                    });
                    console.log(`Will repeat last step in ${escalationPolicy.repeatLastStepIntervalMinutes} minutes at ${nextRepeatTime.toISOString()}`);
                    return;
                } else {
                    // Stop after last step - resolve the incident
                    await prismaClient.incident.update({
                        where: { id: incident.id },
                        data: {
                            status: IncidentStatus.RESOLVED,
                            endTime: now,
                            nextEscalationTime: null,
                        },
                    });
                    console.log(`Incident ${incident.id} resolved after completing all escalation steps`);
                    return;
                }
            }
        }
    }
    
    // If we reach here, all repeats for current step are completed, move to next step
    const finalStepIndex = sortedSteps.indexOf(currentStep);
    const finalNextStepIndex = finalStepIndex + 1;
    
    if (finalNextStepIndex < sortedSteps.length) {
        // Move to next step
        const nextStep = sortedSteps[finalNextStepIndex];
        const nextStepStartTime = new Date(now.getTime() + (nextStep.delayMinutes * 60 * 1000));
        
        await prismaClient.incident.update({
            where: { id: incident.id },
            data: {
                currentEscalationStepId: nextStep.id,
                currentRepeatCount: 0,
                stepDelayCompleted: nextStep.delayMinutes === 0,
                escalationStepStartTime: nextStep.delayMinutes === 0 ? now : null,
                nextEscalationTime: nextStepStartTime,
            },
        });
        console.log(`Moving to step ${nextStep.stepOrder} after ${nextStep.delayMinutes} minute delay. Next escalation at ${nextStepStartTime.toISOString()}`);
        
        // If no delay for next step, send notification immediately and set proper next escalation time
        if (nextStep.delayMinutes === 0) {
            await sendStepNotification(incident, nextStep, site.url, status, organizationId, escalationPolicy.name);
            
            const nextActionTime = new Date(now.getTime() + (nextStep.escalateAfter * 60 * 1000));
            await prismaClient.incident.update({
                where: { id: incident.id },
                data: {
                    stepDelayCompleted: true,
                    escalationStepStartTime: now,
                    currentRepeatCount: 1,
                    nextEscalationTime: nextActionTime,
                },
            });
            console.log(`Step ${nextStep.stepOrder} notification sent immediately. Next action at ${nextActionTime.toISOString()}`);
        }
        return;
    }

    // This section should only be reached if we're at the last step and have completed all repeats
    const isLastStep = finalStepIndex === sortedSteps.length - 1;
    
    if (isLastStep && escalationPolicy.terminationCondition === "repeat_last_step" && 
        escalationPolicy.repeatLastStepIntervalMinutes) {
        
        console.log(`Repeating last step ${currentStep.stepOrder} for incident ${incident.id}`);
        await sendStepNotification(incident, currentStep, site.url, status, organizationId, escalationPolicy.name);

        const nextRepeatTime = new Date(now.getTime() + (escalationPolicy.repeatLastStepIntervalMinutes * 60 * 1000));
        await prismaClient.incident.update({
            where: { id: incident.id },
            data: {
                currentRepeatCount: 0,
                nextEscalationTime: nextRepeatTime,
            },
        });
        console.log(`Scheduled repeat of last step in ${escalationPolicy.repeatLastStepIntervalMinutes} minutes at ${nextRepeatTime.toISOString()}`);
    } else if (isLastStep) {
        // Only resolve if we're at the last step and not repeating
        await prismaClient.incident.update({
            where: { id: incident.id },
            data: {
                status: IncidentStatus.RESOLVED,
                endTime: now,
                nextEscalationTime: null,
            },
        });
        console.log(`Incident ${incident.id} resolved - completed all escalation steps`);
    } else {
        // This should not happen - log for debugging
        console.error(`Unexpected state: incident ${incident.id} reached end of logic but not at last step. Current step: ${currentStep.stepOrder}, Total steps: ${sortedSteps.length}`);
    }
}

// Helper function to send step notifications
async function sendStepNotification(incident: any, step: EscalationStep, websiteUrl: string, status: WebsiteStatus, organizationId: string, policyName: string) {
    const recipientEmails = await getRecipientsEmails(step.recipients, organizationId);
    
    for (const email of recipientEmails) {
        await sendEmail(
            email,
            `[${status}] ${websiteUrl} is ${status} - Escalation Step ${step.stepOrder}`,
            'incidentEscalated',
            {
                recipientName: email,
                websiteUrl: websiteUrl,
                status: status,
                incidentId: incident.id,
                serviceName: websiteUrl,
                escalationPolicyName: policyName,
                escalationStep: step.stepOrder,
                customMessage: step.customMessage || 'N/A',
                ctaLink: `${process.env.FRONTEND_URL}/dashboard/incidents/${incident.id}`,
            }
        );
    }
}