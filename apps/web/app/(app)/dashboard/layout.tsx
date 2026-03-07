import React from 'react';
import { AppSidebar } from '@/app/components/dashboard/AppSidebar';

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className='flex h-[100svh] bg-background text-foreground'>
      <AppSidebar />
      <main className='flex-1 min-w-0 overflow-hidden pt-14 md:pt-0'>{children}</main>
    </div>
  );
}
