'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export type AuthActionState = {
  error?: string;
  success?: string;
  emailSentTo?: string;
};

async function getSiteUrl(): Promise<string> {
  const h = await headers();
  const origin = h.get('origin');
  if (origin) return origin;
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = h.get('x-forwarded-proto') || 'http';
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}

export async function login(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signup(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };

  if (!data.session) {
    return { success: 'Verification link sent. Check your email to continue.', emailSentTo: email };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function verifyEmailOtp(formData: FormData): Promise<AuthActionState> {
  const supabase = await createClient();
  const email = (formData.get('email') as string) || '';
  const token = (formData.get('token') as string) || '';
  if (!email || !token) return { error: 'Email and code are required' };

  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
  if (error) return { error: error.message };

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function resendVerification(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const supabase = await createClient();
  const email = (formData.get('email') as string) || '';
  if (!email) return { error: 'Email is required to resend link' };

  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) return { error: error.message, emailSentTo: email };

  return { success: 'Verification link resent.', emailSentTo: email };
}

export async function requestPasswordReset(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const supabase = await createClient();
  const email = (formData.get('email') as string) || '';
  if (!email) return { error: 'Email is required' };

  const siteUrl = await getSiteUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/reset-password`,
  });
  if (error) return { error: error.message };

  return { success: 'Password reset link sent. Check your email.', emailSentTo: email };
}

export async function updatePassword(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const supabase = await createClient();
  const password = (formData.get('password') as string) || '';
  const confirm = (formData.get('confirmPassword') as string) || '';

  if (password.length < 8) return { error: 'Password must be at least 8 characters' };
  if (password !== confirm) return { error: 'Passwords do not match' };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
