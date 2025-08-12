'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { signOut } from '@/app/actions/auth';

const Header: React.FC = () => {
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setIsAuthed(Boolean(data.user)));
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--background)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'var(--primary)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-foreground)',
              fontWeight: 'bold',
              fontSize: '18px',
            }}
          >
            M
          </div>
          <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--foreground)' }}>Monolenz</span>
        </Link>

        {/* Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link
            href="#"
            style={{ color: 'var(--foreground)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}
          >
            Features
          </Link>
          <Link
            href="#"
            style={{ color: 'var(--muted-foreground)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}
          >
            Templates
          </Link>
          <Link
            href="#"
            style={{ color: 'var(--muted-foreground)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}
          >
            Pricing
          </Link>
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAuthed ? (
            <>
              <Link
                href="/dashboard"
                style={{
                  color: 'var(--foreground)',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                  padding: 8,
                }}
              >
                Dashboard
              </Link>
              {pathname !== '/' && (
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 8,
                    borderRadius: 6,
                    color: 'var(--muted-foreground)',
                    cursor: 'pointer',
                  }}
                  aria-label="Notifications"
                >
                  <Bell style={{ width: 18, height: 18 }} />
                </button>
              )}
              <form action={signOut}>
                <button
                  type="submit"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                    padding: '8px 16px',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                  padding: '8px 16px',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
