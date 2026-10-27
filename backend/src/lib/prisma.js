const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

let prisma;
if (connectionString && connectionString.includes('neon.tech')) {
  const adapter = new PrismaNeon({ connectionString });
  prisma = new PrismaClient({ adapter });
} else {
  prisma = new PrismaClient();
}

module.exports = prisma;
