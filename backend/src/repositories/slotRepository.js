const prisma = require('../lib/prisma');

const defaultInclude = {
  admin: { select: { id: true, name: true, email: true, role: true } },
  booking: {
    include: {
      candidate: { select: { id: true, name: true, email: true, role: true } },
    },
  },
};

function createSlot(data) {
  return prisma.interviewSlot.create({
    data,
    include: defaultInclude,
  });
}

function findSlotById(id) {
  return prisma.interviewSlot.findUnique({
    where: { id },
    include: defaultInclude,
  });
}

function findAllSlots(filters = {}) {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.adminId) where.adminId = filters.adminId;
  if (filters.futureOnly) {
    where.startTime = { gte: new Date() };
  }

  return prisma.interviewSlot.findMany({
    where,
    include: defaultInclude,
    orderBy: { startTime: 'asc' },
  });
}

function findAvailableSlots() {
  return prisma.interviewSlot.findMany({
    where: {
      status: 'AVAILABLE',
      startTime: { gte: new Date() },
    },
    include: defaultInclude,
    orderBy: { startTime: 'asc' },
  });
}

function updateSlot(id, data) {
  return prisma.interviewSlot.update({
    where: { id },
    data,
    include: defaultInclude,
  });
}

function deleteSlot(id) {
  return prisma.interviewSlot.delete({
    where: { id },
  });
}

module.exports = {
  createSlot,
  findSlotById,
  findAllSlots,
  findAvailableSlots,
  updateSlot,
  deleteSlot,
};
