import { createApiClientWithTokenProvider } from './common';
import { getSessionToken } from '@/lib/auth/session';
import { serverFetch } from '@/lib/server-api/dispatch';
export type { ApiClient } from './common';

export async function createServerApiClient(baseInit?: RequestInit) {
  return createApiClientWithTokenProvider(async () => getSessionToken(), baseInit, serverFetch);
}
