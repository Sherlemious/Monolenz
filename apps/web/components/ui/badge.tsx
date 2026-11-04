import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center gap-1 h-5 rounded-full border px-2 text-[11px] font-medium whitespace-nowrap shrink-0 transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-muted-foreground border-border',
        secondary: 'bg-secondary text-muted-foreground border-border',
        accent: 'bg-accent-soft text-brand-ink border-accent-border',
        success: 'bg-success-soft text-success border-success-border',
        info: 'bg-info-soft text-info border-info-border',
        warning: 'bg-warning-soft text-warning border-warning-border',
        destructive: 'bg-danger-soft text-danger border-danger-border',
        outline: 'text-foreground border-border bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return <Comp data-slot='badge' className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
