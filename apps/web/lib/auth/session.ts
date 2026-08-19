import { cookies } from 'next/headers';
import { jwtVerify, type JWTPayload } from 'jose';
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from './constants';

export { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS };

export type SessionUser = {
  id: string;
  email: string;
  role: string;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET must be set to a string of at least 32 characters');
  }
  return new TextEncoder().encode(secret);
}

export function payloadToUser(payload: JWTPayload): SessionUser | null {
  const id = typeof payload.sub === 'string' ? payload.sub : null;
  const email = typeof payload.email === 'string' ? payload.email : null;
  const role = typeof payload.role === 'string' ? payload.role : 'user';
  if (!id || !email) return null;
  return { id, email, role };
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payloadToUser(payload);
  } catch {
    return null;
  }
}

export async function getSessionToken(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await getSessionToken();
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export function apiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; body: T }> {
  const token = await getSessionToken();
  const res = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
  const body = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, body };
}
