require('dotenv').config({ path: '../.env.local' });
require('dotenv').config({ path: '.env' });
const prisma = require('../src/lib/prisma');

async function migrate() {
  console.log('🔄 Running migration for Interview Slots, Bookings, Feedback, and Tasks...');

  const sqlStatements = [
    // 1. Add CANDIDATE role
    `ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'CANDIDATE'`,

    // 2. Enums
    `DO $$ BEGIN
       CREATE TYPE "SlotStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'CANCELLED');
     EXCEPTION
       WHEN duplicate_object THEN null;
     END $$;`,

    `DO $$ BEGIN
       CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'COMPLETED');
     EXCEPTION
       WHEN duplicate_object THEN null;
     END $$;`,

    `DO $$ BEGIN
       CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');
     EXCEPTION
       WHEN duplicate_object THEN null;
     END $$;`,

    // 3. InterviewSlot table
    `CREATE TABLE IF NOT EXISTS "InterviewSlot" (
       "id" TEXT NOT NULL PRIMARY KEY,
       "adminId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
       "startTime" TIMESTAMP(3) NOT NULL,
       "endTime" TIMESTAMP(3) NOT NULL,
       "title" TEXT NOT NULL DEFAULT 'Technical Interview',
       "status" "SlotStatus" NOT NULL DEFAULT 'AVAILABLE',
       "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
       "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
     );`,

    // 4. Booking table (slotId is UNIQUE -> prevents double booking at DB level!)
    `CREATE TABLE IF NOT EXISTS "Booking" (
       "id" TEXT NOT NULL PRIMARY KEY,
       "slotId" TEXT NOT NULL UNIQUE REFERENCES "InterviewSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE,
       "candidateId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
       "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
       "notes" TEXT,
       "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
       "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
     );`,

    // 5. Feedback table (immutable record)
    `CREATE TABLE IF NOT EXISTS "Feedback" (
       "id" TEXT NOT NULL PRIMARY KEY,
       "candidateId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
       "adminId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
       "slotId" TEXT REFERENCES "InterviewSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE,
       "remarks" TEXT NOT NULL,
       "strengths" TEXT NOT NULL,
       "weaknesses" TEXT NOT NULL,
       "suggestions" TEXT NOT NULL,
       "rating" INTEGER NOT NULL DEFAULT 5,
       "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
     );`,

    // 6. ImprovementTask table
    `CREATE TABLE IF NOT EXISTS "ImprovementTask" (
       "id" TEXT NOT NULL PRIMARY KEY,
       "candidateId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
       "adminId" TEXT REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
       "slotId" TEXT REFERENCES "InterviewSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE,
       "title" TEXT NOT NULL,
       "description" TEXT,
       "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
       "dueDate" TIMESTAMP(3),
       "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
       "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
     );`,

    // 7. Indexes
    `CREATE INDEX IF NOT EXISTS "InterviewSlot_adminId_status_idx" ON "InterviewSlot"("adminId", "status");`,
    `CREATE INDEX IF NOT EXISTS "InterviewSlot_startTime_idx" ON "InterviewSlot"("startTime");`,
    `CREATE INDEX IF NOT EXISTS "Booking_candidateId_status_idx" ON "Booking"("candidateId", "status");`,
    `CREATE INDEX IF NOT EXISTS "Feedback_candidateId_createdAt_idx" ON "Feedback"("candidateId", "createdAt");`,
    `CREATE INDEX IF NOT EXISTS "ImprovementTask_candidateId_status_idx" ON "ImprovementTask"("candidateId", "status");`
  ];

  for (const statement of sqlStatements) {
    try {
      await prisma.$executeRawUnsafe(statement);
    } catch (err) {
      console.error(`Statement error on: ${statement.slice(0, 40)}...`, err.message);
      throw err;
    }
  }

  console.log('✅ All tables, enums, and indexes created successfully in Neon DB.');
}

migrate()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  });
