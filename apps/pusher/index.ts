import { prismaClient } from "@uptimematrix/store";
import { xAddBulk, xGroupCreate, STREAM_NAME } from "@uptimematrix/redisstream/client";

const GROUP_NAME = process.env.GROUP_NAME!;
if (!GROUP_NAME) throw new Error("GROUP_NAME is required");

async function pushWebsites() {
    console.log("Pusher started");

    await xGroupCreate(STREAM_NAME, GROUP_NAME);

    while (true) {
        try {
            const now = new Date();
            console.log(`\n🕐 Pusher check at: ${now.toISOString()}`);
            
            const websites = await prismaClient.website.findMany({ 
                where: { 
                    OR: [
                        { nextCheckTime: { lte: now } },
                        { nextCheckTime: null }
                    ]
                }, 
                select: { 
                    id: true, 
                    url: true, 
                    method: true, 
                    monitorType: true, 
                    checkInterval: true, 
                    escalationPolicyId: true, 
                    regions: true, 
                    user_id: true,
                    nextCheckTime: true,
                    lastChecked: true
                } 
            });

            if (websites.length > 0) {
                console.log(`📋 Found ${websites.length} websites due for checking:`);
                websites.forEach(site => {
                    const intervalSeconds = Math.round((site.checkInterval || 60000) / 1000);
                    const nextCheck = site.nextCheckTime ? site.nextCheckTime.toISOString() : 'null';
                    console.log(`   - ${site.url} (interval: ${intervalSeconds}s, next: ${nextCheck})`);
                });

                const messages: any[] = [];
                websites.forEach(site => {
                    // Send one message per website, not per region - worker will handle all regions
                    const message = { 
                        ...site, 
                        region: site.regions?.[0] || "India" 
                    };
                    messages.push(message);
                });
                
                console.log(`📤 About to send ${messages.length} messages to Redis`);
                await xAddBulk(messages);
                console.log(`✅ Queued ${messages.length} website checks`);
                
                // Immediately update nextCheckTime to prevent re-queuing
                const updatePromises = websites.map(site => 
                    prismaClient.website.update({
                        where: { id: site.id },
                        data: { 
                            nextCheckTime: new Date(Date.now() + (site.checkInterval || 60000))
                        }
                    })
                );
                await Promise.all(updatePromises);
                console.log(`🔄 Updated nextCheckTime for ${websites.length} websites`);
            } else {
                console.log(`⏰ No websites due for checking at ${now.toISOString()}`);
                
                // Show next websites to be checked
                const nextWebsites = await prismaClient.website.findMany({
                    where: { nextCheckTime: { gt: now } },
                    select: { url: true, nextCheckTime: true, checkInterval: true },
                    orderBy: { nextCheckTime: 'asc' },
                    take: 3
                });
                
                if (nextWebsites.length > 0) {
                    console.log(`🔮 Next websites to check:`);
                    nextWebsites.forEach(site => {
                        const timeUntil = site.nextCheckTime ? 
                            Math.round((site.nextCheckTime.getTime() - now.getTime()) / 1000) : 
                            'unknown';
                        console.log(`   - ${site.url} (in ${timeUntil}s)`);
                    });
                }
            }
        } catch (error) {
            console.error("❌ Pusher error:", error);
        }
        
        await sleep(5000); // Check every 5 seconds
    }
}

function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

pushWebsites().catch(console.error);