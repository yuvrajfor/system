const prisma = require('../lib/prisma');
const included = { syndicate: true };
function findByGoogleId(googleId) { return prisma.user.findUnique({ where: { googleId }, include: included }); }
function upsertGoogleUser(data) { return prisma.user.upsert({ where: { googleId: data.googleId }, update: { email: data.email, name: data.name, ...(data.role ? { role: data.role } : {}) }, create: data, include: included }); }
function findAll() { return prisma.user.findMany({ include: included, orderBy: { createdAt: 'desc' } }); }
function findBySyndicate(syndicateId) { return prisma.user.findMany({ where: { syndicateId }, include: included, orderBy: { name: 'asc' } }); }
function updateMember(id, data) { return prisma.user.update({ where: { id }, data, include: included }); }
module.exports = { findByGoogleId, upsertGoogleUser, findAll, findBySyndicate, updateMember };
