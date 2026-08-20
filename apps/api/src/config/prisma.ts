import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { PrismaClient as DefaultPrismaClient } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';

declare global {
  var __monolenz_prisma__: PrismaClient | undefined;
}

const require = createRequire(import.meta.url);

function loadPrismaClient(): typeof DefaultPrismaClient {
  const candidates = [
    path.join(process.cwd(), 'generated', 'prisma', 'index.js'),
    path.join(process.cwd(), 'apps', 'web', 'generated', 'prisma', 'index.js'),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return require(candidate).PrismaClient as typeof DefaultPrismaClient;
    }
  }

  return DefaultPrismaClient;
}

const PrismaClientImpl = loadPrismaClient();

export const prisma: PrismaClient =
  global.__monolenz_prisma__ ||
  new PrismaClientImpl({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__monolenz_prisma__ = prisma;
}
