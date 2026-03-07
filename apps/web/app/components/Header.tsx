'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Bell, Menu, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { signOut } from '@/app/actions/auth';

const Header: React.FC = () => {
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDashboard = useMemo(() => pathname?.startsWith('/dashboard'), [pathname]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setIsAuthed(Boolean(data.user)));
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastY;
      setIsHidden(delta > 8 && currentY > 80);
      lastY = currentY;

      const doc = document.documentElement;
      const max = (doc.scrollHeight || 0) - (window.innerHeight || 0);
      const pct = max > 0 ? Math.min(1, Math.max(0, currentY / max)) : 0;
      setScrollProgress(pct);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--background)',
          backdropFilter: 'blur(8px)',
          transform: isHidden ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 300ms ease',
          willChange: 'transform',
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
          <Link href='/' style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <Image src='/logo.svg' alt='Monolenz' width={32} height={32} />
            <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--foreground)' }}>Monolenz</span>
          </Link>

          {/* Navigation */}
          <nav className='hidden md:flex' style={{ alignItems: 'center', gap: '32px' }}>
            {!isDashboard ? (
              <>
                <Link
                  href='/dashboard'
                  style={{ color: 'var(--foreground)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}
                >
                  Overview
                </Link>
                <Link
                  href='/#features'
                  style={{ color: 'var(--foreground)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}
                >
                  Features
                </Link>
                <Link
                  href='/#pricing'
                  style={{
                    color: 'var(--muted-foreground)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  Pricing
                </Link>
              </>
            ) : (
              <>
                <Link
                  href='/dashboard'
                  style={{ color: 'var(--foreground)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}
                >
                  Overview
                </Link>
                <Link
                  href='/dashboard/profile'
                  style={{
                    color: 'var(--muted-foreground)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  Profile
                </Link>
                <Link
                  href='/dashboard/applications'
                  style={{
                    color: 'var(--muted-foreground)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  Applications
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <button
            className='md:hidden'
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              padding: 8,
              borderRadius: 6,
              color: 'var(--foreground)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
          </button>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAuthed ? (
              <>
                <Link
                  href='/dashboard'
                  className='hidden md:inline-flex'
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
                    aria-label='Notifications'
                  >
                    <Bell style={{ width: 18, height: 18 }} />
                  </button>
                )}
                <form action={signOut} className='hidden md:inline-flex'>
                  <button
                    type='submit'
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
                {isDashboard && (
                  <form action={signOut} className='inline-flex md:hidden'>
                    <button
                      type='submit'
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
                )}
              </>
            ) : (
              <>
                <Link
                  href='/login'
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
                  href='/signup'
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

        {/* Scroll progress bar */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 2,
            background: 'transparent',
          }}
        >
          <div
            style={{
              height: 2,
              width: `${Math.round(scrollProgress * 100)}%`,
              background: 'var(--primary)',
              transition: 'width 120ms linear',
            }}
          />
        </div>

        {/* Mobile sheet */}
        {mobileOpen && (
          <div
            className='md:hidden'
            style={{
              position: 'absolute',
              top: 64,
              left: 0,
              right: 0,
              borderBottom: '1px solid var(--border)',
              backgroundColor: 'var(--background)',
            }}
          >
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {!isDashboard ? (
                <>
                  <Link href='/' style={{ fontSize: 14 }}>
                    Overview
                  </Link>
                  <Link href='/#features' style={{ fontSize: 14 }}>
                    Features
                  </Link>
                  <Link href='/#pricing' style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>
                    Pricing
                  </Link>
                  <div aria-hidden style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
                  <Link href='/dashboard' style={{ fontSize: 14 }}>
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link href='/dashboard' style={{ fontSize: 14 }}>
                    Overview
                  </Link>
                  <Link href='/dashboard/profile' style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>
                    Profile
                  </Link>
                  <Link href='/dashboard/applications' style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>
                    Applications
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      <div aria-hidden style={{ height: 64 }} />
    </>
  );
};

export default Header;
