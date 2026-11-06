type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Custom error class for API errors with status code information
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly statusText: string,
    public readonly method: HttpMethod,
    public readonly path: string,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /** Check if error is a 404 Not Found */
  is404(): boolean {
    return this.status === 404;
  }

  /** Check if error is a client error (4xx) */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  /** Check if error is a server error (5xx) */
  isServerError(): boolean {
    return this.status >= 500;
  }
}

/**
 * Turn any thrown error into something a person can read, plus per-field
 * messages when the API reported validation errors ("field: message").
 */
export function describeApiError(
  err: unknown,
  fallback = 'Something went wrong. Please try again.'
): { message: string; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};

  if (err instanceof ApiError) {
    const body = (err.body && typeof err.body === 'object' ? err.body : {}) as {
      message?: unknown;
      errors?: unknown;
    };
    if (Array.isArray(body.errors)) {
      for (const entry of body.errors) {
        if (typeof entry !== 'string') continue;
        const idx = entry.indexOf(': ');
        if (idx > 0) fieldErrors[entry.slice(0, idx)] ??= entry.slice(idx + 2);
      }
    }
    const firstFieldError = Object.values(fieldErrors)[0];
    if (err.status === 401) return { message: 'Your session has expired. Please sign in again.', fieldErrors };
    if (err.status === 429) return { message: 'Too many attempts. Wait a moment and try again.', fieldErrors };
    if (err.isServerError() || err.status === 0) return { message: fallback, fieldErrors };
    if (firstFieldError) return { message: firstFieldError, fieldErrors };
    if (typeof body.message === 'string' && body.message) return { message: body.message, fieldErrors };
    return { message: fallback, fieldErrors };
  }

  if (err instanceof TypeError) {
    return { message: 'Could not reach the server. Check your connection and try again.', fieldErrors };
  }
  if (err instanceof Error && err.message && !err.message.startsWith('API ')) {
    return { message: err.message, fieldErrors };
  }
  return { message: fallback, fieldErrors };
}

export type ApiClient = {
  get<T>(path: string, init?: RequestInit): Promise<T>;
  post<T, B = unknown>(path: string, body?: B, init?: RequestInit): Promise<T>;
  put<T, B = unknown>(path: string, body?: B, init?: RequestInit): Promise<T>;
  patch<T, B = unknown>(path: string, body?: B, init?: RequestInit): Promise<T>;
  delete<T>(path: string, init?: RequestInit): Promise<T>;
  getBlob(path: string, init?: RequestInit): Promise<{ blob: Blob; filename?: string }>;
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

export function resolveApiBaseUrl() {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');
  if (typeof window !== 'undefined') return '';
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export function createApiClientWithTokenProvider(
  getAccessToken: () => Promise<string | undefined>,
  baseInit?: RequestInit,
  fetchImpl: typeof fetch = (...args) => fetch(...args)
): ApiClient {
  const baseUrl = resolveApiBaseUrl();

  async function request<T>(method: HttpMethod, path: string, init?: RequestInit): Promise<T> {
    const accessToken = await getAccessToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(baseInit?.headers ?? {}),
      ...(init?.headers ?? {}),
    };

    const res = await fetchImpl(`${baseUrl}${path}`, {
      ...baseInit,
      ...init,
      method,
      headers,
    });

    if (!res.ok) {
      const errorBody = await parseJsonSafe<unknown>(res);
      const message = `API ${method} ${path} failed: ${res.status} ${res.statusText} — ${typeof errorBody === 'string' ? errorBody : JSON.stringify(errorBody)}`;
      throw new ApiError(message, res.status, res.statusText, method, path, errorBody);
    }
    return parseJsonSafe<T>(res);
  }

  return {
    get: (path, init) => request('GET', path, init),
    post: (path, body, init) => request('POST', path, { ...init, body: toJsonBody(body) }),
    put: (path, body, init) => request('PUT', path, { ...init, body: toJsonBody(body) }),
    patch: (path, body, init) => request('PATCH', path, { ...init, body: toJsonBody(body) }),
    delete: (path, init) => request('DELETE', path, init),
    getBlob: async (path, init) => {
      const accessToken = await getAccessToken();
      const headers: HeadersInit = {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(baseInit?.headers ?? {}),
        ...(init?.headers ?? {}),
      };
      const res = await fetchImpl(`${baseUrl}${path}`, { ...baseInit, ...init, method: 'GET', headers });
      if (!res.ok) {
        const errorBody = await parseJsonSafe<unknown>(res);
        const message = `API GET ${path} failed: ${res.status} ${res.statusText} — ${typeof errorBody === 'string' ? errorBody : JSON.stringify(errorBody)}`;
        throw new ApiError(message, res.status, res.statusText, 'GET', path, errorBody);
      }
      const disposition = res.headers.get('content-disposition') ?? '';
      const match = /filename="([^"]+)"/i.exec(disposition);
      return { blob: await res.blob(), filename: match?.[1] };
    },
  };
}
