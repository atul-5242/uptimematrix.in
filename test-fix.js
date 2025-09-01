// Test script to verify website monitoring system
// Run this after starting your pusher and worker

const { PrismaClient } = require('@uptimematrix/store');

const prisma = new PrismaClient();

async function testWebsiteMonitoring() {
    try {
        console.log('🧪 Testing Website Monitoring System...\n');
        
        // 1. Check all websites in database
        console.log('1️⃣ All websites in database:');
        const allWebsites = await prisma.website.findMany({
            select: {
                id: true,
                name: true,
                url: true,
                checkInterval: true,
                nextCheckTime: true,
                lastChecked: true,
                currently_upForIndays: true
            },
            orderBy: { timeAdded: 'desc' }
        });
        
        if (allWebsites.length === 0) {
            console.log('   ❌ No websites found in database');
            return;
        }
        
        allWebsites.forEach((site, index) => {
            const now = new Date();
            const timeUntilDue = site.nextCheckTime ? 
                Math.round((site.nextCheckTime.getTime() - now.getTime()) / 1000) : 
                'Unknown';
            const status = typeof timeUntilDue === 'number' && timeUntilDue <= 0 ? '🟢 Due for check' : '⏰ Waiting';
            
            console.log(`   ${index + 1}. ${status} - ${site.name} (${site.url}):`);
            console.log(`      - ID: ${site.id}`);
            console.log(`      - Interval: ${site.checkInterval}ms (${Math.round(site.checkInterval / 1000)}s)`);
            console.log(`      - Next check: ${site.nextCheckTime?.toISOString() || 'Not set'}`);
            console.log(`      - Last checked: ${site.lastChecked?.toISOString() || 'Never'}`);
            console.log(`      - Uptime days: ${site.currently_upForIndays}`);
            console.log(`      - Time until due: ${timeUntilDue}s`);
            console.log('');
        });
        
        // 2. Check websites due for checking
        console.log('2️⃣ Websites due for checking:');
        const now = new Date();
        const dueWebsites = await prisma.website.findMany({
            where: {
                OR: [
                    { nextCheckTime: { lte: now } },
                    { nextCheckTime: { equals: null } }
                ]
            },
            select: { id: true, name: true, url: true, nextCheckTime: true }
        });
        
        if (dueWebsites.length === 0) {
            console.log('   ⏰ No websites due for checking');
        } else {
            dueWebsites.forEach((site, index) => {
                const timeUntilDue = site.nextCheckTime ? 
                    Math.round((now.getTime() - site.nextCheckTime.getTime()) / 1000) : 
                    'Unknown';
                console.log(`   ${index + 1}. ${site.name} (${site.url}) - due ${timeUntilDue}s ago`);
            });
        }
        
        // 3. Check recent website ticks
        console.log('\n3️⃣ Recent website ticks:');
        const recentTicks = await prisma.websiteTick.findMany({
            select: {
                id: true,
                status: true,
                response_time_ms: true,
                createdAt: true,
                website: { select: { name: true, url: true } },
                region: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        
        if (recentTicks.length === 0) {
            console.log('   ❌ No website ticks found');
        } else {
            recentTicks.forEach((tick, index) => {
                const timeAgo = Math.round((Date.now() - tick.createdAt.getTime()) / 1000);
                console.log(`   ${index + 1}. ${tick.website.name} (${tick.website.url}) - ${tick.status} in ${tick.region.name} - ${timeAgo}s ago`);
            });
        }
        
        // 4. Test creating a new website (if you want)
        console.log('\n4️⃣ To test new website creation, use your frontend or API');
        console.log('   The pusher should pick up new websites immediately now');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the test
testWebsiteMonitoring();
