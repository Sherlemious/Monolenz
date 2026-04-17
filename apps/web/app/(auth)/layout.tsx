import Link from 'next/link';
import { MonolenzLockup } from '@/components/brand/Logo';

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className='min-h-[100svh] grid place-items-center p-4 sm:p-6'>
      <div className='w-full flex flex-col items-center'>
        <Link href='/' className='mb-8 text-foreground hover:opacity-80 transition-opacity'>
          <MonolenzLockup height={26} />
        </Link>
        {children}
      </div>
    </div>
  );
}
