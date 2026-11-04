import { AsyncLocalStorage } from 'node:async_hooks';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const log: ('error' | 'warn')[] = process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'];

/**
 * Build a Prisma client backed by node-postgres. On Cloudflare Workers the
 * connection string comes from Hyperdrive (which does the real pooling).
 *
 * `perRequest` clients are created and `$disconnect`ed within one request
 * (see apps/web/lib/server-api/dispatch.ts), which is what keeps sockets from
 * crossing requests — Workers forbid cross-request I/O. Reusing a connection
 * across queries *inside* the request is fine, so no `maxUses: 1` (that opened
 * a fresh connection per query and logged "This socket has been closed" on teardown).
 */
export function createPrismaClient(connectionString: string, opts: { perRequest?: boolean } = {}): PrismaClient {
  const adapter = new PrismaPg(opts.perRequest ? { connectionString, max: 5 } : { connectionString });
  return new PrismaClient({ adapter, log });
}

const requestScope = new AsyncLocalStorage<PrismaClient>();

/** Run `fn` with `client` as the active Prisma client for everything it awaits. */
export function runWithPrisma<T>(client: PrismaClient, fn: () => T): T {
  return requestScope.run(client, fn);
}

declare global {
  var __monolenz_prisma__: PrismaClient | undefined;
}

// Long-lived processes (Express, `next dev` without a request scope) share one client.
function processClient(): PrismaClient {
  if (!global.__monolenz_prisma__) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set');
    global.__monolenz_prisma__ = createPrismaClient(url);
  }
  return global.__monolenz_prisma__;
}

function activeClient(): PrismaClient {
  return requestScope.getStore() ?? processClient();
}

/**
 * Repositories and services capture this once at construction time. It forwards
 * every access to the request-scoped client when one is set, so the same service
 * instances work on Workers (client per request) and on Node (one shared client).
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = activeClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
