import Link from 'next/link';
import { MonolenzLockup } from '@/components/brand/Logo';

export default function LandingFooter() {
  return (
    <footer className='border-t border-border'>
      <div className='mx-auto flex max-w-[1200px] flex-col gap-8 px-4 sm:px-6 py-10 md:flex-row md:items-center md:justify-between'>
        <div className='flex flex-col gap-3'>
          <MonolenzLockup height={22} />
          <p className='text-sm text-fg-muted'>Your career&apos;s source of truth.</p>
        </div>
        <nav className='flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg-muted' aria-label='Footer'>
          <Link href='/#how-it-works' className='hover:text-foreground transition-colors'>
            How it works
          </Link>
          <Link href='/#features' className='hover:text-foreground transition-colors'>
            Features
          </Link>
          <Link href='/#pricing' className='hover:text-foreground transition-colors'>
            Pricing
          </Link>
          <Link href='/login' className='hover:text-foreground transition-colors'>
            Sign in
          </Link>
          <Link href='/signup' className='hover:text-foreground transition-colors'>
            Sign up
          </Link>
        </nav>
      </div>
      <div className='mx-auto max-w-[1200px] px-4 sm:px-6 pb-10 font-mono text-[11px] text-fg-subtle'>
        © {new Date().getFullYear()} Monolenz
      </div>
    </footer>
  );
}
