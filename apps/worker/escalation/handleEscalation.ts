import { prismaClient } from "@uptimematrix/store/client";
import { WebsiteStatus } from "@uptimematrix/store/client";
import { sendEmail, sendSlack, sendWebhook, sendSMS } from "./../notifications/index.js";

export async function handleEscalation(
    site: { id: string, url: string, escalationPolicyId?: string, userId?: string, region?: string },
    status: WebsiteStatus
) {
    const regionName = site.region || "India";
    const userEmail = await getUserEmail(site.userId);

    if (!site.escalationPolicyId) {
        // Default fallback notification
        await sendEmail(
            userEmail!,
            `Website ${site.url} is ${status}`,
            `Website ${site.url} in region ${regionName} is ${status}`
        );
        return;
    }

    const policy = await prismaClient.escalationPolicy.findUnique({
        where: { id: site.escalationPolicyId },
        include: { steps: true },
    });

    if (!policy || !policy.isActive) {
        // Fallback to direct email if no active policy
        await sendEmail(
            userEmail!,
            `Website ${site.url} is ${status}`,
            `Website ${site.url} in region ${regionName} is ${status}`
        );
        return;
    }

    // Sort steps by stepOrder
    const steps = policy.steps.sort((a, b) => a.stepOrder - b.stepOrder);

    for (const step of steps) {
        // Delay before step starts
        if (step.delayMinutes && step.delayMinutes > 0) {
            await sleep(step.delayMinutes * 60 * 1000);
        }

        const message = `[${status}] Website ${site.url} (${regionName})\nPolicy: ${policy.name}\nStep: ${step.stepOrder}`;

        // Email notifications
        if (step.primaryMethods.includes("email") || step.additionalMethods.includes("email")) {
            for (const email of step.recipients) {
                await sendEmail(email, `Alert: Website ${site.url}`, message);
            }
        }

        // Slack notifications
        if (step.primaryMethods.includes("slack") || step.additionalMethods.includes("slack")) {
            for (const webhook of step.recipients) {
                await sendSlack(webhook, message);
            }
        }

        // Webhook notifications
        if (step.primaryMethods.includes("webhook") || step.additionalMethods.includes("webhook")) {
            for (const webhook of step.recipients) {
                await sendWebhook(webhook, message);
            }
        }

        // SMS notifications
        if (step.primaryMethods.includes("sms") || step.additionalMethods.includes("sms")) {
            for (const phone of step.recipients) {
                await sendSMS(phone, message);
            }
        }

        // Escalate to next step after waiting
        if (step.escalateAfter && step.escalateAfter > 0) {
            await sleep(step.escalateAfter * 60 * 1000);
        }
    }
}

async function getUserEmail(userId?: string) {
    if (!userId) return "admin@example.com"; // fallback email
    const user = await prismaClient.user.findUnique({ where: { id: userId } });
    // return user?.email || "user@example.com"; // ✅ fixed to use `email` field, not `username`
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
