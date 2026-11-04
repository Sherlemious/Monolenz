'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MonolenzLockup } from '@/components/brand/Logo';
import {
  LayoutDashboard,
  User,
  Pencil,
  History,
  FileText,
  LogOut,
  Menu,
  ChevronsUpDown,
  Sun,
  Moon,
  ArrowUpRight,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { signOut } from '@/app/actions/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { createProfileApi } from '@/lib/api/profile';
import { createBrowserApiClient } from '@/lib/api/client';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/profile/edit', label: 'Editor', icon: Pencil },
  { href: '/dashboard/profile/history', label: 'History', icon: History },
  { href: '/dashboard/resumes', label: 'Resumes', icon: FileText },
];

interface UserInfo {
  email: string;
  initials: string;
}

function useUserInfo(): UserInfo | null {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    fetch('/api/auth/session', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { user?: { email?: string } } | null) => {
        const email = data?.user?.email ?? '';
        if (email) setUser({ email, initials: email.charAt(0).toUpperCase() });
      })
      .catch(() => undefined);
  }, []);

  return user;
}

/** Username for the "public page" shortcut; null until a profile exists */
function useUsername(): string | null {
  const [username, setUsername] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    createProfileApi(createBrowserApiClient())
      .getMyProfile()
      .then((p) => {
        if (!cancelled) setUsername(p?.username ?? null);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // Re-check after navigation so a newly created profile shows up
  }, [pathname]);

  return username;
}

function isActive(pathname: string | null, href: string, exact?: boolean) {
  if (!pathname) return false;
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const user = useUserInfo();
  const username = useUsername();
  const { resolvedTheme, setTheme } = useTheme();
  // Highlight only the most specific matching item (e.g. History, not also My Profile)
  const activeHref = NAV_ITEMS.filter((item) => isActive(pathname, item.href, item.exact)).sort(
    (a, b) => b.href.length - a.href.length
  )[0]?.href;

  return (
    <div className='flex flex-col h-full'>
      {/* Logo */}
      <div className='flex items-center px-5 h-14 shrink-0 text-sidebar-foreground'>
        <Link href='/dashboard' onClick={onNavigate} aria-label='Monolenz home'>
          <MonolenzLockup height={20} />
        </Link>
      </div>

      {/* Navigation */}
      <nav className='flex-1 px-3 pt-2 space-y-0.5' aria-label='Main'>
        {NAV_ITEMS.map((item) => {
          const active = item.href === activeHref;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex items-center gap-2.5 h-8 px-2.5 rounded-md text-[13px] transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                  : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60'
              )}
            >
              {active && (
                <span className='absolute -left-3 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-brand' aria-hidden />
              )}
              <item.icon className={cn('size-4 shrink-0', active ? 'text-sidebar-foreground' : 'opacity-80')} />
              {item.label}
            </Link>
          );
        })}

        {username && (
          <>
            <div className='pt-5 pb-1.5 px-2.5 text-[11px] font-medium text-muted-foreground/80'>Public page</div>
            <a
              href={`/${username}`}
              target='_blank'
              rel='noopener noreferrer'
              className='group flex items-center gap-2.5 h-8 px-2.5 rounded-md text-[13px] text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors'
            >
              <span className='size-2 rounded-full bg-brand shrink-0 mx-1' aria-hidden />
              <span className='truncate'>/{username}</span>
              <ArrowUpRight className='size-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity' />
            </a>
          </>
        )}
      </nav>

      {/* User section */}
      <div className='p-3 border-t border-sidebar-border'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className='flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md text-sm hover:bg-sidebar-accent transition-colors text-left cursor-pointer'>
              <Avatar className='size-7 shrink-0'>
                <AvatarFallback className='bg-secondary text-foreground text-xs font-semibold ring-1 ring-border'>
                  {user?.initials ?? '?'}
                </AvatarFallback>
              </Avatar>
              <span className='flex-1 min-w-0 text-[13px] truncate'>{user?.email ?? 'Loading...'}</span>
              <ChevronsUpDown className='size-3.5 text-muted-foreground shrink-0' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' side='top' className='w-[var(--radix-dropdown-menu-trigger-width)]'>
            <DropdownMenuItem onSelect={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
              {resolvedTheme === 'dark' ? <Sun className='size-4' /> : <Moon className='size-4' />}
              {resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <form action={signOut} className='w-full'>
                <button type='submit' className='flex items-center gap-2 w-full text-left cursor-pointer'>
                  <LogOut className='size-4' />
                  Sign out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className='hidden md:flex w-56 border-r border-sidebar-border bg-sidebar shrink-0 flex-col'>
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className='md:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b border-sidebar-border bg-sidebar/95 backdrop-blur-sm flex items-center px-4 gap-3'>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant='ghost' size='icon' className='size-9'>
              <Menu className='size-5' />
              <span className='sr-only'>Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side='left' className='w-72 p-0' showCloseButton={false}>
            <SheetTitle className='sr-only'>Navigation</SheetTitle>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <Link href='/dashboard' className='text-foreground'>
          <MonolenzLockup height={20} />
        </Link>
      </div>
    </>
  );
}
