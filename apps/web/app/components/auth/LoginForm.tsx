'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { login, type AuthActionState } from '@/app/(auth)/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type='submit' disabled={pending} className='mt-2 w-full'>
      {pending ? 'Signing in...' : label}
    </Button>
  );
}

const initialState: AuthActionState = {};

export default function LoginForm() {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <Card className='w-full max-w-sm bg-transparent border-0 shadow-none rounded-none py-0 gap-0'>
      <CardHeader className='px-0 pt-0 pb-7 gap-1.5'>
        <CardTitle className='font-serif text-[36px] font-normal leading-[1.05] tracking-[-0.01em]'>Sign in</CardTitle>
        <CardDescription>Welcome back</CardDescription>
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
          <div className='grid gap-2'>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' name='email' type='email' required className='h-10' />
          </div>

          <div className='grid gap-2'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='password'>Password</Label>
              <Link href='/forgot-password' className='text-xs text-muted-foreground underline'>
                Forgot password?
              </Link>
            </div>
            <Input id='password' name='password' type='password' required className='h-10' />
          </div>

          <SubmitButton label='Sign in' />

          <div className='mt-3 text-[13px] text-muted-foreground'>
            Don&apos;t have an account?{' '}
            <Link href='/signup' className='text-foreground underline'>
              Sign up
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
