'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Link2, Printer, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MonolenzMark } from '@/components/brand/Logo';

export function ProfileToolbar({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);

  // /{username}?print=1 opens straight into the print dialog (used by "Save as PDF" in the dashboard)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('print') !== '1') return;
    params.delete('print');
    const query = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (query ? `?${query}` : ''));
    const t = setTimeout(() => window.print(), 400);
    return () => clearTimeout(t);
  }, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className='print:hidden sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md'>
      <div className='mx-auto max-w-3xl px-5 sm:px-8 h-14 flex items-center justify-between gap-3'>
        <Link
          href='/'
          className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors min-w-0'
          aria-label='Monolenz home'
        >
          <MonolenzMark size={20} className='shrink-0 text-foreground' />
          <span className='truncate'>
            <span className='text-muted-foreground/70'>/</span>
            <span className='text-foreground'>{username}</span>
          </span>
        </Link>
        <div className='flex items-center gap-2 shrink-0'>
          <Button type='button' variant='ghost' size='sm' onClick={copyLink} aria-live='polite'>
            {copied ? <Check className='size-3.5' /> : <Link2 className='size-3.5' />}
            <span className='hidden sm:inline'>{copied ? 'Copied' : 'Copy link'}</span>
          </Button>
          <Button type='button' variant='outline' size='sm' onClick={() => window.print()}>
            <Printer className='size-3.5' />
            <span className='hidden sm:inline'>Save as PDF</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
