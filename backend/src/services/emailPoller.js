const prisma = require('../utils/prisma');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

const MAX_RETRIES = 3;

async function processOutbox() {
  try {
    const pendingEmails = await prisma.emailOutbox.findMany({
      where: {
        status: 'pending',
        retryCount: { lt: MAX_RETRIES }
      },
      orderBy: { createdAt: 'asc' },
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
        console.error(`Failed to send email ${email.id} (attempt ${email.retryCount + 1}/${MAX_RETRIES}):`, error.message);
        const newRetryCount = email.retryCount + 1;
        await prisma.emailOutbox.update({
          where: { id: email.id },
          data: {
            retryCount: newRetryCount,
            status: newRetryCount >= MAX_RETRIES ? 'failed' : 'pending'
          }
        });
      }
    }
  } catch (error) {
    console.error('Error polling email outbox:', error);
  }
}

// Run every 30 seconds
setInterval(processOutbox, 30000);
