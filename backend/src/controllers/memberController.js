const members = require('../repositories/memberRepository');
const prisma = require('../lib/prisma');

async function list(req, res, next) {
  try {
    if (req.user.role === 'SYNDICATE_LEAD') {
      if (!req.user.syndicateId) {
        return res.json([]);
      }
      const syndicateMembers = await members.findBySyndicate(req.user.syndicateId);
      return res.json(syndicateMembers);
    }

    // SUPER_ADMIN sees all members across all syndicates
    const allMembers = await members.findAll();
    res.json(allMembers);
  } catch (error) {
    next(error);
  }
}

async function listCandidates(req, res, next) {
  try {
    // List all users eligible as candidates (CANDIDATE, GUEST, MEMBER)
    const candidateUsers = await prisma.user.findMany({
      where: {
        role: { in: ['CANDIDATE', 'GUEST', 'MEMBER'] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        syndicate: { select: { id: true, name: true } },
        _count: {
          select: {
            bookings: true,
            receivedFeedbacks: true,
            improvementTasks: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json(candidateUsers);
  } catch (error) {
    next(error);
  }
}

async function updateRole(req, res, next) {
  try {
    const { role, syndicateId } = req.body;
    const validRoles = ['SUPER_ADMIN', 'SYNDICATE_LEAD', 'MEMBER', 'GUEST', 'CANDIDATE'];

    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role supplied.' });
    }

    const dataToUpdate = {};
    if (role) dataToUpdate.role = role;
    if (syndicateId !== undefined) {
      dataToUpdate.syndicateId = syndicateId ? syndicateId : null;
    }

    const updated = await members.updateMember(req.params.id, dataToUpdate);
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  list,
  listCandidates,
  updateRole,
};
