import * as cron from 'node-cron';
import { prismaClient } from '@uptimematrix/store';
import { config } from 'dotenv';

// Load environment variables
config();

const REGION = process.env.REGION!;
if (!REGION) throw new Error("REGION is required");

async function cleanupOldTicks() {
    try {
        console.log(`🧹 Starting cleanup of old website ticks for region: ${REGION}`);
        
        // Calculate the date 2 days ago (keep only current and previous day)
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        twoDaysAgo.setHours(0, 0, 0, 0); // Set to start of day
        
        console.log(`🗓️ Deleting website ticks older than: ${twoDaysAgo.toISOString()}`);
        
        // Get the region ID for the current region
        const region = await prismaClient.region.findUnique({
            where: { name: REGION }
        });
        
        if (!region) {
            console.error(`❌ Region ${REGION} not found. Skipping cleanup.`);
            return;
        }
        
        // Delete old website ticks for this region only
        const deleteResult = await prismaClient.websiteTick.deleteMany({
            where: {
                AND: [
                    {
                        createdAt: {
                            lt: twoDaysAgo
                        }
                    },
                    {
                        region_id: region.id
                    }
                ]
            }
        });
        
        console.log(`✅ Cleanup completed. Deleted ${deleteResult.count} old website ticks from region: ${REGION}`);
        
        // Log some statistics
        const remainingTicks = await prismaClient.websiteTick.count({
            where: {
                region_id: region.id
            }
        });
        
        console.log(`📊 Remaining website ticks in ${REGION}: ${remainingTicks}`);
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    }
}

async function startCronService() {
    console.log(`🚀 Cron service started for region: ${REGION}`);
    console.log('⏰ Scheduled to run daily at 00:30 (12:30 AM)');
    
    // Run cleanup every day at 00:30 (12:30 AM)
    cron.schedule('30 0 * * *', async () => {
        console.log(`🕐 Daily cleanup triggered at: ${new Date().toISOString()}`);
        await cleanupOldTicks();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata" // Indian timezone
    });
    
    // Run initial cleanup on startup (optional)
    console.log('🔄 Running initial cleanup on startup...');
    await cleanupOldTicks();
    
    // Keep the process alive
    console.log('✅ Cron service is running and waiting for scheduled tasks...');
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

// Start the cron service
startCronService().catch((error) => {
    console.error('❌ Failed to start cron service:', error);
    process.exit(1);
});
