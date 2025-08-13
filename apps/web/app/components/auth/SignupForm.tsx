'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { signup, verifyEmailOtp, type AuthActionState as SignupActionState } from '@/app/(auth)/actions';

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
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
      {pending ? pendingLabel : label}
    </button>
  );
}

const initialState: SignupActionState = {};

export default function SignupForm() {
  const [state, formAction] = useActionState(signup, initialState);

  return (
    <>
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
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Create account</h1>
          <p style={{ color: 'var(--muted-foreground)', margin: '4px 0 0 0' }}>Get started with Monolenz</p>
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

        {state?.success && (
          <div
            role='status'
            style={{
              border: '1px solid var(--chart-1)',
              color: 'var(--foreground)',
              background: 'color-mix(in oklab, var(--chart-1) 10%, transparent)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
              fontSize: 14,
            }}
          >
            {state.success}
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

        <SubmitButton label='Sign up' pendingLabel='Creating...' />

        <div style={{ fontSize: 13, color: 'var(--muted-foreground)', textAlign: 'center', marginTop: 8 }}>
          Already have an account?{' '}
          <Link href='/login' style={{ color: 'var(--foreground)', textDecoration: 'underline' }}>
            Sign in
          </Link>
        </div>
      </form>

      {state?.success && (
        <form
          action={async (formData) => {
            await verifyEmailOtp(formData);
          }}
          style={{
            width: '100%',
            maxWidth: 400,
            marginTop: 16,
            backgroundColor: 'var(--card)',
            color: 'var(--card-foreground)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            display: 'grid',
            gap: 12,
          }}
        >
          <div style={{ fontWeight: 600 }}>Verify email</div>
          <label htmlFor='otp-email' style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
            Email
          </label>
          <input
            id='otp-email'
            name='email'
            type='email'
            required
            placeholder='your@email.com'
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--input)',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
            }}
          />
          <label htmlFor='otp-token' style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
            Code
          </label>
          <input
            id='otp-token'
            name='token'
            inputMode='numeric'
            pattern='[0-9]*'
            placeholder='6-digit code'
            required
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--input)',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
              letterSpacing: '0.3em',
              textAlign: 'center',
            }}
          />
          <SubmitButton label='Verify' pendingLabel='Verifying...' />
        </form>
      )}
    </>
  );
}
