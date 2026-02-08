'use client';

/**
 * useProfile - Hook for profile API with auth integration
 */

import { useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { createProfileApi, type ProfileApi } from '@/lib/api/profile';
import type { ApiClient } from '@/lib/api/profile-blocks';
import { ApiError } from '@/lib/api/common';

// ============================================================================
// Hook
// ============================================================================

export function useProfileApi(): ProfileApi {
  const api = useMemo(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

    type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

    async function request<T>(method: HttpMethod, url: string, body?: unknown): Promise<T> {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(`${apiBaseUrl}${url}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        let parsedError: unknown;
        try {
          parsedError = JSON.parse(errorBody);
        } catch {
          parsedError = errorBody;
        }
        const message = `API ${method} ${url} failed: ${response.status} ${response.statusText}`;
        throw new ApiError(message, response.status, response.statusText, method, url, parsedError);
      }

      if (response.status === 204) {
        return null as T;
      }

      return response.json();
    }

    const client: ApiClient = {
      get: <T>(url: string) => request<T>('GET', url),
      post: <T>(url: string, body?: unknown) => request<T>('POST', url, body),
      put: <T>(url: string, body?: unknown) => request<T>('PUT', url, body),
      delete: <T>(url: string) => request<T>('DELETE', url),
    };

    return createProfileApi(client);
  }, []);

  return api;
}
