import { createClient as createSupabaseBrowserClient } from '@/utils/supabase/client';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiClient = {
  get<T>(path: string, init?: RequestInit): Promise<T>;
  post<T, B = unknown>(path: string, body?: B, init?: RequestInit): Promise<T>;
  put<T, B = unknown>(path: string, body?: B, init?: RequestInit): Promise<T>;
  patch<T, B = unknown>(path: string, body?: B, init?: RequestInit): Promise<T>;
  del<T>(path: string, init?: RequestInit): Promise<T>;
};

function toJsonBody(body: unknown): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;
  if (body instanceof FormData || body instanceof URLSearchParams) return body as unknown as BodyInit;
  return JSON.stringify(body);
}

async function parseJsonSafe<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

export function createBrowserApiClient(baseInit?: RequestInit): ApiClient {
  const supabase = createSupabaseBrowserClient();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

  async function authHeader(): Promise<HeadersInit> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }

  async function request<T>(method: HttpMethod, path: string, init?: RequestInit): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(await authHeader()),
      ...(baseInit?.headers ?? {}),
      ...(init?.headers ?? {}),
    };

    const res = await fetch(`${baseUrl}${path}`, {
      ...baseInit,
      ...init,
      method,
      headers,
    });

    if (!res.ok) {
      const errorBody = await parseJsonSafe<unknown>(res);
      throw new Error(
        `API ${method} ${path} failed: ${res.status} ${res.statusText} — ${typeof errorBody === 'string' ? errorBody : JSON.stringify(errorBody)}`
      );
    }
    return parseJsonSafe<T>(res);
  }

  return {
    get: (path, init) => request('GET', path, init),
    post: (path, body, init) => request('POST', path, { ...init, body: toJsonBody(body) }),
    put: (path, body, init) => request('PUT', path, { ...init, body: toJsonBody(body) }),
    patch: (path, body, init) => request('PATCH', path, { ...init, body: toJsonBody(body) }),
    del: (path, init) => request('DELETE', path, init),
  };
}
