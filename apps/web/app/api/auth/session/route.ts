import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { SESSION_COOKIE, payloadToUser } from '@/lib/auth/session';

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !process.env.AUTH_SECRET) {
    return NextResponse.json({ token: null, user: null }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
    return NextResponse.json({ token, user: payloadToUser(payload) });
  } catch {
    return NextResponse.json({ token: null, user: null }, { status: 401 });
  }
}
