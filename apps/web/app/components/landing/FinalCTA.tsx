import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FinalCTA() {
  return (
    <section className='px-4 sm:px-6 pb-20 md:pb-28'>
      <div className='relative mx-auto max-w-[1200px] overflow-hidden rounded-2xl border border-border bg-surface px-6 py-16 text-center sm:px-12 md:py-24'>
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0'
          style={{
            background:
              'radial-gradient(50% 80% at 50% 100%, color-mix(in oklab, var(--accent-color) 20%, transparent), transparent 70%)',
          }}
        />
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 opacity-60'
          style={{
            backgroundImage:
              'linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            maskImage: 'radial-gradient(ellipse at 50% 100%, black 10%, transparent 70%)',
          }}
        />
        <div className='relative'>
          <h2 className='mx-auto max-w-2xl text-3xl sm:text-5xl font-semibold tracking-[-0.035em] leading-[1.05] text-balance'>
            Your next opportunity starts with <span className='font-serif font-normal italic'>one link.</span>
          </h2>
          <p className='mx-auto mt-5 max-w-md text-fg-muted'>
            Claim your username and publish your profile in minutes.
          </p>
          <Button size='lg' className='mt-8 px-6' asChild>
            <Link href='/signup'>
              Get started free
              <ArrowRight className='size-4' />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
