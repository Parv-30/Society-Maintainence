const { z } = require('zod');
const prisma = require('../utils/prisma');

const noticeSchema = z.object({
  title: z.string().min(5),
  body: z.string().min(10),
  isImportant: z.boolean().default(false),
});

exports.createNotice = async (req, res) => {
  try {
    const data = noticeSchema.parse(req.body);
    
    const notice = await prisma.$transaction(async (tx) => {
      const createdNotice = await tx.notice.create({
        data: {
          adminId: req.user.id,
          title: data.title,
          body: data.body,
          isImportant: data.isImportant
        }
      });

      if (data.isImportant) {
        const residents = await tx.user.findMany({ where: { role: 'resident' } });
        const emails = residents.map(r => ({
          toEmail: r.email,
          subject: `[IMPORTANT] ${data.title}`,
          body: data.body
        }));

        if (emails.length > 0) {
          await tx.emailOutbox.createMany({ data: emails });
        }
      }

      return createdNotice;
    });

    res.status(201).json(notice);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getNotices = async (req, res) => {
  try {
    const notices = await prisma.notice.findMany({
      orderBy: [
        { isImportant: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
