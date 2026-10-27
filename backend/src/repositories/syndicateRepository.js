const prisma = require('../lib/prisma');
function findAll() { return prisma.syndicate.findMany({ include: { _count: { select: { members: true } } }, orderBy: { name: 'asc' } }); }
function findById(id) { return prisma.syndicate.findUnique({ where: { id }, include: { _count: { select: { members: true } } } }); }
function create(data) { return prisma.syndicate.create({ data }); }
function update(id, data) { return prisma.syndicate.update({ where: { id }, data }); }
function remove(id) { return prisma.syndicate.delete({ where: { id } }); }
module.exports = { findAll, findById, create, update, remove };
