'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
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
    console.log('🔄 Redirecting to error due to:', error.message);
    redirect('/error');
  }

  console.log('🎉 Login successful, revalidating and redirecting...');
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signup(formData: FormData) {
  console.log('📝 Signup action started');

  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  console.log('📧 Attempting signup for:', data.email);

  const { data: authData, error } = await supabase.auth.signUp(data);

  console.log('✅ Signup response:', authData?.user ? 'User created' : 'No user');
  console.log('❌ Signup error:', error?.message || 'None');

  if (error) {
    console.log('🔄 Redirecting to error due to:', error.message);
    redirect('/error');
  }

  console.log('🎉 Signup successful, revalidating and redirecting...');
  revalidatePath('/', 'layout');
  redirect('/');
}
