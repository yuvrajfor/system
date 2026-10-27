const prisma = require('../src/lib/prisma');

async function main() {
  console.log('Seeding initial syndicates, demo members, candidate slots, and feedback into Neon DB...');

  // 1. Upsert Syndicates
  const biotech = await prisma.syndicate.upsert({
    where: { name: 'Bio-Tech Syndicate' },
    update: {},
    create: {
      name: 'Bio-Tech Syndicate',
      description: 'Genetic sequencing, bioinformatics, and synthetic biology research.',
      resourcesAllocated: 1500,
    },
  });

  const robotics = await prisma.syndicate.upsert({
    where: { name: 'Robotics Guild' },
    update: {},
    create: {
      name: 'Robotics Guild',
      description: 'Autonomous rovers, manipulators, and embedded hardware development.',
      resourcesAllocated: 2400,
    },
  });

  const quantum = await prisma.syndicate.upsert({
    where: { name: 'Quantum Computing Lab' },
    update: {},
    create: {
      name: 'Quantum Computing Lab',
      description: 'Superconducting qubit simulations and quantum cryptography.',
      resourcesAllocated: 3200,
    },
  });

  const aiLab = await prisma.syndicate.upsert({
    where: { name: 'AI & Cybernetics Lab' },
    update: {},
    create: {
      name: 'AI & Cybernetics Lab',
      description: 'Neural foundation models, computer vision, and cognitive systems.',
      resourcesAllocated: 4000,
    },
  });

  console.log('Syndicates seeded.');

  // 2. Upsert Demo Users
  const users = [
    {
      googleId: 'demo-superadmin-001',
      email: 'superadmin@labsystem.org',
      name: 'Dr. Elena Rostova',
      role: 'SUPER_ADMIN',
      syndicateId: null,
    },
    {
      googleId: 'demo-lead-biotech-002',
      email: 'lead.biotech@labsystem.org',
      name: 'Marcus Vance',
      role: 'SYNDICATE_LEAD',
      syndicateId: biotech.id,
    },
    {
      googleId: 'demo-lead-robotics-003',
      email: 'lead.robotics@labsystem.org',
      name: 'Aria Chen',
      role: 'SYNDICATE_LEAD',
      syndicateId: robotics.id,
    },
    {
      googleId: 'demo-member-biotech-004',
      email: 'member.biotech@labsystem.org',
      name: 'Devon Miller',
      role: 'MEMBER',
      syndicateId: biotech.id,
    },
    {
      googleId: 'demo-member-robotics-005',
      email: 'member.robotics@labsystem.org',
      name: 'Kavita Rao',
      role: 'MEMBER',
      syndicateId: robotics.id,
    },
    {
      googleId: 'demo-guest-006',
      email: 'guest.applicant@labsystem.org',
      name: "Liam O'Connor",
      role: 'GUEST',
      syndicateId: null,
    },
    {
      googleId: 'demo-candidate-007',
      email: 'candidate.demo@labsystem.org',
      name: 'Alex Rivera',
      role: 'CANDIDATE',
      syndicateId: null,
    },
    {
      googleId: 'demo-candidate-008',
      email: 'candidate.maya@labsystem.org',
      name: 'Maya Lin',
      role: 'CANDIDATE',
      syndicateId: null,
    },
  ];

  const seededUsers = {};
  for (const user of users) {
    const record = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        role: user.role,
        syndicateId: user.syndicateId,
      },
      create: user,
    });
    seededUsers[user.email] = record;
  }
  console.log('Demo users seeded successfully!');

  const adminUser = seededUsers['superadmin@labsystem.org'];
  const candidateUser = seededUsers['candidate.demo@labsystem.org'];

  // 3. Upsert Sample Interview Slots
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const pastDay = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  // Available Slot 1
  const slot1Start = new Date(tomorrow);
  slot1Start.setHours(10, 0, 0, 0);
  const slot1End = new Date(tomorrow);
  slot1End.setHours(11, 0, 0, 0);

  await prisma.interviewSlot.upsert({
    where: { id: 'slot-sample-001' },
    update: { startTime: slot1Start, endTime: slot1End, status: 'AVAILABLE' },
    create: {
      id: 'slot-sample-001',
      adminId: adminUser.id,
      title: 'Distributed Systems & Concurrency Deep-Dive',
      startTime: slot1Start,
      endTime: slot1End,
      status: 'AVAILABLE',
    },
  });

  // Available Slot 2
  const slot2Start = new Date(tomorrow);
  slot2Start.setHours(14, 0, 0, 0);
  const slot2End = new Date(tomorrow);
  slot2End.setHours(15, 0, 0, 0);

  await prisma.interviewSlot.upsert({
    where: { id: 'slot-sample-002' },
    update: { startTime: slot2Start, endTime: slot2End, status: 'AVAILABLE' },
    create: {
      id: 'slot-sample-002',
      adminId: adminUser.id,
      title: 'Full-Stack Architecture & Security Audit',
      startTime: slot2Start,
      endTime: slot2End,
      status: 'AVAILABLE',
    },
  });

  // Available Slot 3
  const slot3Start = new Date(dayAfter);
  slot3Start.setHours(11, 30, 0, 0);
  const slot3End = new Date(dayAfter);
  slot3End.setHours(12, 30, 0, 0);

  await prisma.interviewSlot.upsert({
    where: { id: 'slot-sample-003' },
    update: { startTime: slot3Start, endTime: slot3End, status: 'AVAILABLE' },
    create: {
      id: 'slot-sample-003',
      adminId: adminUser.id,
      title: 'Neon PostgreSQL Optimization & Indexing',
      startTime: slot3Start,
      endTime: slot3End,
      status: 'AVAILABLE',
    },
  });

  // Past Booked Slot with Feedback and Tasks
  const slotPastStart = new Date(pastDay);
  slotPastStart.setHours(16, 0, 0, 0);
  const slotPastEnd = new Date(pastDay);
  slotPastEnd.setHours(17, 0, 0, 0);

  const pastSlot = await prisma.interviewSlot.upsert({
    where: { id: 'slot-sample-past-004' },
    update: { status: 'BOOKED' },
    create: {
      id: 'slot-sample-past-004',
      adminId: adminUser.id,
      title: 'Technical Round 1: Core Algorithms & API Design',
      startTime: slotPastStart,
      endTime: slotPastEnd,
      status: 'BOOKED',
    },
  });

  // Booking for past slot
  await prisma.booking.upsert({
    where: { slotId: pastSlot.id },
    update: {},
    create: {
      id: 'booking-sample-001',
      slotId: pastSlot.id,
      candidateId: candidateUser.id,
      status: 'COMPLETED',
      notes: 'Initial technical assessment for Systems Engineer role.',
    },
  });

  // Feedback for candidate Alex Rivera
  await prisma.feedback.upsert({
    where: { id: 'feedback-sample-001' },
    update: {},
    create: {
      id: 'feedback-sample-001',
      candidateId: candidateUser.id,
      adminId: adminUser.id,
      slotId: pastSlot.id,
      remarks: 'Impressive grasp of full-stack data flow and clean code separation.',
      strengths: 'Very articulate on transactional boundaries, relational normalization, and REST/MVC conventions.',
      weaknesses: 'Hesitated slightly on WebSocket reconnection backoff algorithms and handling race conditions.',
      suggestions: 'Review Postgres row-level locks (SELECT FOR UPDATE) and implement exponential backoff with jitter.',
      rating: 4,
    },
  });

  // Improvement Tasks
  await prisma.improvementTask.upsert({
    where: { id: 'task-sample-001' },
    update: {},
    create: {
      id: 'task-sample-001',
      candidateId: candidateUser.id,
      adminId: adminUser.id,
      slotId: pastSlot.id,
      title: 'Implement exponential backoff with jitter on WebSocket reconnects',
      description: 'Add a capped random jitter delay between connection retry attempts to avoid thundering herd problems.',
      status: 'COMPLETED',
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.improvementTask.upsert({
    where: { id: 'task-sample-002' },
    update: {},
    create: {
      id: 'task-sample-002',
      candidateId: candidateUser.id,
      adminId: adminUser.id,
      slotId: pastSlot.id,
      title: 'Deep dive: Row-level locks and transaction isolation in PostgreSQL',
      description: 'Study READ COMMITTED vs REPEATABLE READ and write sample queries demonstrating SELECT FOR UPDATE NOWAIT.',
      status: 'IN_PROGRESS',
      dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('Sample interview slots, bookings, feedback, and improvement tasks seeded!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
