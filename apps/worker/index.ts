import axios from "axios";
import { xReadBulk, xAckBulk } from "@uptimematrix/redisstream/client";
import { prismaClient } from "@uptimematrix/store/client";
import { WebsiteStatus } from "@uptimematrix/store/client";
import { handleEscalation } from "./escalation/handleEscalation.js";

const GROUP_NAME = process.env.GROUP_NAME!;
const CONSUMER_NAME = process.env.CONSUMER_NAME!;
if (!GROUP_NAME || !CONSUMER_NAME) throw new Error("GROUP_NAME and CONSUMER_NAME required");

async function workerLoop() {
    console.log("Worker started");

    while (true) {
        const messages = await xReadBulk(GROUP_NAME, CONSUMER_NAME);
        if (!messages || !messages.length) {
            await sleep(2000); // ✅ sleep for 2000ms before checking for new messages
            continue;
        }

        for (const stream of messages) {
            const ackIds: string[] = [];

            const promises = stream.messages.map(async (msg: any) => {
                try {
                    const rawSite = msg.message;
                    
                    // Parse Redis data properly
                    const site = {
                        ...rawSite,
                        checkInterval: rawSite.checkInterval ? parseInt(rawSite.checkInterval) : undefined,
                        regions: rawSite.regions ? JSON.parse(rawSite.regions) : undefined
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
}

async function processWebsite(site: {
    id: string;
    url: string;
    method?: string;
    monitorType?: string;
    escalationPolicyId?: string;
    region?: string;
    checkInterval?: number;
    user_id?: string;   // ✅ fixed (was userId before)
}) {
    const startTime = Date.now();
    try {
        const method = site.method ? site.method.toLowerCase() as "get"|"post"|"put"|"delete"|"head" : "get"; // ✅ lowercase
        const dataOfWebsite = await axios({ url: site.url, method, timeout: 10000 });
        const responseTime = Date.now() - startTime;

        const region = await prismaClient.region.upsert({
            where: { name: site.region || "India" },
            update: {},
            create: { name: site.region || "India" }
        });

        await prismaClient.websiteTick.create({
            data: {
                response_time_ms: responseTime,
                status: WebsiteStatus.Online,
                website_id: site.id,
                region_id: region.id
            }
        });
        if(dataOfWebsite.status !== 200){
            await handleEscalation(site, WebsiteStatus.Offline);
            console.log(`✅ ${site.url} (${region.name}) is offline, ${responseTime}ms`);
        }
    } catch (error) {
        const region = await prismaClient.region.upsert({
            where: { name: site.region || "India" },
            update: {},
            create: { name: site.region || "India" }
        });

        await prismaClient.websiteTick.create({
            data: {
                response_time_ms: 0,
                status: WebsiteStatus.Offline,
                website_id: site.id,
                region_id: region.id
            }
        });

        await handleEscalation(site, WebsiteStatus.Offline);
        console.log(`❌ ${site.url} (${region.name}) is offline`);
    }

    // Get the website from database to ensure we have the correct checkInterval
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
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

workerLoop().catch(console.error);