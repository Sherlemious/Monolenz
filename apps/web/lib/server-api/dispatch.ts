import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createPrismaClient, runWithPrisma } from 'api/core';
import { handleV1Request } from './handle-v1';

const V1_PREFIX = '/api/v1/';

type Runtime = { connectionString: string; waitUntil: (promise: Promise<unknown>) => void };

async function runtime(): Promise<Runtime> {
  try {
    // async form also works during static generation / ISR.
    const { env, ctx } = await getCloudflareContext({ async: true });
    const hyperdrive = (env as { HYPERDRIVE?: { connectionString: string } }).HYPERDRIVE;
    const connectionString = hyperdrive?.connectionString ?? process.env.DATABASE_URL;
    if (connectionString) {
      return { connectionString, waitUntil: (p) => ctx.waitUntil(p) };
    }
  } catch {
    // Not running under OpenNext (e.g. plain `next dev` without bindings).
  }
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('No database configured: bind HYPERDRIVE or set DATABASE_URL');
  return { connectionString, waitUntil: (p) => void p.catch(() => undefined) };
}

/**
 * Serve one /api/v1 request with its own Prisma client. Workers cannot share a
 * socket between requests, so the client lives exactly as long as this call.
 */
export async function dispatchV1(request: Request, path: string[]): Promise<Response> {
  const { connectionString, waitUntil } = await runtime();
  const client = createPrismaClient(connectionString, { perRequest: true });
  try {
    return await runWithPrisma(client, () => handleV1Request(request, path));
  } finally {
    waitUntil(client.$disconnect());
  }
}

/**
 * Server-side fetch for our own API. Calls to /api/v1 run in-process instead of
 * looping back over the network (a Worker fetching its own workers.dev URL is
 * rejected, and it would double the request cost anyway). Anything else, or an
 * explicit NEXT_PUBLIC_API_URL pointing at a separate API, goes through fetch.
 */
export const serverFetch: typeof fetch = async (input, init) => {
  const request = new Request(input, init);
  const { pathname } = new URL(request.url);
  if (!process.env.NEXT_PUBLIC_API_URL?.trim() && pathname.startsWith(V1_PREFIX)) {
    return dispatchV1(request, pathname.slice(V1_PREFIX.length).split('/').filter(Boolean));
  }
  return fetch(request);
};
