import React from 'react';

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className='relative min-h-[100svh] bg-background text-foreground overflow-hidden w-full'>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 opacity-30 dashboard-grid-pattern'
      />
      <div className='relative z-10'>{children}</div>
    </div>
  );
}
