import React from 'react';

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className='relative min-h-[100svh] bg-background text-foreground overflow-hidden w-full'>
      <div className='relative z-10'>{children}</div>
    </div>
  );
}
