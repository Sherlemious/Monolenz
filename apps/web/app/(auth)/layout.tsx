import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className='min-h-[100svh] grid place-items-center p-4 sm:p-6'>
      <div className='w-full flex flex-col items-center'>
        <Link href='/' className='flex items-center gap-3 mb-8'>
          <Image src='/logo.svg' alt='Monolenz' width={32} height={32} />
          <span className='text-xl font-semibold text-foreground'>Monolenz</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
