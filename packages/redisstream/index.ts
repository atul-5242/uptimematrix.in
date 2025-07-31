import { createClient } from "redis";
type WebsiteEvent = {url:string,id:string}

const STREAM_NAME = "betteruptime::website";

const client = await createClient({})
                .on("error", (err) => {
                    console.error("Redis Client Error", err);
                })
                .connect();

export async function getStreamLength() {
    const length = await client.xLen(STREAM_NAME);
    // console.log(`Stream "${STREAM_NAME}" length:`, length);
    return length;
}

export async function xAdd({url,id}:WebsiteEvent){
    await client.xAdd(
        STREAM_NAME,"*",{
            url,
            id
        }
    )    
}


export async function xAddBulk(websites:WebsiteEvent[]){
    for (let i = 0; i < websites.length; i++) {
        await xAdd({
            // i put ! because it is the website i know it is not null the the loop will start so there i have mentioned by putting ! tbat website must be not empty.
            url:websites[i]!.url,
            id:websites[i]!.id
        })        
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
