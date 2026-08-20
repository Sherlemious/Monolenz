'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { signup, type AuthActionState as SignupActionState } from '@/app/(auth)/actions';
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
  const [state, formAction] = useActionState(signup, initialState);

  return (
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

        <form action={formAction} className='grid gap-4 sm:gap-6'>
          <div className='grid gap-2'>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' name='email' type='email' required className='h-10 sm:h-11 rounded-lg' />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              name='password'
              type='password'
              minLength={8}
              required
              className='h-10 sm:h-11 rounded-lg'
            />
          </div>

          <SubmitButton label='Sign up' pendingLabel='Creating...' />

          <div className='mt-2 text-center text-xs text-muted-foreground'>
            Already have an account?{' '}
            <Link href='/login' className='text-foreground underline'>
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
