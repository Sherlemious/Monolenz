'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Bell, Menu, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { signOut } from '@/app/actions/auth';
import { cn } from '@/lib/utils';

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
        className={cn(
          'fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md transition-transform duration-300 ease-in-out will-change-transform',
          isHidden ? '-translate-y-full' : 'translate-y-0'
        )}
      >
        <div className='mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4'>
          {/* Logo */}
          <Link href='/' className='flex items-center gap-3 no-underline'>
            <Image src='/logo.svg' alt='Monolenz' width={32} height={32} />
            <span className='text-xl font-semibold text-foreground'>Monolenz</span>
          </Link>

          {/* Navigation */}
          <nav className='hidden items-center gap-8 md:flex'>
            {!isDashboard ? (
              <>
                <Link
                  href='/dashboard'
                  className='text-sm font-semibold text-foreground no-underline'
                >
                  Overview
                </Link>
                <Link
                  href='/#features'
                  className='text-sm font-medium text-foreground no-underline'
                >
                  Features
                </Link>
                <Link
                  href='/#pricing'
                  className='text-sm font-medium text-muted-foreground no-underline'
                >
                  Pricing
                </Link>
              </>
            ) : (
              <>
                <Link
                  href='/dashboard'
                  className='text-sm font-semibold text-foreground no-underline'
                >
                  Overview
                </Link>
                <Link
                  href='/dashboard/profile'
                  className='text-sm font-medium text-muted-foreground no-underline'
                >
                  Profile
                </Link>
                <Link
                  href='/dashboard/applications'
                  className='text-sm font-medium text-muted-foreground no-underline'
                >
                  Applications
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <button
            className='flex items-center justify-center rounded-md border border-border bg-transparent p-2 text-foreground md:hidden'
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className='h-[18px] w-[18px]' /> : <Menu className='h-[18px] w-[18px]' />}
          </button>

          {/* Actions */}
          <div className='flex items-center gap-3'>
            {isAuthed ? (
              <>
                <Link
                  href='/dashboard'
                  className='hidden p-2 text-sm font-medium text-foreground no-underline md:inline-flex'
                >
                  Dashboard
                </Link>
                {pathname !== '/' && (
                  <button
                    className='cursor-pointer rounded-md border-none bg-transparent p-2 text-muted-foreground'
                    aria-label='Notifications'
                  >
                    <Bell className='h-[18px] w-[18px]' />
                  </button>
                )}
                <form action={signOut} className='hidden md:inline-flex'>
                  <button
                    type='submit'
                    className='cursor-pointer rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground'
                  >
                    Sign out
                  </button>
                </form>
                {isDashboard && (
                  <form action={signOut} className='inline-flex md:hidden'>
                    <button
                      type='submit'
                      className='cursor-pointer rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground'
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
                  className='rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground no-underline'
                >
                  Sign in
                </Link>
                <Link
                  href='/signup'
                  className='rounded-md border-none bg-primary px-4 py-2 text-sm font-medium text-primary-foreground no-underline'
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
          className='absolute bottom-0 left-0 right-0 h-[2px] bg-transparent'
        >
          <div
            className='h-[2px] bg-primary transition-[width] duration-120 ease-linear'
            style={{
              width: `${Math.round(scrollProgress * 100)}%`,
            }}
          />
        </div>

        {/* Mobile sheet */}
        {mobileOpen && (
          <div
            className='absolute left-0 right-0 top-16 border-b border-border bg-background md:hidden'
          >
            <div className='flex flex-col gap-3 p-4'>
              {!isDashboard ? (
                <>
                  <Link href='/' className='text-sm'>
                    Overview
                  </Link>
                  <Link href='/#features' className='text-sm'>
                    Features
                  </Link>
                  <Link href='/#pricing' className='text-sm text-muted-foreground'>
                    Pricing
                  </Link>
                  <div aria-hidden className='my-2 h-[1px] bg-border' />
                  <Link href='/dashboard' className='text-sm'>
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link href='/dashboard' className='text-sm'>
                    Overview
                  </Link>
                  <Link href='/dashboard/profile' className='text-sm text-muted-foreground'>
                    Profile
                  </Link>
                  <Link href='/dashboard/applications' className='text-sm text-muted-foreground'>
                    Applications
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      <div aria-hidden className='h-16' />
    </>
  );
};

export default Header;
