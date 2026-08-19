import * as React from 'react';

import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot='textarea'
      className={cn(
        'flex field-sizing-content min-h-[80px] w-full rounded-sm border border-border bg-bg-sunken px-3 py-2 text-[13px] text-foreground shadow-none transition-all duration-[120ms] outline-none placeholder:text-fg-subtle focus-visible:border-accent-ml focus-visible:ring-[3px] focus-visible:ring-accent-soft disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:ring-[3px] md:text-[13px]',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
