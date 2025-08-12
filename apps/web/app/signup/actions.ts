'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export type SignupActionState = {
  error?: string;
  success?: string;
};

export async function signup(_prevState: SignupActionState, formData: FormData): Promise<SignupActionState> {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };

  if (!data.session) {
    return { success: 'Verification email sent. Enter your code or click the link.' };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function verifyEmailOtp(formData: FormData): Promise<SignupActionState> {
  const supabase = await createClient();
  const email = (formData.get('email') as string) || '';
  const token = (formData.get('token') as string) || '';
  if (!email || !token) return { error: 'Email and code are required' };

  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
  if (error) return { error: error.message };

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
