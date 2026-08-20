import type { PrismaClient } from '@prisma/client';
import { PrismaClient as GeneratedPrismaClient } from '../../../web/generated/prisma/index.js';

declare global {
  var __monolenz_prisma__: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.__monolenz_prisma__ ||
  (new GeneratedPrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  }) as PrismaClient);

if (process.env.NODE_ENV !== 'production') {
  global.__monolenz_prisma__ = prisma;
}
