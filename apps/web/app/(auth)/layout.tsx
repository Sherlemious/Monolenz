import type { ReactNode } from 'react';
import LandingHeader from '@/app/components/landing/LandingHeader';

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='relative min-h-screen bg-neutral-950 text-white'>
      <div aria-hidden className='grid-pattern' />
      <LandingHeader />
      <div className='relative z-10'>{children}</div>
    </div>
  );
}
