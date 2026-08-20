import { cookies } from 'next/headers';
import { verifyAuthToken, type AuthUser, type ServiceContext } from 'api/core';
import { SESSION_COOKIE } from '@/lib/auth/constants';

export async function getRequestUser(request: Request): Promise<AuthUser | null> {
  const header = request.headers.get('authorization');
  const bearer = header?.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (bearer) {
    return verifyAuthToken(bearer);
  }

  const jar = await cookies();
  const cookieToken = jar.get(SESSION_COOKIE)?.value;
  if (!cookieToken) return null;
  return verifyAuthToken(cookieToken);
}

export async function requireUser(request: Request): Promise<AuthUser> {
  const user = await getRequestUser(request);
  if (!user) {
    const error = new Error('Authentication required');
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw Object.assign(error, { statusCode: 401, name: 'UnauthorizedError' });
  }
  return user;
}

export function serviceContext(user?: AuthUser | null, request?: Request): ServiceContext {
  return {
    userId: user?.id,
    userRole: user?.role,
    ipAddress: request?.headers.get('x-forwarded-for') ?? undefined,
    userAgent: request?.headers.get('user-agent') ?? undefined,
  };
}
