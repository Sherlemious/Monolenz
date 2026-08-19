import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='min-h-[70svh] bg-background flex flex-col items-center justify-center text-center px-6'>
      <div className='size-16 rounded-2xl bg-muted flex items-center justify-center mb-6 text-lg font-semibold text-muted-foreground'>
        404
      </div>
      <h1 className='text-2xl font-bold mb-2'>Page not found</h1>
      <p className='text-muted-foreground text-sm max-w-sm mb-8'>That URL does not match a page or public profile.</p>
      <Link
        href='/'
        className='inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors'
      >
        Back to home
      </Link>
    </div>
  );
}
