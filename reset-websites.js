// Script to reset all website timings for testing
// This will make all websites due for checking immediately

const { PrismaClient } = require('@uptimematrix/store');

const prisma = new PrismaClient();

async function resetAllWebsiteTimings() {
    try {
        console.log('🔄 Resetting all website timings...\n');
        
        // Get current count
        const currentCount = await prisma.website.count();
        console.log(`📊 Found ${currentCount} websites in database`);
        
        if (currentCount === 0) {
            console.log('❌ No websites to reset');
            return;
        }
        
        // Reset all websites to be checked immediately
        const result = await prisma.website.updateMany({
            data: {
                nextCheckTime: new Date(Date.now() - 1000) // Set to 1 second ago
            }
        });
        
        console.log(`✅ Reset ${result.count} websites to be checked immediately`);
        
        // Verify the reset
        const resetWebsites = await prisma.website.findMany({
            select: { id: true, name: true, url: true, nextCheckTime: true }
        });
        
        console.log('\n📋 Reset websites:');
        resetWebsites.forEach((site, index) => {
            const now = new Date();
            const timeUntilDue = site.nextCheckTime ? 
                Math.round((now.getTime() - site.nextCheckTime.getTime()) / 1000) : 
                'Unknown';
            console.log(`   ${index + 1}. ${site.name} (${site.url}) - due ${timeUntilDue}s ago`);
        });
        
        console.log('\n🎯 All websites are now due for checking!');
        console.log('   Start your pusher and worker to see them being processed.');
        
    } catch (error) {
        console.error('❌ Reset failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the reset
resetAllWebsiteTimings();
