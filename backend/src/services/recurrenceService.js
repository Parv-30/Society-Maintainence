const prisma = require('../utils/prisma');

const RECURRENCE_WINDOW_DAYS = parseInt(process.env.RECURRENCE_WINDOW_DAYS || '30', 10);

/**
 * Evaluates recurrence for a new complaint and returns the target thread details.
 * Uses Prisma transaction client (tx) for atomicity.
 */
async function handleRecurrence(categoryId, block, tx) {
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - RECURRENCE_WINDOW_DAYS);

  // Find recent thread
  const existingThread = await tx.issueThread.findFirst({
    where: {
      categoryId,
      block,
      lastReportedAt: {
        gte: windowStart
      }
    },
    orderBy: {
      lastReportedAt: 'desc'
    }
  });

  if (existingThread) {
    const shouldEscalate = (existingThread.recurrenceCount + 1) >= 3 && !existingThread.autoEscalated;

    const thread = await tx.issueThread.update({
      where: { id: existingThread.id },
      data: {
        recurrenceCount: { increment: 1 },
        lastReportedAt: new Date(),
        autoEscalated: existingThread.autoEscalated || shouldEscalate
      }
    });

    return {
      threadId: thread.id,
      priority: shouldEscalate ? 'High' : null,
      priorityAutoSet: shouldEscalate
    };
  } else {
    // Create new thread
    const thread = await tx.issueThread.create({
      data: {
        categoryId,
        block,
        recurrenceCount: 1,
        firstReportedAt: new Date(),
        lastReportedAt: new Date()
      }
    });

    return {
      threadId: thread.id,
      priority: null,
      priorityAutoSet: false
    };
  }
}

module.exports = { handleRecurrence };
