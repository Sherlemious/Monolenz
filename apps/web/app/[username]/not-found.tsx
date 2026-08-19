import Link from 'next/link';

export default function ProfileNotFound() {
  return (
    <div className='min-h-screen bg-background flex flex-col items-center justify-center text-center px-6'>
      <div className='size-20 rounded-3xl bg-muted flex items-center justify-center mb-6'>
        <span className='text-3xl font-bold text-muted-foreground'>?</span>
      </div>
      <h1 className='text-2xl font-bold mb-2'>Profile not found</h1>
      <p className='text-muted-foreground text-sm max-w-sm mb-8'>
        The profile you&apos;re looking for doesn&apos;t exist or may have been removed.
      </p>
      <Link
        href='/'
        className='inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors'
      >
        Back to Home
      </Link>
    </div>
  );
}
