const { z } = require('zod');
const prisma = require('../utils/prisma');
const { handleRecurrence } = require('../services/recurrenceService');

const createComplaintSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(5),
  description: z.string().min(10),
  photoUrl: z.string().url().optional().or(z.literal('')),
});

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  reopen: z.boolean().default(false),
});

exports.createComplaint = async (req, res) => {
  try {
    const data = createComplaintSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    if (!user.block) {
      return res.status(400).json({ error: 'Resident must have a block assigned to raise a complaint' });
    }

    const recurrenceResult = await handleRecurrence(data.categoryId, user.block);

    const complaint = await prisma.complaint.create({
      data: {
        residentId: req.user.id,
        categoryId: data.categoryId,
        title: data.title,
        description: data.description,
        photoUrl: data.photoUrl || null,
        threadId: recurrenceResult.threadId,
        priority: recurrenceResult.priority || 'Low',
        priorityAutoSet: recurrenceResult.priorityAutoSet,
      }
    });

    await prisma.complaintHistory.create({
      data: {
        complaintId: complaint.id,
        actorId: req.user.id,
        toStatus: 'Open',
        note: 'Complaint created'
      }
    });

    res.status(201).json(complaint);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getMine = async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      where: { residentId: req.user.id },
      include: { category: true, thread: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      include: { category: true, resident: true }
    });

    if (!complaint) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'admin' && complaint.residentId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      include: { history: { include: { actor: true }, orderBy: { changedAt: 'asc' } } }
    });

    if (!complaint) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'admin' && complaint.residentId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(complaint.history);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.submitFeedback = async (req, res) => {
  try {
    const data = feedbackSchema.parse(req.body);
    const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id } });

    if (!complaint || complaint.residentId !== req.user.id) {
      return res.status(404).json({ error: 'Complaint not found or unauthorized' });
    }
    if (complaint.status !== 'Resolved') {
      return res.status(400).json({ error: 'Can only submit feedback on resolved complaints' });
    }

    const hoursSinceResolution = (new Date() - complaint.resolvedAt) / (1000 * 60 * 60);
    if (data.reopen && data.rating <= 2) {
      if (hoursSinceResolution > 48) {
        return res.status(400).json({ error: 'Time limit to reopen (48h) exceeded' });
      }

      await prisma.complaint.update({
        where: { id: complaint.id },
        data: { status: 'Reopened', resolvedAt: null }
      });

      await prisma.complaintHistory.create({
        data: {
          complaintId: complaint.id,
          actorId: req.user.id,
          fromStatus: 'Resolved',
          toStatus: 'Reopened',
          note: `Reopened by resident due to low rating (${data.rating})`
        }
      });
      
      // Notify admin (outbox)
      const adminUsers = await prisma.user.findMany({ where: { role: 'admin' } });
      for (const admin of adminUsers) {
        await prisma.emailOutbox.create({
          data: {
            toEmail: admin.email,
            subject: `Complaint Reopened: ${complaint.title}`,
            body: `Complaint ${complaint.id} was reopened by the resident with a rating of ${data.rating}.`
          }
        });
      }
    }

    const feedback = await prisma.complaintFeedback.create({
      data: {
        complaintId: complaint.id,
        rating: data.rating,
        reopened: data.reopen && data.rating <= 2
      }
    });

    res.json(feedback);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      include: { category: true, resident: true, thread: true, feedback: true }
    });
    if (!complaint) return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'admin' && complaint.residentId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
