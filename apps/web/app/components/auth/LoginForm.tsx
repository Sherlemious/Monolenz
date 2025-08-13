'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { login, type AuthActionState } from '@/app/(auth)/actions';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type='submit'
      disabled={pending}
      style={{
        marginTop: 8,
        backgroundColor: 'var(--primary)',
        color: 'var(--primary-foreground)',
        border: 'none',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        fontWeight: 600,
        cursor: 'pointer',
        opacity: pending ? 0.8 : 1,
      }}
    >
      {pending ? 'Signing in...' : label}
    </button>
  );
}

const initialState: AuthActionState = {};

export default function LoginForm() {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <form
      action={formAction}
      style={{
        width: '100%',
        maxWidth: 400,
        backgroundColor: 'var(--card)',
        color: 'var(--card-foreground)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 24,
        display: 'grid',
        gap: 12,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Sign in</h1>
        <p style={{ color: 'var(--muted-foreground)', margin: '4px 0 0 0' }}>Welcome back</p>
      </div>

      {state?.error && (
        <div
          role='alert'
          style={{
            border: '1px solid var(--destructive)',
            color: 'var(--destructive)',
            background: 'color-mix(in oklab, var(--destructive) 8%, transparent)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            fontSize: 14,
          }}
        >
          {state.error}
        </div>
      )}

      <label htmlFor='email' style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
        Email
      </label>
      <input
        id='email'
        name='email'
        type='email'
        required
        style={{
          padding: '10px 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--input)',
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
        }}
      />

      <label htmlFor='password' style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
        Password
      </label>
      <input
        id='password'
        name='password'
        type='password'
        required
        style={{
          padding: '10px 12px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--input)',
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
        }}
      />

      <SubmitButton label='Sign in' />

      <div style={{ fontSize: 13, color: 'var(--muted-foreground)', textAlign: 'center', marginTop: 8 }}>
        Don&apos;t have an account?{' '}
        <Link href='/signup' style={{ color: 'var(--foreground)', textDecoration: 'underline' }}>
          Sign up
        </Link>
      </div>
    </form>
  );
}
