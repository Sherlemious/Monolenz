'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again, or go back to the home page.',
  showRetry = false,
  onRetry,
}: {
  title?: string;
  description?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}) {
  return (
    <div className='min-h-[70svh] bg-background flex flex-col items-center justify-center text-center px-6'>
      <div className='size-16 rounded-2xl bg-muted flex items-center justify-center mb-6 text-lg font-semibold text-muted-foreground'>
        !
      </div>
      <h1 className='text-2xl font-bold mb-2'>{title}</h1>
      <p className='text-muted-foreground text-sm max-w-sm mb-8'>{description}</p>
      <div className='flex items-center gap-3'>
        {showRetry && (
          <Button type='button' variant='outline' onClick={() => (onRetry ? onRetry() : window.location.reload())}>
            Try again
          </Button>
        )}
        <Button asChild>
          <Link href='/'>Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
