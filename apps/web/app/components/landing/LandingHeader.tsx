'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

const LandingHeader: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className='fixed top-0 left-0 right-0 z-50 backdrop-blur-[14px] bg-background/80 border-b border-border'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <div className='flex-shrink-0'>
            <Link href='/' className='flex items-center gap-3 text-decoration-none'>
              <Image src='/logo.svg' alt='Monolenz' width={32} height={32} />
              <span className='text-xl font-semibold text-foreground'>Monolenz</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center gap-8'>
            <Link href='/' className='text-sm font-medium text-foreground'>
              Overview
            </Link>
            <Link href='/#features' className='text-sm font-medium text-foreground'>
              Features
            </Link>
            <Link href='/#pricing' className='text-sm font-medium text-muted-foreground'>
              Pricing
            </Link>
          </nav>

          {/* Mobile menu toggle */}
          <div className='md:hidden flex items-center'>
            <button
              className='inline-flex items-center justify-center p-2 rounded-md text-foreground bg-transparent border border-border'
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className='block h-6 w-6' /> : <Menu className='block h-6 w-6' />}
            </button>
          </div>

          {/* Sign-in and Sign-up buttons */}
          <div className='hidden md:flex items-center gap-3'>
            <Link
              href='/login'
              className='bg-transparent text-foreground border border-border py-2 px-4 rounded-md text-sm font-medium'
            >
              Sign in
            </Link>
            <Link
              href='/signup'
              className='bg-primary text-primary-foreground py-2 px-4 rounded-md text-sm font-medium'
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className='md:hidden'>
          <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
            <Link href='/' className='block px-3 py-2 rounded-md text-base font-medium text-foreground'>
              Overview
            </Link>
            <Link href='/#features' className='block px-3 py-2 rounded-md text-base font-medium text-foreground'>
              Features
            </Link>
            <Link href='/#pricing' className='block px-3 py-2 rounded-md text-base font-medium text-muted-foreground'>
              Pricing
            </Link>
            <div className='border-t border-border pt-4 mt-4'>
              <div className='flex items-center justify-center gap-3'>
                <Link
                  href='/login'
                  className='w-full text-center bg-transparent text-foreground border border-border py-2 px-4 rounded-md text-sm font-medium'
                >
                  Sign in
                </Link>
                <Link
                  href='/signup'
                  className='w-full text-center bg-primary text-primary-foreground py-2 px-4 rounded-md text-sm font-medium'
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingHeader;
