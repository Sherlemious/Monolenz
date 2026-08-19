'use client';

import { useState } from 'react';
import { Link2, Printer, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ProfileToolbar({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);

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
    <div className='print:hidden flex items-center gap-2 mt-4'>
      <Button type='button' variant='outline' size='sm' onClick={copyLink} className='gap-1.5'>
        {copied ? <Check className='size-3.5' /> : <Link2 className='size-3.5' />}
        {copied ? 'Copied' : 'Copy link'}
      </Button>
      <Button type='button' variant='outline' size='sm' onClick={() => window.print()} className='gap-1.5'>
        <Printer className='size-3.5' />
        Print / Save as PDF
      </Button>
      <span className='text-xs text-muted-foreground hidden sm:inline'>/{username}</span>
    </div>
  );
}
