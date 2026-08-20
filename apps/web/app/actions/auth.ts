'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { clearSessionCookie } from '@/lib/auth/session';

export async function signOut() {
  await clearSessionCookie();
  revalidatePath('/', 'layout');
  redirect('/');
}
