import { prismaClient } from "@uptimematrix/store";
import { xAddBulk, xGroupCreate, STREAM_NAME } from "@uptimematrix/redisstream/client";

const GROUP_NAME = process.env.GROUP_NAME!;
if (!GROUP_NAME) throw new Error("GROUP_NAME is required");

async function pushWebsites() {
    console.log("Pusher started");

    await xGroupCreate(STREAM_NAME, GROUP_NAME);

    while (true) {
        const now = new Date();
        const websites = await prismaClient.website.findMany({ where: { nextCheckTime: { lte: now } }, select: { id: true, url: true, method: true, monitorType: true, checkInterval: true, escalationPolicyId: true, regions: true, user_id: true } });

        if (websites.length > 0) {
            const messages: any[] = [];
            websites.forEach(site => (site.regions || ["India"]).forEach(region => messages.push({ ...site, region })));
            await xAddBulk(messages);
            console.log(`Queued ${messages.length} website-region checks`);
        }
        await sleep(2000);
    }
}

function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

pushWebsites().catch(console.error);
