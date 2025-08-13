import { createClient as createSupabaseServerClient } from '@/utils/supabase/server';
import { createApiClientWithTokenProvider } from './common';
export type { ApiClient } from './common';

export async function createServerApiClient(baseInit?: RequestInit) {
  const supabase = await createSupabaseServerClient();
  return createApiClientWithTokenProvider(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token;
  }, baseInit);
}
