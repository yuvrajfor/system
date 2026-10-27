const prisma = require('../lib/prisma');

const defaultInclude = {
  admin: { select: { id: true, name: true, email: true, role: true } },
  candidate: { select: { id: true, name: true, email: true, role: true } },
  slot: { select: { id: true, title: true, startTime: true, endTime: true } },
};

function createFeedback(data) {
  // Feedback is immutable once created.
  return prisma.feedback.create({
    data,
    include: defaultInclude,
  });
}

function findFeedbackById(id) {
  return prisma.feedback.findUnique({
    where: { id },
    include: defaultInclude,
  });
}

function findFeedbackByCandidate(candidateId) {
  return prisma.feedback.findMany({
    where: { candidateId },
    include: defaultInclude,
    orderBy: { createdAt: 'desc' },
  });
}

function findAllFeedback() {
  return prisma.feedback.findMany({
    include: defaultInclude,
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = {
  createFeedback,
  findFeedbackById,
  findFeedbackByCandidate,
  findAllFeedback,
};
