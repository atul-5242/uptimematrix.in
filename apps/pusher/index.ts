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
            
            // Only fetch websites that are due for checking
            const websites = await prismaClient.website.findMany({ 
                where: {
                    OR: [
                      { nextCheckTime: { lte: now } },    // due
                      { nextCheckTime: { equals: null } } // never scheduled
                    ]
                  },
                  include: {
                    ticks: {
                      orderBy: { createdAt: "desc" },
                      take: 100, // last 100 ticks (for uptime/avg calculation)
                    },
                  },
            });

            if (websites.length > 0) {
                console.log(`📋 Found ${websites.length} websites due for checking:`);
                websites.forEach(site => {
                    const intervalSeconds = Math.round((site.checkInterval || 60000) / 1000);
                    console.log(`   - ${site.url} (interval: ${intervalSeconds}s)`);
                });
                
                const messages: any[] = [];
                
                // Process each website only once, regardless of regions
                websites.forEach(site => {
                    // Double-check that the website still exists and has valid data
                    if (site.id && site.url) {
                        // Only send one message per website, not per region
                        // The worker will handle all regions for that website
                        messages.push({ 
                            ...site, 
                            region: site.regions?.[0] || "India" // Use first region as default
                        });
                        
                    } else {
                        console.warn(`⚠️ Skipping website with invalid data:`, site);
                    }
                });
                
                if (messages.length > 0) {
                    await xAddBulk(messages);
                    console.log(`✅ Queued ${messages.length} website checks`);
                }
            } else {
                console.log(`⏰ No websites due for checking at ${now.toISOString()}`);
                
                // Show some websites that are NOT due yet for debugging
                const futureWebsites = await prismaClient.website.findMany({
                    where: { nextCheckTime: { gt: now } },
                    select: { url: true, nextCheckTime: true, checkInterval: true },
                    take: 3,
                    orderBy: { nextCheckTime: 'asc' }
                });
                
                if (futureWebsites.length > 0) {
                    console.log(`🔮 Next websites to be checked:`);
                    futureWebsites.forEach(site => {
                        const timeUntilDue = site.nextCheckTime ? 
                            Math.round((site.nextCheckTime.getTime() - now.getTime()) / 1000) : 
                            'Unknown';
                        const intervalSeconds = Math.round((site.checkInterval || 60000) / 1000);
                        console.log(`   - ${site.url} (in ${timeUntilDue}s, interval: ${intervalSeconds}s)`);
                    });
                }
            }
        } catch (error) {
            console.error("Error in pushWebsites loop:", error);
        }
        
        // Dynamic sleep based on next website due time
        const nextSleepTime = await calculateOptimalSleepTime();
        console.log(`💤 Sleeping for ${nextSleepTime}ms until next check`);
        await sleep(nextSleepTime);
    }
}

// Calculate optimal sleep time based on when the next website is due
async function calculateOptimalSleepTime(): Promise<number> {
    try {
        const now = new Date();
        const nextWebsite = await prismaClient.website.findFirst({
            where: { nextCheckTime: { gt: now } },
            select: { nextCheckTime: true, checkInterval: true },
            orderBy: { nextCheckTime: 'asc' }
        });
        
        if (nextWebsite && nextWebsite.nextCheckTime) {
            const timeUntilNext = nextWebsite.nextCheckTime.getTime() - now.getTime();
            // Sleep for 80% of the time until next check, but minimum 1 second, maximum 10 seconds
            const optimalSleep = Math.max(1000, Math.min(10000, Math.floor(timeUntilNext * 0.8)));
            return optimalSleep;
        }
        
        // Default to 5 seconds if no websites found
        return 5000;
    } catch (error) {
        console.error("Error calculating sleep time:", error);
        return 5000; // fallback
    }
}

// Test function to manually check all websites (for debugging)
async function testCheckAllWebsites() {
    try {
        console.log("🧪 Testing: Checking all websites manually...");
        const allWebsites = await prismaClient.website.findMany({
            select: { 
                id: true, 
                url: true, 
                method: true, 
                monitorType: true, 
                checkInterval: true, 
                escalationPolicyId: true, 
                regions: true, 
                user_id: true,
                nextCheckTime: true
            }
        });
        
        if (allWebsites.length > 0) {
            const messages = allWebsites.map(site => ({ 
                ...site, 
                region: site.regions?.[0] || "India"
            }));
            
            await xAddBulk(messages);
            console.log(`🧪 Test: Queued ${messages.length} website checks manually`);
            
            // Show timing info for each website
            const now = new Date();
            allWebsites.forEach(site => {
                const timeUntilDue = site.nextCheckTime ? 
                    Math.round((site.nextCheckTime.getTime() - now.getTime()) / 1000) : 
                    'Unknown';
                console.log(`🧪   - ${site.url}: next check in ${timeUntilDue}s (interval: ${site.checkInterval}ms)`);
            });
        } else {
            console.log("🧪 Test: No websites found in database");
        }
    } catch (error) {
        console.error("🧪 Test error:", error);
    }
}

// Add a function to reset all website timings to be checked immediately
async function resetAllWebsiteTimings() {
    try {
        console.log("🔄 Resetting all website timings to be checked immediately...");
        const result = await prismaClient.website.updateMany({
            data: {
                nextCheckTime: new Date(Date.now() - 1000) // Set to 1 second ago
            }
        });
        console.log(`🔄 Reset ${result.count} websites to be checked immediately`);
    } catch (error) {
        console.error("🔄 Reset error:", error);
    }
}

