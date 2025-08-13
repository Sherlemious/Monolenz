import { createClient as createSupabaseBrowserClient } from '@/utils/supabase/client';
import { createApiClientWithTokenProvider } from './common';
export type { ApiClient } from './common';

export function createBrowserApiClient(baseInit?: RequestInit) {
  const supabase = createSupabaseBrowserClient();
  return createApiClientWithTokenProvider(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token;
  }, baseInit);
}
