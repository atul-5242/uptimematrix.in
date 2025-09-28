import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.mailtrap.io'; // Default to mailtrap for testing
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '2525', 10); // Default to mailtrap port

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
    // logger: true, // Uncomment for detailed logging
    // debug: true, // Uncomment for detailed debugging
});

// Verify transporter connection only if email credentials are provided
if (SMTP_USER && SMTP_PASS) {
    transporter.verify(function (error: Error | null, success: boolean) {
        if (error) {
            console.error("Email transporter verification failed:", error);
        } else {
            console.log("Email transporter is ready to take messages.");
        }
    });
} else {
    console.log("Email credentials not provided. Email notifications disabled.");
}

const templatesCache: { [key: string]: HandlebarsTemplateDelegate } = {};

// Function to compile an email template
async function compileTemplate(templateName: string, context: any): Promise<string> {
    if (templatesCache[templateName]) {
        return templatesCache[templateName](context);
    }

    const templatePath = path.join(__dirname, '../emails/templates', `${templateName}.html`);
    try {
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const compiledTemplate = handlebars.compile(templateContent);
        templatesCache[templateName] = compiledTemplate; // Cache the compiled template
        return compiledTemplate(context);
    } catch (error) {
        console.error(`Failed to compile email template ${templateName}:`, error);
        throw new Error(`Failed to compile email template ${templateName}`);
    }
}

// Function to send a templated email
export async function sendTemplatedEmail(to: string, subject: string, templateName: string, context: any) {
    try {
        // Compile the specific template content
        const bodyContent = await compileTemplate(templateName, context);

        // Compile the base template with the subject and body content
        const baseTemplateContent = await fs.readFile(path.join(__dirname, '../emails/templates', 'base.html'), 'utf-8');
        const compiledBaseTemplate = handlebars.compile(baseTemplateContent);
        
        const html = compiledBaseTemplate({
            subject: subject, // Pass subject to the base template
            body: bodyContent, // Pass compiled body content
            year: new Date().getFullYear(), // Example context for base template
        });

        const mailOptions = {
            from: SMTP_USER, // Sender address
            to: to, // List of recipients
            subject: subject, // Subject line
            html: html, // html body
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${to}: ${subject} (Message ID: ${info.messageId})`);
        return info;
    } catch (error) {
        console.error(`Error sending templated email to ${to} (${templateName}):`, error);
        throw error;
    }
}
