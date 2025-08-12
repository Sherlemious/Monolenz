'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export type AuthActionState = {
  error?: string;
  success?: string;
};

export async function login(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  console.log('🔐 Login action started');

  // Check environment variables
  console.log('🔐 SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'MISSING!');
  console.log('🔐 SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'MISSING!');

  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  console.log('📧 Attempting login for:', data.email);

  const { data: authData, error } = await supabase.auth.signInWithPassword(data);

  console.log('✅ Auth response:', authData?.user ? 'User found' : 'No user');
  console.log('❌ Auth error:', error?.message || 'None');

  if (error) {
    console.log('❌ Login error:', error.message);
    return { error: error.message };
  }

  console.log('🎉 Login successful, revalidating and redirecting...');
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signup(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  console.log('📝 Signup action started');

  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  console.log('📧 Attempting signup for:', data.email);

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  console.log('✅ Signup response:', authData?.user ? 'User created' : 'No user');
  console.log('❌ Signup error:', error?.message || 'None');

  if (error) {
    console.log('❌ Signup error:', error.message);
    return { error: error.message };
  }

  // If email confirmations are enabled, session may be null. Show message instead of redirecting.
  if (!authData.session) {
    console.log('✅ Signup created, awaiting email verification');
    return { success: 'Verification email sent. Enter the code from your email or click the link.' };
  }

  console.log('🎉 Signup successful with session, revalidating and redirecting...');
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function verifyEmailOtp(formData: FormData): Promise<AuthActionState> {
  const email = (formData.get('email') as string) || '';
  const token = (formData.get('token') as string) || '';
  if (!email || !token) return { error: 'Email and code are required' };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
  if (error) return { error: error.message };

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
