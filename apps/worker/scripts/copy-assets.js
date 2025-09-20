import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`Running copy-assets.js from: ${__dirname}`);

const sourceDir = path.join(__dirname, '../emails/templates');
const destinationDir = path.join(__dirname, '../dist/emails/templates'); // Corrected path to target dist

console.log(`Source directory for templates: ${sourceDir}`);
console.log(`Destination directory for templates: ${destinationDir}`);

async function copyTemplates() {
    try {
        await fs.mkdir(destinationDir, { recursive: true });
        const files = await fs.readdir(sourceDir);

        for (const file of files) {
            const sourcePath = path.join(sourceDir, file);
            const destinationPath = path.join(destinationDir, file);
            await fs.copyFile(sourcePath, destinationPath);
            console.log(`Copied ${file} to ${destinationDir}`);
        }
        console.log('Email templates copied successfully!');
    } catch (error) {
        console.error('Error copying email templates:', error);
        process.exit(1);
    }
}

copyTemplates();
