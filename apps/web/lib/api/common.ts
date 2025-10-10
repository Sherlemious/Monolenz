type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class ApiError extends Error{
  status: number;
  statusText: string;

  constructor (message: string , status: number , statusText: string){
    super(message);
    this.status = status;
    this.statusText = statusText;
    this.name = 'ApiError';
  }
}



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

export function createApiClientWithTokenProvider(
  getAccessToken: () => Promise<string | undefined>,
  baseInit?: RequestInit
): ApiClient {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

  async function request<T>(method: HttpMethod, path: string, init?: RequestInit): Promise<T> {
    const accessToken = await getAccessToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
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
      throw new ApiError(
        `API ${method} ${path} failed: ${res.status} ${res.statusText} — ${typeof errorBody === 'string' ? errorBody : JSON.stringify(errorBody)}`,
        res.status,
        res.statusText
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
