'use client';

import { useMemo } from 'react';
import { createBrowserApiClient } from '@/lib/api/client';
import type { ApiClient } from '@/lib/api/common';

export function useApiClient(): ApiClient {
  return useMemo(() => createBrowserApiClient(), []);
}
