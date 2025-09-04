import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __monolenz_prisma__: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.__monolenz_prisma__ ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__monolenz_prisma__ = prisma;
}
