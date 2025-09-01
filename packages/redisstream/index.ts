import { createClient } from "redis";

type WebsiteEvent = { 
    url: string; 
    id: string; 
    checkInterval?: number;
    method?: string;
    monitorType?: string;
    escalationPolicyId?: string;
    regions?: string[];
    user_id?: string;
    region?: string;
};

export const STREAM_NAME = "betteruptime::website";

let client: ReturnType<typeof createClient>;

async function initClient() {
  client = createClient({url: process.env.REDIS_URL || 'redis://localhost:6379'})
    .on("error", (err) => {
      console.error("Redis Client Error", err);
    });
  await client.connect();
}

await initClient();
console.log("Redis URL in redisstream:", process.env.REDIS_URL);

export async function xGroupCreate(streamName: string, groupName: string) {
  try {
    console.log(`Attempting to create consumer group '${groupName}' for stream '${streamName}'`);
    await client.xGroupCreate(streamName, groupName, '0', { MKSTREAM: true });
    console.log(`Consumer group '${groupName}' created for stream '${streamName}'`);
  } catch (error: any) {
    if (error.message.includes("BUSYGROUP")) {
      console.log(`Consumer group '${groupName}' already exists.`);
    } else {
      console.error("Error creating consumer group:", error);
    }
  }
}

export async function getStreamLength() {
    const length = await client.xLen(STREAM_NAME);
    // console.log(`Stream "${STREAM_NAME}" length:`, length);
    return length;
}

export async function xAdd(website: WebsiteEvent){
    const data: any = {
        url: website.url,
        id: website.id
    };
    
    // Add optional fields if they exist
    if (website.checkInterval !== undefined) data.checkInterval = website.checkInterval.toString();
    if (website.method) data.method = website.method;
    if (website.monitorType) data.monitorType = website.monitorType;
    if (website.escalationPolicyId) data.escalationPolicyId = website.escalationPolicyId;
    if (website.regions) data.regions = JSON.stringify(website.regions);
    if (website.user_id) data.user_id = website.user_id;
    if (website.region) data.region = website.region;
    
    await client.xAdd(STREAM_NAME, "*", data);
}


export async function xAddBulk(websites:WebsiteEvent[]){
    for (let i = 0; i < websites.length; i++) {
        await xAdd(websites[i]!);        
    }    
}


export async function xReadBulk(consumerGroup:string,workerId:string): Promise<any>{
    const res =  await client.xReadGroup(
        consumerGroup,workerId,{
            key:STREAM_NAME,
            id:">"
        },{
            COUNT:5
        }
    )
    console.log("xReadBulk",res);
    return res;
}

async function xAck(consumerGroup:string,eventId:string){
    await client.xAck(STREAM_NAME,consumerGroup,eventId)
}


export async function xAckBulk(consumerGroup:string,eventIds:string[]){
    // 1. Acknowledge each event
    await Promise.all(
        eventIds.map((eventId) => xAck(consumerGroup, eventId))
    );

    // 2. Delete each event from the stream
    if (eventIds.length === 0) return;
    await client.xDel(STREAM_NAME, eventIds);
}



export async function clearStream() {
    const deleted = await client.del(STREAM_NAME);
    console.log(`Stream "${STREAM_NAME}" cleared. Keys deleted: ${deleted}`);
  }
  
export async function trimStream(maxLen: number) {
const trimmed = await client.xTrim(STREAM_NAME, 'MAXLEN', maxLen, { LIMIT: 0 }); // optional LIMIT

console.log(`Stream "${STREAM_NAME}" trimmed. Entries removed: ${trimmed}`);
}

// clearStream();
