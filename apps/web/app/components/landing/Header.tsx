'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Menu, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { signOut } from '@/app/actions/auth';
import styles from './Header.module.css';

const Header = () => {
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDashboard = pathname?.startsWith('/dashboard');

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
        className={`${styles.header} ${styles.headerDark}`}
        style={{
          transform: isHidden ? 'translateY(-100%)' : 'translateY(0)',
        }}
      >
        <div className={styles.inner}>
          {/* Logo */}
          <Link href='/' className={styles.logoLink}>
            <span className={styles.logoText}>Monolenz</span>
          </Link>

          {/* Navigation */}
          <nav className={styles.nav}>
            {!isDashboard ? (
              <>
                <Link
                  href='/dashboard'
                  className={`${styles.navLink} ${styles.navLinkStrong}`}
                >
                  Overview
                </Link>
                <Link href='/#features' className={styles.navLink}>
                  Features
                </Link>
                <Link href='/#pricing' className={`${styles.navLink} ${styles.navLinkMuted}`}>
                  Pricing
                </Link>
              </>
            ) : (
              <>
                <Link
                  href='/dashboard'
                  className={`${styles.navLink} ${styles.navLinkStrong}`}
                >
                  Overview
                </Link>
                <Link
                  href='/dashboard/profile'
                  className={`${styles.navLink} ${styles.navLinkMuted}`}
                >
                  Profile
                </Link>
                <Link
                  href='/dashboard/applications'
                  className={`${styles.navLink} ${styles.navLinkMuted}`}
                >
                  Applications
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <button
            className={styles.mobileToggle}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
          </button>

          {/* Actions */}
          <div className={styles.actions}>
            {isAuthed ? (
              <>
                <Link
                  href='/dashboard'
                  className={styles.dashboardLink}
                >
                  Dashboard
                </Link>
                {pathname !== '/' && (
                  <button
                    className={styles.iconButton}
                    aria-label='Notifications'
                  >
                    <Bell style={{ width: 18, height: 18 }} />
                  </button>
                )}
                <form action={signOut} className={styles.signOutFormDesktop}>
                  <button type='submit' className={styles.signOutButton}>
                    Sign out
                  </button>
                </form>
                {isDashboard && (
                  <form action={signOut} className={styles.signOutFormMobile}>
                    <button type='submit' className={styles.signOutButton}>
                      Sign out
                    </button>
                  </form>
                )}
              </>
            ) : (
              <>
                <Link href='/login' className={styles.authLink}>
                  Sign in
                </Link>
                <Link href='/signup' className={styles.signupLink}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Scroll progress bar */}
        <div aria-hidden className={styles.progressWrapper}>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{
                width: `${Math.round(scrollProgress * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Mobile sheet */}
        {mobileOpen && (
          <div className={styles.mobileSheet}>
            <div className={styles.mobileSheetContent}>
              {!isDashboard ? (
                <>
                  <Link href='/' className={styles.mobileLink}>
                    Overview
                  </Link>
                  <Link href='/#features' className={styles.mobileLink}>
                    Features
                  </Link>
                  <Link href='/#pricing' className={`${styles.mobileLink} ${styles.mobileLinkMuted}`}>
                    Pricing
                  </Link>
                  <div aria-hidden className={styles.mobileDivider} />
                  <Link href='/dashboard' className={styles.mobileLink}>
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link href='/dashboard' className={styles.mobileLink}>
                    Overview
                  </Link>
                  <Link href='/dashboard/profile' className={`${styles.mobileLink} ${styles.mobileLinkMuted}`}>
                    Profile
                  </Link>
                  <Link href='/dashboard/applications' className={`${styles.mobileLink} ${styles.mobileLinkMuted}`}>
                    Applications
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      <div aria-hidden className={styles.spacer} />
    </>
  );
};

export default Header;
