const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Create Categories
  const catPlumbing = await prisma.category.create({ data: { name: 'Plumbing', overdueThresholdDays: 3 } });
  const catElectrical = await prisma.category.create({ data: { name: 'Electrical', overdueThresholdDays: 2 } });
  const catCleaning = await prisma.category.create({ data: { name: 'Cleaning', overdueThresholdDays: 5 } });

  // Create Users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const admin1 = await prisma.user.create({ data: { name: 'Admin One', email: 'admin1@test.com', passwordHash, role: 'admin' } });
  const admin2 = await prisma.user.create({ data: { name: 'Admin Two', email: 'admin2@test.com', passwordHash, role: 'admin' } });

  const res1 = await prisma.user.create({ data: { name: 'Res A1', email: 'resA1@test.com', passwordHash, role: 'resident', block: 'A', flatNumber: '101' } });
  const res2 = await prisma.user.create({ data: { name: 'Res A2', email: 'resA2@test.com', passwordHash, role: 'resident', block: 'A', flatNumber: '102' } });
  const res3 = await prisma.user.create({ data: { name: 'Res A3', email: 'resA3@test.com', passwordHash, role: 'resident', block: 'A', flatNumber: '103' } });
  
  const res4 = await prisma.user.create({ data: { name: 'Res B1', email: 'resB1@test.com', passwordHash, role: 'resident', block: 'B', flatNumber: '201' } });
  const res5 = await prisma.user.create({ data: { name: 'Res B2', email: 'resB2@test.com', passwordHash, role: 'resident', block: 'B', flatNumber: '202' } });

  // Create Recurrence Scenario
  // We need 3 complaints in the same block and category to trigger auto-escalation
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - 5);

  const thread = await prisma.issueThread.create({
    data: {
      categoryId: catPlumbing.id,
      block: 'A',
      recurrenceCount: 3,
      firstReportedAt: windowStart,
      lastReportedAt: new Date(),
      autoEscalated: true
    }
  });

  const c1 = await prisma.complaint.create({
    data: {
      residentId: res1.id,
      categoryId: catPlumbing.id,
      title: 'Water leaking in lobby',
      description: 'There is a huge puddle near the lift',
      threadId: thread.id,
      createdAt: windowStart,
      status: 'Open'
    }
  });

  const c2 = await prisma.complaint.create({
    data: {
      residentId: res2.id,
      categoryId: catPlumbing.id,
      title: 'Lobby leak still there',
      description: 'Puddle is getting bigger',
      threadId: thread.id,
      createdAt: new Date(windowStart.getTime() + 86400000), // +1 day
      status: 'Open'
    }
  });

  const c3 = await prisma.complaint.create({
    data: {
      residentId: res3.id,
      categoryId: catPlumbing.id,
      title: 'Pipe burst in lobby A',
      description: 'Water everywhere, please fix ASAP',
      threadId: thread.id,
      createdAt: new Date(),
      status: 'Open',
      priority: 'High',
      priorityAutoSet: true
    }
  });

  console.log('Seeding complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
