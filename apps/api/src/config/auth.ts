import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

export const SESSION_COOKIE = 'ml_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type AuthUser = {
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

export async function signAuthToken(user: AuthUser): Promise<string> {
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function verifyAuthToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payloadToUser(payload);
  } catch {
    return null;
  }
}

export function payloadToUser(payload: JWTPayload): AuthUser | null {
  const id = typeof payload.sub === 'string' ? payload.sub : null;
  const email = typeof payload.email === 'string' ? payload.email : null;
  const role = typeof payload.role === 'string' ? payload.role : 'user';
  if (!id || !email) return null;
  return { id, email, role };
}
