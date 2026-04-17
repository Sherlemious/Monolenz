'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MonolenzLockup } from '@/components/brand/Logo';
import { LayoutDashboard, User, Pencil, LogOut, Menu, ChevronsUpDown, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { createClient } from '@/utils/supabase/client';
import { signOut } from '@/app/actions/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/profile', label: 'My Profile', icon: User },
  { href: '/dashboard/profile/edit', label: 'Edit Profile', icon: Pencil },
];

interface UserInfo {
  email: string;
  initials: string;
}

function useUserInfo(): UserInfo | null {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const email = data.user.email ?? '';
        const initials = email.charAt(0).toUpperCase();
        setUser({ email, initials });
      }
    });
  }, []);

  return user;
}

function isActive(pathname: string | null, href: string, exact?: boolean) {
  if (!pathname) return false;
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const user = useUserInfo();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className='flex flex-col h-full'>
      {/* Logo */}
      <div className='flex items-center px-5 h-14 shrink-0 text-sidebar-foreground'>
        <MonolenzLockup height={22} />
      </div>

      <Separator />

      {/* Navigation */}
      <nav className='flex-1 px-3 py-4 space-y-1'>
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent'
              )}
            >
              <item.icon className='size-4 shrink-0' />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Dark mode toggle */}
      <div className='px-3 py-2'>
        <button
          type='button'
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className='flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors'
          title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {resolvedTheme === 'dark' ? <Sun className='size-4 shrink-0' /> : <Moon className='size-4 shrink-0' />}
          {resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>

      <Separator />

      {/* User section */}
      <div className='p-3'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className='flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-sidebar-accent transition-colors text-left cursor-pointer'>
              <Avatar className='size-8 shrink-0'>
                <AvatarFallback className='bg-primary/10 text-primary text-xs font-semibold'>
                  {user?.initials ?? '?'}
                </AvatarFallback>
              </Avatar>
              <span className='flex-1 min-w-0 text-sm font-medium truncate'>{user?.email ?? 'Loading...'}</span>
              <ChevronsUpDown className='size-4 text-sidebar-foreground/40 shrink-0' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' side='top' className='w-[var(--radix-dropdown-menu-trigger-width)]'>
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
      <aside className='hidden md:flex w-60 border-r border-sidebar-border bg-sidebar shrink-0 flex-col'>
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
