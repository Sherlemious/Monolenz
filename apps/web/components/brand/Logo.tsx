import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Monolenz logomark only — no wordmark.
 * Renders mark-on-light in light mode and mark-on-dark in dark mode via CSS classes.
 */
export function MonolenzMark({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <>
      <Image
        src='/logos/mark/mark-on-light.svg'
        alt='Monolenz'
        width={size}
        height={size}
        unoptimized
        className={cn('block dark:hidden shrink-0', className)}
      />
      <Image
        src='/logos/mark/mark-on-dark.svg'
        alt='Monolenz'
        width={size}
        height={size}
        unoptimized
        className={cn('hidden dark:block shrink-0', className)}
      />
    </>
  );
}

/**
 * Horizontal lockup: mark + "mono<accent>lenz</accent>" wordmark.
 * Mark uses theme-aware SVG images (light/dark). Wordmark uses HTML text with CSS.
 * height prop controls the mark size; wordmark font scales proportionally.
 */
export function MonolenzLockup({
  className,
  height = 28,
}: {
  className?: string;
  height?: number;
}) {
  const fontSize = Math.round(height * 0.625);

  return (
    <span
      className={cn('inline-flex items-center gap-3 shrink-0', className)}
      aria-label='Monolenz'
      role='img'
    >
      <Image
        src='/logos/mark/mark-on-light.svg'
        alt=''
        width={height}
        height={height}
        unoptimized
        className='block dark:hidden shrink-0'
        aria-hidden
      />
      <Image
        src='/logos/mark/mark-on-dark.svg'
        alt=''
        width={height}
        height={height}
        unoptimized
        className='hidden dark:block shrink-0'
        aria-hidden
      />
      <span
        className='font-bold tracking-[-0.03em] text-foreground leading-none select-none'
        style={{ fontSize: `${fontSize}px` }}
        aria-hidden
      >
        mono<span className='text-accent-ml'>lenz</span>
      </span>
    </span>
  );
}
