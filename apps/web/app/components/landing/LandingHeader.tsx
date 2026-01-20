'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

const LandingHeader: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'features' | 'pricing'>('overview');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'features' || hash === 'pricing') {
        setActiveSection(hash);
      } else {
        setActiveSection('overview');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);

    const sectionIds: Array<'features' | 'pricing'> = ['features', 'pricing'];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) {
      return () => window.removeEventListener('hashchange', handleHash);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));

        const firstVisible = visible[0];

        if (firstVisible) {
          setActiveSection(firstVisible.target.id as 'features' | 'pricing');
        } else {
          setActiveSection('overview');
        }
      },
      {
        root: null,
        rootMargin: '-35% 0px -55% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      window.removeEventListener('hashchange', handleHash);
      observer.disconnect();
    };
  }, []);

  const navClass = (section: 'overview' | 'features' | 'pricing') =>
    section === activeSection ? 'text-sm font-semibold text-white' : 'text-sm font-medium text-white/70';

  return (
    <header className='fixed top-0 left-0 right-0 z-50 bg-neutral-900 border-b border-neutral-800 text-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <div className='flex-shrink-0'>
            <Link href='/' className='flex items-center gap-3 text-decoration-none text-white'>
              <Image src='/logo.svg' alt='Monolenz' width={32} height={32} />
              <span className='text-xl font-semibold text-white'>Monolenz</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center gap-8'>
            <Link href='/' className={navClass('overview')}>
              Overview
            </Link>
            <Link href='/#features' className={navClass('features')}>
              Features
            </Link>
            <Link href='/#pricing' className={navClass('pricing')}>
              Pricing
            </Link>
          </nav>

          {/* Mobile menu toggle */}
          <div className='md:hidden flex items-center'>
            <button
              className='inline-flex items-center justify-center p-2 rounded-md text-white bg-transparent border border-neutral-800'
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
              className='bg-transparent text-white border border-neutral-800 py-2 px-4 rounded-md text-sm font-medium'
            >
              Sign in
            </Link>
            <Link
              href='/signup'
              className='bg-white text-black py-2 px-4 rounded-md text-sm font-medium'
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
            <Link
              href='/'
              className={`block px-3 py-2 rounded-md text-base ${
                activeSection === 'overview' ? 'font-semibold text-white' : 'font-medium text-white/70'
              }`}
            >
              Overview
            </Link>
            <Link
              href='/#features'
              className={`block px-3 py-2 rounded-md text-base ${
                activeSection === 'features' ? 'font-semibold text-white' : 'font-medium text-white/70'
              }`}
            >
              Features
            </Link>
            <Link
              href='/#pricing'
              className={`block px-3 py-2 rounded-md text-base ${
                activeSection === 'pricing' ? 'font-semibold text-white' : 'font-medium text-white/70'
              }`}
            >
              Pricing
            </Link>
            <div className='border-t border-neutral-800 pt-4 mt-4'>
              <div className='flex items-center justify-center gap-3'>
                <Link
                  href='/login'
                  className='w-full text-center bg-transparent text-white border border-neutral-800 py-2 px-4 rounded-md text-sm font-medium'
                >
                  Sign in
                </Link>
                <Link
                  href='/signup'
                  className='w-full text-center bg-white text-black py-2 px-4 rounded-md text-sm font-medium'
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
