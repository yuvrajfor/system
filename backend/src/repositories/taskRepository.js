const prisma = require('../lib/prisma');

const defaultInclude = {
  candidate: { select: { id: true, name: true, email: true, role: true } },
  admin: { select: { id: true, name: true, email: true, role: true } },
  slot: { select: { id: true, title: true, startTime: true, endTime: true } },
};

function createTask(data) {
  return prisma.improvementTask.create({
    data,
    include: defaultInclude,
  });
}

function findTaskById(id) {
  return prisma.improvementTask.findUnique({
    where: { id },
    include: defaultInclude,
  });
}

function findTasksByCandidate(candidateId) {
  return prisma.improvementTask.findMany({
    where: { candidateId },
    include: defaultInclude,
    orderBy: { createdAt: 'desc' },
  });
}

function findAllTasks() {
  return prisma.improvementTask.findMany({
    include: defaultInclude,
    orderBy: { createdAt: 'desc' },
  });
}

function updateTaskStatus(id, status) {
  return prisma.improvementTask.update({
    where: { id },
    data: { status },
    include: defaultInclude,
  });
}

function deleteTask(id) {
  return prisma.improvementTask.delete({
    where: { id },
  });
}

module.exports = {
  createTask,
  findTaskById,
  findTasksByCandidate,
  findAllTasks,
  updateTaskStatus,
  deleteTask,
};
