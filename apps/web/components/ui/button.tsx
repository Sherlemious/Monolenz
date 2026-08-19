import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-[13px] font-medium transition-all duration-[120ms] ease-[cubic-bezier(0.22,1,0.36,1)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] active:translate-y-px select-none tracking-[-0.005em]",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground font-semibold hover:bg-primary/85 hover:shadow-[0_0_0_3px_var(--accent-soft)] focus-visible:ring-[color:var(--accent-soft)]',
        secondary: 'bg-secondary text-foreground border border-border hover:bg-bg-raised hover:border-border-strong',
        ghost: 'text-muted-foreground hover:bg-secondary hover:text-foreground',
        outline: 'border border-border-strong text-foreground hover:bg-secondary',
        destructive:
          'bg-destructive text-white font-semibold hover:bg-destructive/90 focus-visible:ring-destructive/20',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-3.5 py-2 has-[>svg]:px-3',
        sm: 'h-7 rounded-xs gap-1.5 px-2.5 text-xs has-[>svg]:px-2',
        lg: 'h-11 px-5 text-sm has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return <Comp data-slot='button' className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
