'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { updatePassword, type AuthActionState } from '@/app/(auth)/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type='submit' disabled={pending} className='mt-2 w-full'>
      {pending ? 'Updating...' : 'Update password'}
    </Button>
  );
}

const initialState: AuthActionState = {};

export default function ResetPasswordForm() {
  const [state, formAction] = useActionState(updatePassword, initialState);
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  return (
    <Card className='w-full max-w-sm bg-transparent border-0 shadow-none rounded-none py-0 gap-0'>
      <CardHeader className='px-0 pt-0 pb-7 gap-1.5'>
        <CardTitle className='font-serif text-[36px] font-normal leading-[1.05] tracking-[-0.01em]'>
          New password
        </CardTitle>
        <CardDescription>Choose a password for your account</CardDescription>
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

        <form action={formAction} className='grid gap-4'>
          <input type='hidden' name='token' value={token} />
          {!token && (
            <div
              role='alert'
              className='rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive'
            >
              This reset link is missing a token. Request a new one from the forgot password page.
            </div>
          )}
          <div className='grid gap-2'>
            <Label htmlFor='password'>Password</Label>
            <Input id='password' name='password' type='password' minLength={8} required className='h-10' />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='confirmPassword'>Confirm password</Label>
            <Input
              id='confirmPassword'
              name='confirmPassword'
              type='password'
              minLength={8}
              required
              className='h-10'
            />
          </div>
          <SubmitButton />
          <div className='mt-3 text-[13px] text-muted-foreground'>
            <Link href='/login' className='text-foreground underline'>
              Back to sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
