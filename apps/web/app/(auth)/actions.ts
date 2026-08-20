'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiRequest, setSessionCookie } from '@/lib/auth/session';

export type AuthActionState = {
  error?: string;
  success?: string;
  emailSentTo?: string;
  resetUrl?: string;
};

type AuthPayload = {
  success?: boolean;
  message?: string;
  errors?: Array<{ message?: string }>;
  data?: {
    token?: string;
    resetUrl?: string;
  };
};

function errorMessage(body: AuthPayload, fallback: string) {
  return body.errors?.[0]?.message || body.message || fallback;
}

export async function login(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');
  const { ok, body } = await apiRequest<AuthPayload>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!ok || !body.data?.token) return { error: errorMessage(body, 'Invalid email or password') };

  await setSessionCookie(body.data.token);
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signup(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');
  const { ok, body } = await apiRequest<AuthPayload>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!ok || !body.data?.token) return { error: errorMessage(body, 'Could not create account') };

  await setSessionCookie(body.data.token);
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function requestPasswordReset(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = String(formData.get('email') || '');
  if (!email) return { error: 'Email is required' };

  const { ok, body } = await apiRequest<AuthPayload>('/api/v1/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  if (!ok) return { error: errorMessage(body, 'Could not start password reset') };

  return {
    success: 'If that email exists, a reset link was sent.',
    emailSentTo: email,
    resetUrl: body.data?.resetUrl,
  };
}

export async function updatePassword(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const password = String(formData.get('password') || '');
  const confirm = String(formData.get('confirmPassword') || '');
  const token = String(formData.get('token') || '');

  if (password.length < 8) return { error: 'Password must be at least 8 characters' };
  if (password !== confirm) return { error: 'Passwords do not match' };
  if (!token) return { error: 'Reset token is missing. Request a new reset link.' };

  const { ok, body } = await apiRequest<AuthPayload>('/api/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
  if (!ok) return { error: errorMessage(body, 'Could not update password') };

  revalidatePath('/', 'layout');
  redirect('/login');
}
