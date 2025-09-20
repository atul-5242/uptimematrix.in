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
    return user?.email || "user@example.com"; // Fallback email
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

    // Add emails from direct user assignments
    schedule.userAssignments.forEach(assignment => {
        if (assignment.user?.email && !addedEmails.has(assignment.user.email)) {
            emails.push(assignment.user.email);
            addedEmails.add(assignment.user.email);
        }
    });

    // Add emails from team assignments within the schedule
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
        // Regex to check if the recipientId looks like an email address
        const isEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(recipientId);

        if (isEmail) {
            // If it's an email, try to find an organization member by user email and organizationId
            const organizationMemberByEmail = await prismaClient.organizationMember.findFirst({
                where: {
                    organizationId: organizationId,
                    user: {
                        email: recipientId, // Filter by user's email
                    },
                },
                include: { user: { select: { email: true } } },
            });
            if (organizationMemberByEmail?.user?.email && !addedEmails.has(organizationMemberByEmail.user.email)) {
                allEmails.push(organizationMemberByEmail.user.email);
                addedEmails.add(organizationMemberByEmail.user.email);
            }
            continue; // Move to next recipientId
        }

        // Try to find if it's a direct user within the organization (by ID)
        const organizationMember = await prismaClient.organizationMember.findFirst({
            where: { userId: recipientId, organizationId: organizationId },
            include: { user: { select: { email: true } } },
        });
        if (organizationMember?.user?.email && !addedEmails.has(organizationMember.user.email)) {
            allEmails.push(organizationMember.user.email);
            addedEmails.add(organizationMember.user.email);
            continue;
        }

        // Try to find if it's a team
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

        // Try to find if it's an on-call schedule
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
                priorityLevel: true // Select priorityLevel
            }
        });
    }

    // Scenario 1: escalationPolicyId was provided but the policy was not found
    if (site.escalationPolicyId && !escalationPolicy) {
        console.error(`Escalation policy with ID ${site.escalationPolicyId} not found for website ${site.url}. Cannot process escalation.`);
        // Log and exit, as we cannot proceed with a non-existent policy.
        // A generic incident might still be created by processWebsite, but no escalation will occur.
        return;
    }

    // Scenario 2: No escalationPolicyId was provided, or policy was found but is inactive.
    // This block now specifically handles cases where there's no policy to act on.
    if (!escalationPolicy || !escalationPolicy.isActive) {
        console.log(`No active or valid escalation policy found for website ${site.url}. Sending generic notification.`);
        const adminEmails = await getRecipientsEmails([site.createdById || ""], organizationId);
        for (const email of adminEmails) {
            await sendEmail(
                email,
                `[${status}] ${site.url} is ${status} - No Active Policy`,
                'generic', // Template name
                { 
                    websiteUrl: site.url,
                    status: status,
                    // Additional context can be added here
                }
            );
        }
        // Create a basic incident for tracking if one doesn't already exist
        if (!incident) {
            const websiteDetails = await prismaClient.website.findUnique({ where: { id: site.id } });
            if (websiteDetails) {
                incident = await prismaClient.incident.create({
                    data: {
                        website: { connect: { id: site.id } },
                        organization: { connect: { id: websiteDetails.organizationId } },
                        status: IncidentStatus.RESOLVED, // Resolved if no policy to act on
                        severity: IncidentSeverity.NONE, // No specific severity
                        Acknowledged: false,
                        startTime: new Date(),
                        title: `${site.url} is ${status} (No Policy)`,
                        serviceName: site.url,
                        impact: "No Policy/Generic Notification",
                        duration: "0",
                        createdById: site.createdById || undefined,
                    }
                });
            }
        }
        return; // Exit if no policy to follow
    }

    // Scenario 3: Policy exists but is inactive
    // At this point, if escalationPolicy is non-null, it is guaranteed to have steps due to API validation.
    if (escalationPolicy && !escalationPolicy.isActive) {
        console.log(`Escalation policy for website ${site.url} is inactive. Sending generic notification.`);
        const adminEmails = await getRecipientsEmails([site.createdById || ""], organizationId);
        for (const email of adminEmails) {
        await sendEmail(
                email,
                `[${status}] ${site.url} is ${status} - Inactive Policy`,
                'generic', // Template name
                { 
                    websiteUrl: site.url,
                    status: status,
                    // Additional context can be added here
                }
            );
        }
        if (!incident) {
            const websiteDetails = await prismaClient.website.findUnique({ where: { id: site.id } });
            if (websiteDetails) {
                incident = await prismaClient.incident.create({
                    data: {
                        website: { connect: { id: site.id } },
                        organization: { connect: { id: websiteDetails.organizationId } },
                        status: IncidentStatus.RESOLVED, // Resolved if no policy to act on
                        severity: IncidentSeverity.NONE, // No specific severity
                        Acknowledged: false,
                        startTime: new Date(),
                        title: `${site.url} is ${status} (Inactive Policy)`,
                        serviceName: site.url,
                        impact: "Inactive Policy",
                        duration: "0",
                        createdById: site.createdById || undefined,
                    }
                });
            }
        }
        return; // Exit if policy cannot be followed
    }

    // At this point, if escalationPolicy is non-null, it is guaranteed to be active and have steps.
    // If escalationPolicy is null, it means no policy was specified, and we've already handled the generic notification above.

    if (currentIncidentId) {
        incident = await prismaClient.incident.findUnique({
            where: { id: currentIncidentId },
            include: { website: true }
        });
    }

    if (!incident) {
        // Create a new incident if none exists or provided incident ID is invalid
        const websiteDetails = await prismaClient.website.findUnique({ where: { id: site.id } });
        if (!websiteDetails) {
            console.error(`Website ${site.id} not found when trying to create an incident.`);
            return;
        }

        incident = await prismaClient.incident.create({
            data: {
                website: { connect: { id: site.id } },
                organization: { connect: { id: websiteDetails.organizationId } },
                status: IncidentStatus.INVESTIGATING, // Using IncidentStatus directly
                severity: escalationPolicy?.priorityLevel ? mapPriorityToIncidentSeverity(escalationPolicy.priorityLevel) : IncidentSeverity.MAJOR, // Use policy priority or default
                Acknowledged: false,
                startTime: new Date(),
                title: `${site.url} is ${status}`,
                serviceName: site.url,
                impact: "Service Outage",
                duration: "0",
                createdById: site.createdById || undefined,
            },
            include: { website: true }
        });
        console.log(`Incident created for ${site.url}: ${incident.id}`);

        // Send incident created notification
        const incidentCreatedEmails = await getRecipientsEmails(escalationPolicy.steps[0].recipients, organizationId);
        for (const email of incidentCreatedEmails) {
            await sendEmail(
                email,
                `[${status}] Incident Created for ${site.url}`,
                'incidentCreated', // Template name
                {
                    recipientName: email, // Placeholder, will be replaced with actual recipient name if available
                    websiteUrl: site.url,
                    status: status,
                    incidentId: incident.id,
                    serviceName: site.url,
                    impact: "Service Outage",
                    details: `${site.url} is currently ${status}.`,
                    ctaLink: `${process.env.FRONTEND_URL}/dashboard/incidents/${incident.id}`,
                }
            );
        }

    } else {
        console.log(`Incident ${incident.id} already exists for ${site.url}.`);
    }

    // If we reach here and escalationPolicy is null, it means no policy was ever specified.
    // This case should ideally be handled by the generic notification above.
    // For safety, ensure escalationPolicy is present before proceeding with steps logic.
    if (!escalationPolicy) {
        console.error(`Attempted to process escalation steps for ${site.url} but no valid escalation policy is available. This should have been caught earlier.`);
        return; // Should not happen if previous checks are robust
    }

    const sortedSteps = escalationPolicy.steps.sort((a: EscalationStep, b: EscalationStep) => a.stepOrder - b.stepOrder);
    let nextStep = sortedSteps[escalationStepIndex];
    
    /*
        However, in distributed systems with potential race conditions, 
        unexpected message re-deliveries, or unforeseen edge cases, it's possible 
        (though unlikely) for handleEscalation to receive an escalationStepIndex that 
        no longer corresponds to a valid step. This defensive if (!nextStep) block would 
        then catch that and ensure the incident is marked as RESOLVED, preventing an infinite 
        loop or unhandled error.However, in distributed systems with potential race conditions, 
        unexpected message re-deliveries, or unforeseen edge cases, it's possible (though unlikely) 
        for handleEscalation to receive an escalationStepIndex that no longer corresponds to a 
        valid step. This defensive if (!nextStep) block would then catch that and ensure 
        the incident is marked as RESOLVED, preventing an infinite loop or unhandled error.
    */
    
    if (!nextStep) {
        console.log(`No more escalation steps for ${site.url}. Incident ${incident?.id} fully escalated.`);
        await prismaClient.incident.update({
            where: { id: incident.id },
            data: {
                status: IncidentStatus.RESOLVED,
                endTime: new Date(),
                nextEscalationTime: null,
            },
        });
        return;
    }

    console.log(`Escalating incident ${incident.id} for ${site.url} to step ${nextStep.stepOrder + 1}.`);

    // Send notification for the current step (using incidentEscalated template)
    const recipientEmails = await getRecipientsEmails(nextStep.recipients, organizationId);
    for (const email of recipientEmails) {
        await sendEmail(
            email,
            `[${status}] ${site.url} is ${status} - Escalation Step ${nextStep.stepOrder + 1}`,
            'incidentEscalated', // Template name
            {
                recipientName: email, // Placeholder
                websiteUrl: site.url,
                status: status,
                incidentId: incident.id,
                serviceName: site.url,
                escalationPolicyName: escalationPolicy.name,
                escalationStep: nextStep.stepOrder + 1,
                customMessage: nextStep.customMessage || 'N/A',
                ctaLink: `${process.env.FRONTEND_URL}/dashboard/incidents/${incident.id}`,
            }
        );
    }

    // Schedule the next escalation step
    const nextEscalationTime = nextStep.escalateAfter
        ? new Date(Date.now() + nextStep.escalateAfter * 60 * 1000)
        : null;

    await prismaClient.incident.update({
        where: { id: incident.id },
        data: {
            currentEscalationStepId: nextStep.id,
            nextEscalationTime: nextEscalationTime,
            status: IncidentStatus.INVESTIGATING,
        },
    });
}
