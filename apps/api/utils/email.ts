import nodemailer from 'nodemailer';

// Configure transporter with Gmail service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER?.trim(),
    pass: process.env.SMTP_PASS?.trim()
  }
});

export async function sendEmail(to: string, subject: string, html: string) {
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  
  console.log("SMTP_USER:", smtpUser);
  console.log("SMTP_PASS length:", smtpPass?.length || 0);
  console.log("EMAIL_FROM:", process.env.EMAIL_FROM);

  // Validate required environment variables
  if (!smtpUser || !smtpPass) {
    throw new Error('SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.');
  }

  // Create a new transporter for this specific email to ensure fresh credentials
  const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    debug: true, // Enable debug logging
    logger: true
  });

  try {
    // Verify connection before sending
    console.log('[Email Utility] Verifying SMTP connection...');
    await emailTransporter.verify();
    console.log('[Email Utility] SMTP connection verified successfully');

    const info = await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || `"UptimeMatrix" <${smtpUser}>`,
      to,
      subject,
      html,
    });

    console.log(`[Email Utility] Message sent: %s`, info.messageId);

    // Preview only available when sending through an Ethereal account
    if (process.env.NODE_ENV !== 'production') {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) {
        console.log("Preview URL:", preview);
      }
    }

    return info;
  } catch (error: any) {
    console.error(`[Email Utility] Error sending email to ${to}:`, error.message);
    console.error(`[Email Utility] Full error:`, error);
    
    // Additional debugging for auth errors
    if (error.code === 'EAUTH') {
      console.error('[Email Utility] Authentication failed. Please check:');
      console.error('1. Gmail account has 2-factor authentication enabled');
      console.error('2. App password is correctly generated and copied');
      console.error('3. App password has no spaces or special characters');
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

export function createInvitationLink(token: string) {
  const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  return `${frontendBaseUrl}/accept-invitation?token=${token}`;
}
