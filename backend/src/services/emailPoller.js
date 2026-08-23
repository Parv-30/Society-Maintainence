const prisma = require('../utils/prisma');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

async function processOutbox() {
  try {
    const pendingEmails = await prisma.emailOutbox.findMany({
      where: { status: 'pending' },
      take: 10
    });

    for (const email of pendingEmails) {
      try {
        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: email.toEmail,
          subject: email.subject,
          html: `<p>${email.body}</p>`
        });

        await prisma.emailOutbox.update({
          where: { id: email.id },
          data: { status: 'sent', sentAt: new Date() }
        });
      } catch (error) {
        console.error(`Failed to send email ${email.id}:`, error);
        await prisma.emailOutbox.update({
          where: { id: email.id },
          data: { status: 'failed' }
        });
      }
    }
  } catch (error) {
    console.error('Error polling email outbox:', error);
  }
}

// Run every 30 seconds
setInterval(processOutbox, 30000);
