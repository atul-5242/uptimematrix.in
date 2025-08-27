import axios from "axios";
import { sendEmail } from "./../notifications/email.js";

// Slack notification
export async function sendSlack(webhookUrl: string, message: string) {
    try {
        await axios.post(webhookUrl, { text: message });
    } catch (err) {
        console.error("Slack notification failed:", err);
    }
}

// Webhook notification
export async function sendWebhook(webhookUrl: string, payload: any) {
    try {
        await axios.post(webhookUrl, payload);
    } catch (err) {
        console.error("Webhook notification failed:", err);
    }
}

// // SMS notification (using Twilio)
// import twilio from "twilio";
// const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

// export async function sendSMS(to: string, message: string) {
//     try {
//         await twilioClient.messages.create({
//             to,
//             from: process.env.TWILIO_FROM!,
//             body: message,
//         });
//     } catch (err) {
//         console.error("SMS notification failed:", err);
//     }
// }
