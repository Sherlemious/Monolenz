'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { MonolenzLockup } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#features', label: 'Features' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
];

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <button
      type='button'
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className='inline-flex size-9 items-center justify-center rounded-md text-fg-muted hover:text-foreground hover:bg-secondary transition-colors'
    >
      {mounted ? isDark ? <Sun className='size-4' /> : <Moon className='size-4' /> : <span className='size-4' />}
    </button>
  );
}

const LandingHeader: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const onResize = () => window.innerWidth >= 768 && setMobileOpen(false);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-200',
        scrolled || mobileOpen
          ? 'bg-background/80 backdrop-blur-[14px] border-b border-border'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <div className='mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6'>
        <Link href='/' className='hover:opacity-80 transition-opacity' aria-label='Monolenz home'>
          <MonolenzLockup height={24} />
        </Link>

        <nav className='hidden md:flex items-center gap-1' aria-label='Main'>
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className='rounded-md px-3 py-2 text-sm font-medium text-fg-muted hover:text-foreground transition-colors'
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className='hidden md:flex items-center gap-2'>
          <ThemeToggle />
          <Button variant='ghost' asChild>
            <Link href='/login'>Sign in</Link>
          </Button>
          <Button asChild>
            <Link href='/signup'>Get started</Link>
          </Button>
        </div>

        <div className='flex md:hidden items-center gap-1'>
          <ThemeToggle />
          <button
            type='button'
            className='inline-flex size-9 items-center justify-center rounded-md border border-border text-foreground'
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className='size-5' /> : <Menu className='size-5' />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className='md:hidden border-t border-border px-4 pb-5 pt-3'>
          <nav className='flex flex-col' aria-label='Mobile'>
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className='rounded-md px-3 py-2.5 text-base font-medium text-foreground hover:bg-secondary'
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className='mt-4 grid grid-cols-2 gap-3'>
            <Button variant='outline' asChild>
              <Link href='/login'>Sign in</Link>
            </Button>
            <Button asChild>
              <Link href='/signup'>Get started</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingHeader;