// Function to manually check a specific website
async function checkSpecificWebsite(websiteId: string) {
    try {
        console.log(`🎯 Manually checking website with ID: ${websiteId}`);
        const website = await prismaClient.website.findUnique({
            where: { id: websiteId },
            select: { 
                id: true, 
                url: true, 
                method: true, 
                monitorType: true, 
                checkInterval: true, 
                escalationPolicyId: true, 
                regions: true, 
                user_id: true,
                nextCheckTime: true
            }
        });
        
        if (website) {
            const message = { 
                ...website, 
                region: website.regions?.[0] || "India"
            };
            
            await xAddBulk([message]);
            console.log(`🎯 Queued manual check for ${website.url}`);
            console.log(`   - Current nextCheckTime: ${website.nextCheckTime?.toISOString()}`);
            console.log(`   - Check interval: ${website.checkInterval}ms`);
        } else {
            console.log(`❌ Website with ID ${websiteId} not found`);
        }
    } catch (error) {
        console.error("🎯 Manual check error:", error);
    }
}

// Function to show current state of all websites
async function showAllWebsitesStatus() {
    try {
        console.log("📊 Current status of all websites:");
        const allWebsites = await prismaClient.website.findMany({
            select: { 
                id: true, 
                url: true, 
                checkInterval: true, 
                nextCheckTime: true, 
                lastChecked: true,
                currently_upForIndays: true
            },
            orderBy: { timeAdded: 'desc' }
        });
        
        if (allWebsites.length > 0) {
            const now = new Date();
            allWebsites.forEach(site => {
                const timeUntilDue = site.nextCheckTime ? 
                    Math.round((site.nextCheckTime.getTime() - now.getTime()) / 1000) : 
                    'Unknown';
                const status = typeof timeUntilDue === 'number' && timeUntilDue <= 0 ? '🟢 Due for check' : '⏰ Waiting';
                console.log(`   ${status} - ${site.url}:`);
                console.log(`     - ID: ${site.id}`);
                console.log(`     - Interval: ${site.checkInterval}ms (${Math.round(site.checkInterval / 1000)}s)`);
                console.log(`     - Next check: ${site.nextCheckTime?.toISOString() || 'Not set'}`);
                console.log(`     - Last checked: ${site.lastChecked?.toISOString() || 'Never'}`);
                console.log(`     - Uptime days: ${site.currently_upForIndays}`);
                console.log(`     - Time until due: ${timeUntilDue}s`);
                console.log('');
            });
        } else {
            console.log("📊 No websites found in database");
        }
    } catch (error) {
        console.error("📊 Status check error:", error);
    }
}

// Uncomment the line below to test manual website checking
// testCheckAllWebsites();

// Uncomment the line below to reset all website timings
// resetAllWebsiteTimings();

// Uncomment the line below to check a specific website (replace with actual ID)
// checkSpecificWebsite("your-website-id-here");

// Uncomment the line below to show all websites status
// showAllWebsitesStatus();

// Add a startup function to ensure all websites have proper nextCheckTime
async function initializeWebsiteTimings() {
    try {
        console.log("🚀 Initializing website timings...");
        
        // Find websites with null or past nextCheckTime
        const websitesNeedingInit = await prismaClient.website.findMany({
            where: {
                OR: [
                    { nextCheckTime: null },
                    { nextCheckTime: { lte: new Date() } }
                ]
            },
            select: { id: true, url: true, checkInterval: true, nextCheckTime: true }
        });
        
        if (websitesNeedingInit.length > 0) {
            console.log(`🔧 Found ${websitesNeedingInit.length} websites needing timing initialization`);
            
            for (const website of websitesNeedingInit) {
                const nextCheckTime = new Date(Date.now() + (website.checkInterval || 60000));
                await prismaClient.website.update({
                    where: { id: website.id },
                    data: { nextCheckTime }
                });
                
                const intervalSeconds = Math.round((website.checkInterval || 60000) / 1000);
                console.log(`   ✅ ${website.url}: next check in ${intervalSeconds}s`);
            }
        } else {
            console.log("✅ All websites have proper timing configuration");
        }
    } catch (error) {
        console.error("❌ Error initializing website timings:", error);
    }
}

// Recovery function to catch missed websites
async function recoveryCheck() {
    try {
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        
        // Find websites that should have been checked but weren't
        const missedWebsites = await prismaClient.website.findMany({
            where: {
                nextCheckTime: { lte: fiveMinutesAgo } // Should have been checked 5+ minutes ago
            },
            select: { id: true, url: true, checkInterval: true, nextCheckTime: true, lastChecked: true }
        });
        
        if (missedWebsites.length > 0) {
            console.log(`🚨 Recovery: Found ${missedWebsites.length} missed websites, forcing immediate check`);
            
            // Reset their nextCheckTime to now so they get picked up immediately
            await prismaClient.website.updateMany({
                where: {
                    id: { in: missedWebsites.map(w => w.id) }
                },
                data: {
                    nextCheckTime: now
                }
            });
            
            missedWebsites.forEach(site => {
                console.log(`   🔄 Recovering: ${site.url}`);
            });
        }
    } catch (error) {
        console.error("❌ Recovery check error:", error);
    }
}

// Run recovery check every 2 minutes
setInterval(recoveryCheck, 2 * 60 * 1000);

// Initialize timings before starting the main loop
initializeWebsiteTimings().then(() => {
    pushWebsites().catch(console.error);
});

function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }
