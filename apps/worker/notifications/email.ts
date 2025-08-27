// Stub email sender
export async function sendEmail(to: string, subject: string, body: string) {
    console.log(`📧 Email -> ${to} | ${subject}\n${body}`);
  }
  