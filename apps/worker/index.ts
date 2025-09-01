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
        try {
            const messages = await xReadBulk(GROUP_NAME, CONSUMER_NAME);
            if (!messages || !messages.length) {
                await sleep(1000); // Reduced sleep time for faster processing
                continue;
            }

            for (const stream of messages) {
                const ackIds: string[] = [];

                const promises = stream.messages.map(async (msg: any) => {
                    try {
                        const site = msg.message;
                        console.log(`🔄 Worker processing: ${site.url} (interval: ${site.checkInterval}ms)`);
                        await processWebsite(site);
                        ackIds.push(msg.id);
                    } catch (error) {
                        console.error(`❌ Error processing message ${msg.id}:`, error);
                        // Still acknowledge the message to prevent infinite retries
                        ackIds.push(msg.id);
                    }
                });

                await Promise.all(promises);
                await xAckBulk(GROUP_NAME, ackIds);
                console.log(`✅ Worker acknowledged ${ackIds.length} messages`);
            }
        } catch (error) {
            console.error("❌ Worker loop error:", error);
            await sleep(5000); // Wait before retrying on error
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
    console.log(`🔍 Processing website: ${site.url} `);
    // console.log(`⏰ Received at: ${new Date().toISOString()}`);
    const startTime = Date.now();
    
    // First, check if the website still exists
    const website = await prismaClient.website.findUnique({
        where: { id: site.id }
    });
    
    if (!website) {
        // console.log(`⚠️ Website with ID ${site.id} no longer exists, skipping check`);
        return; // Skip processing if website was deleted
    }
    
    // Process all regions for this website
    const regionsToCheck = website.regions && website.regions.length > 0 ? website.regions : ["India"];
    
    for (const regionName of regionsToCheck) {
        // Upsert region once per region
        const region = await prismaClient.region.upsert({
            where: { name: regionName },
            update: {},
            create: { name: regionName }
        });

        let currentStatus: WebsiteStatus = WebsiteStatus.Offline; // Default to offline
        let responseTimeMs = 0;

        try {
            const method = site.method ? site.method.toLowerCase() as "get"|"post"|"put"|"delete"|"head" : "get";
            const startTime = Date.now();
            await axios({ url: site.url, method, timeout: 10000 });
            responseTimeMs = Date.now() - startTime;
            currentStatus = WebsiteStatus.Online;
            console.log(`✅ ${site.url} is Online in ${regionName}`);
        } catch (error) {
            console.log(`❌ ${site.url} is Offline in ${regionName}`);
            await handleEscalation(site, WebsiteStatus.Offline);
        } finally {
            // Create WebsiteTick once per region, after determining status
            try {
                await prismaClient.websiteTick.create({
                    data: {
                        response_time_ms: responseTimeMs,
                        status: currentStatus,
                        website_id: site.id,
                        region_id: region.id
                    }
                });
            } catch (tickError) {
                // console.error(`Failed to create WebsiteTick for website ${site.id} in ${regionName}:`, tickError);
            }
        }
    }

    // Update website with last check time and next check time
    try {
        // Use the website's specific checkInterval, not the site parameter
        const checkInterval = website.checkInterval || 60000;
        const nextCheckTime = new Date(Date.now() + checkInterval);
        
        let anyRegionOnline = false;
        const recentTicks = await prismaClient.websiteTick.findMany({
            where: { website_id: site.id },
            orderBy: { createdAt: 'desc' },
            take: regionsToCheck.length
        });
        
        if (recentTicks && recentTicks.length > 0) {
            anyRegionOnline = recentTicks.some(tick => tick.status === WebsiteStatus.Online);
        }
        
        await prismaClient.website.update({
            where: { id: site.id },
            data: {
                lastChecked: new Date(),
                nextCheckTime: nextCheckTime,
                currently_upForIndays: anyRegionOnline ? { increment: 1 } : { set: 0 }
            }
        });
        
        console.log(`⏰ Next check for ${site.url} scheduled for: ${nextCheckTime.toISOString()} (interval: ${checkInterval}ms)`);
        
    } catch (updateError) {
        console.error(`Failed to update website ${site.id}:`, updateError);
    }
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

workerLoop().catch(console.error);
