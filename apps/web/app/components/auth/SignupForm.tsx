'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signup, resendVerification, type AuthActionState as SignupActionState } from '@/app/(auth)/actions';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type='submit' disabled={pending} className='mt-2 w-full'>
      {pending ? pendingLabel : label}
    </Button>
  );
}

const initialState: SignupActionState = {};

export default function SignupForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(signup, initialState);
  const [resendState, resendAction] = useActionState(resendVerification, {} as SignupActionState);

  useEffect(() => {
    if (!state?.emailSentTo) return;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/dashboard');
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace('/dashboard');
    });
    return () => subscription.subscription.unsubscribe();
  }, [state?.emailSentTo, router]);

  return (
    <>
      <Card className='w-full max-w-xs sm:max-w-sm md:max-w-md rounded-lg md:rounded-xl shadow-sm md:shadow-md py-0 gap-0'>
        <CardHeader className='text-center border-b px-6 sm:px-8 md:px-10 py-5 sm:py-6'>
          <CardTitle className='text-lg sm:text-xl md:text-2xl tracking-tight leading-tight'>Create account</CardTitle>
          <CardDescription>Get started with Monolenz</CardDescription>
        </CardHeader>
        <CardContent className='px-6 sm:px-8 md:px-10 pt-5 sm:pt-6 pb-6 sm:pb-8'>
          {state?.error && (
            <div
              role='alert'
              className='mb-3 rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive'
            >
              {state.error}
            </div>
          )}

          {state?.success && (
            <div
              role='status'
              className='mb-3 rounded-md border border-chart-1 bg-chart-1/10 px-3 py-2 text-sm text-foreground'
            >
              {state.emailSentTo ? (
                <>
                  Verification link sent to <span className='font-medium'>{state.emailSentTo}</span>. Click the link in
                  your email to finish signing up.
                </>
              ) : (
                state.success
              )}
            </div>
          )}

          {!state?.emailSentTo && (
            <form action={formAction} className='grid gap-4 sm:gap-6'>
              <div className='grid gap-2'>
                <Label htmlFor='email'>Email</Label>
                <Input id='email' name='email' type='email' required className='h-10 sm:h-11 rounded-lg' />
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='password'>Password</Label>
                <Input id='password' name='password' type='password' required className='h-10 sm:h-11 rounded-lg' />
              </div>

              <SubmitButton label='Sign up' pendingLabel='Creating...' />

              <div className='mt-2 text-center text-xs text-muted-foreground'>
                Already have an account?{' '}
                <Link href='/login' className='text-foreground underline'>
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      {state?.emailSentTo && (
        <form action={resendAction} className='mt-3 grid justify-items-center gap-2'>
          <input type='hidden' name='email' value={state.emailSentTo} />
          {resendState?.error && (
            <div
              role='alert'
              className='rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive'
            >
              {resendState.error}
            </div>
          )}
          {resendState?.success && (
            <div
              role='status'
              className='rounded-md border border-chart-1 bg-chart-1/10 px-3 py-2 text-sm text-foreground'
            >
              Verification link resent to <span className='font-medium'>{state.emailSentTo}</span>.
            </div>
          )}
          <Button variant='outline' className='h-9 px-3'>
            Resend verification link
          </Button>
          <p className='text-xs text-muted-foreground'>Didn’t get the email? Check spam or try another address.</p>
        </form>
      )}
    </>
  );
}
