import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { SESSION_COOKIE } from '@/lib/auth/constants';

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = getSecret();
  if (!token || !secret) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = pathname.startsWith('/dashboard');
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password';
  const loggedIn = await hasValidSession(request);

  if (!loggedIn && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (loggedIn && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
