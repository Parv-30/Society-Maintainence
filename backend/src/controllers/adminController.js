const { z } = require('zod');
const prisma = require('../utils/prisma');

const updateStatusSchema = z.object({
  status: z.enum(['Open', 'InProgress', 'Resolved', 'Reopened']),
  note: z.string().optional(),
});

const updatePrioritySchema = z.object({
  priority: z.enum(['Low', 'Medium', 'High']),
});

exports.getComplaints = async (req, res) => {
  try {
    const { category, status, startDate, endDate, overdue } = req.query;
    
    let whereClause = {};
    if (category) whereClause.categoryId = category;
    if (status) whereClause.status = status;
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const complaints = await prisma.complaint.findMany({
      where: whereClause,
      include: { category: true, resident: true },
      orderBy: { createdAt: 'desc' }
    });

    let result = complaints;

    // Overdue logic: query-time calculation
    if (overdue === 'true') {
      const now = new Date();
      result = complaints.filter(c => {
        if (c.status === 'Resolved') return false;
        const daysSinceCreation = (now - c.createdAt) / (1000 * 60 * 60 * 24);
        return daysSinceCreation > c.category.overdueThresholdDays;
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getRecurringIssues = async (req, res) => {
  try {
    const threads = await prisma.issueThread.findMany({
      include: { category: true },
      orderBy: { recurrenceCount: 'desc' }
    });
    res.json(threads);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const data = updateStatusSchema.parse(req.body);
    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
      include: { resident: true }
    });

    if (!complaint) return res.status(404).json({ error: 'Not found' });

    const updated = await prisma.complaint.update({
      where: { id: complaint.id },
      data: {
        status: data.status,
        resolvedAt: data.status === 'Resolved' ? new Date() : null,
      }
    });

    await prisma.complaintHistory.create({
      data: {
        complaintId: complaint.id,
        actorId: req.user.id,
        fromStatus: complaint.status,
        toStatus: data.status,
        note: data.note || null
      }
    });

    // Notify resident (outbox)
    await prisma.emailOutbox.create({
      data: {
        toEmail: complaint.resident.email,
        subject: `Complaint Status Updated: ${complaint.title}`,
        body: `Your complaint status has changed from ${complaint.status} to ${data.status}. Note: ${data.note || 'None'}`
      }
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updatePriority = async (req, res) => {
  try {
    const data = updatePrioritySchema.parse(req.body);
    const complaint = await prisma.complaint.update({
      where: { id: req.params.id },
      data: { priority: data.priority, priorityAutoSet: false }
    });
    res.json(complaint);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const [
      openCount,
      inProgressCount,
      resolvedCount,
      categories,
      complaints,
      recurringThreads
    ] = await Promise.all([
      prisma.complaint.count({ where: { status: 'Open' } }),
      prisma.complaint.count({ where: { status: 'InProgress' } }),
      prisma.complaint.count({ where: { status: 'Resolved' } }),
      prisma.category.findMany({ include: { _count: { select: { complaints: true } } } }),
      prisma.complaint.findMany({ include: { category: true } }),
      prisma.issueThread.findMany({ orderBy: { recurrenceCount: 'desc' }, take: 5, include: { category: true } })
    ]);

    const now = new Date();
    let overdueCount = 0;
    complaints.forEach(c => {
      if (c.status !== 'Resolved') {
        const daysSinceCreation = (now - c.createdAt) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation > c.category.overdueThresholdDays) {
          overdueCount++;
        }
      }
    });

    res.json({
      statusCounts: { Open: openCount, InProgress: inProgressCount, Resolved: resolvedCount },
      categoryCounts: categories.map(c => ({ category: c.name, count: c._count.complaints })),
      overdueCount,
      topRecurring: recurringThreads
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
