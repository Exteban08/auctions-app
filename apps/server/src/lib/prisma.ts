import * as prismaClient from '@prisma/client';

// In Prisma v6, we need to access the client differently
const { PrismaClient } = prismaClient;

const globalForPrisma = globalThis as unknown as {
  prisma: prismaClient.PrismaClient | undefined;
};

const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5433/auctions";

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;