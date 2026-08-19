import { createApiClientWithTokenProvider } from './common';
export type { ApiClient } from './common';

export function createBrowserApiClient(baseInit?: RequestInit) {
  return createApiClientWithTokenProvider(async () => {
    const res = await fetch('/api/auth/session', { cache: 'no-store' });
    if (!res.ok) return undefined;
    const data = (await res.json()) as { token?: string };
    return data.token;
  }, baseInit);
}
