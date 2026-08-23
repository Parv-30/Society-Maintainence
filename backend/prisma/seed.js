const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Categories
  const catPlumbing = await prisma.category.create({ data: { name: 'Plumbing', overdueThresholdDays: 3 } });
  const catElectrical = await prisma.category.create({ data: { name: 'Electrical', overdueThresholdDays: 2 } });
  const catCleaning = await prisma.category.create({ data: { name: 'Cleaning', overdueThresholdDays: 5 } });
  const catSecurity = await prisma.category.create({ data: { name: 'Security', overdueThresholdDays: 1 } });
  const catCarpentry = await prisma.category.create({ data: { name: 'Carpentry', overdueThresholdDays: 7 } });
  const catPestControl = await prisma.category.create({ data: { name: 'Pest Control', overdueThresholdDays: 4 } });
  const catLifts = await prisma.category.create({ data: { name: 'Lifts & Elevators', overdueThresholdDays: 1 } });
  const catGardening = await prisma.category.create({ data: { name: 'Landscaping/Gardening', overdueThresholdDays: 10 } });

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

  await prisma.complaint.create({
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

  await prisma.complaint.create({
    data: {
      residentId: res2.id,
      categoryId: catPlumbing.id,
      title: 'Lobby leak still there',
      description: 'Puddle is getting bigger',
      threadId: thread.id,
      createdAt: new Date(windowStart.getTime() + 86400000),
      status: 'Open'
    }
  });

  await prisma.complaint.create({
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

  await prisma.complaint.create({
    data: {
      residentId: res4.id,
      categoryId: catElectrical.id,
      title: 'Power fluctuation in B block',
      description: 'Lights are flickering constantly in the corridor.',
      createdAt: windowStart,
      status: 'InProgress',
      priority: 'Medium'
    }
  });

  await prisma.complaint.create({
    data: {
      residentId: res5.id,
      categoryId: catSecurity.id,
      title: 'Unknown person tailgating',
      description: 'Someone tailgated into the building without signing the register.',
      createdAt: new Date(),
      status: 'Open',
      priority: 'High'
    }
  });

  await prisma.complaint.create({
    data: {
      residentId: res1.id,
      categoryId: catLifts.id,
      title: 'Lift 2 is making a weird noise',
      description: 'Grinding noise when going down from 5th floor.',
      createdAt: new Date(windowStart.getTime() - 86400000 * 2), // 2 days before window
      status: 'Resolved',
      priority: 'High'
    }
  });

  await prisma.complaint.create({
    data: {
      residentId: res2.id,
      categoryId: catGardening.id,
      title: 'Overgrown bushes near entrance',
      description: 'Hard to see incoming cars due to bushes.',
      createdAt: new Date(windowStart.getTime() - 86400000 * 5),
      status: 'Resolved',
      priority: 'Low'
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
