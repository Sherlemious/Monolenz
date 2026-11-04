'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { requestPasswordReset, type AuthActionState } from '@/app/(auth)/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type='submit' disabled={pending} className='mt-2 w-full'>
      {pending ? 'Sending...' : 'Send reset link'}
    </Button>
  );
}

const initialState: AuthActionState = {};

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState(requestPasswordReset, initialState);

  return (
    <Card className='w-full max-w-sm bg-transparent border-0 shadow-none rounded-none py-0 gap-0'>
      <CardHeader className='px-0 pt-0 pb-7 gap-1.5'>
        <CardTitle className='font-serif text-[36px] font-normal leading-[1.05] tracking-[-0.01em]'>
          Reset password
        </CardTitle>
        <CardDescription>We will email you a reset link</CardDescription>
      </CardHeader>
      <CardContent className='px-0 pb-0'>
        {state?.error && (
          <div
            role='alert'
            className='mb-4 rounded-md border border-danger-border bg-danger-soft px-3 py-2 text-[13px] text-destructive'
          >
            {state.error}
          </div>
        )}
        {state?.success && (
          <div role='status' className='mb-3 rounded-md border px-3 py-2 text-sm text-foreground'>
            {state.emailSentTo ? (
              <>
                If an account exists for <span className='font-medium'>{state.emailSentTo}</span>, a reset link was
                sent.
              </>
            ) : (
              state.success
            )}
            {state.resetUrl && (
              <p className='mt-2 break-all text-xs'>
                Dev reset link:{' '}
                <Link href={state.resetUrl} className='underline'>
                  {state.resetUrl}
                </Link>
              </p>
            )}
          </div>
        )}

        <form action={formAction} className='grid gap-4'>
          <div className='grid gap-2'>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' name='email' type='email' required className='h-10' />
          </div>
          <SubmitButton />
          <div className='mt-3 text-[13px] text-muted-foreground'>
            Remembered it?{' '}
            <Link href='/login' className='text-foreground underline'>
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
