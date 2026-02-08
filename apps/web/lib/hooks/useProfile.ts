'use client';

/**
 * useProfile - Hook for profile API with auth integration
 */

import { useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { createProfileApi, type ProfileApi } from '@/lib/api/profile';
import type { ApiClient } from '@/lib/api/profile-blocks';

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

    const client: ApiClient = {
      async get<T>(url: string): Promise<T> {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const response = await fetch(`${apiBaseUrl}${url}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
          },
        });

        if (!response.ok) {
          const text = await response.text();
          let message = `HTTP ${response.status}`;
          try {
            const json = JSON.parse(text);
            message = json.message ?? json.error ?? message;
          } catch {
            if (text) message = text;
          }
          throw new Error(message);
        }

        return response.json();
      },

      async post<T>(url: string, body?: unknown): Promise<T> {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const response = await fetch(`${apiBaseUrl}${url}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
          const text = await response.text();
          let message = `HTTP ${response.status}`;
          try {
            const json = JSON.parse(text);
            message = json.message ?? json.error ?? message;
          } catch {
            if (text) message = text;
          }
          throw new Error(message);
        }

        return response.json();
      },

      async put<T>(url: string, body?: unknown): Promise<T> {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const response = await fetch(`${apiBaseUrl}${url}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
          const text = await response.text();
          let message = `HTTP ${response.status}`;
          try {
            const json = JSON.parse(text);
            message = json.message ?? json.error ?? message;
          } catch {
            if (text) message = text;
          }
          throw new Error(message);
        }

        return response.json();
      },

      async delete<T>(url: string): Promise<T> {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const response = await fetch(`${apiBaseUrl}${url}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
          },
        });

        if (!response.ok) {
          const text = await response.text();
          let message = `HTTP ${response.status}`;
          try {
            const json = JSON.parse(text);
            message = json.message ?? json.error ?? message;
          } catch {
            if (text) message = text;
          }
          throw new Error(message);
        }

        return response.json();
      },
    };

    return createProfileApi(client);
  }, []);

  return api;
}
