import { cn } from '@/lib/utils';

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-subtle',
        className
      )}
    >
      <span className='h-px w-6 bg-border-strong' aria-hidden />
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: 'left' | 'center';
}) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      <Eyebrow className={cn(align === 'center' && 'justify-center')}>{eyebrow}</Eyebrow>
      <h2 className='mt-4 text-3xl md:text-[2.75rem] font-semibold tracking-[-0.03em] leading-[1.08] text-balance'>
        {title}
      </h2>
      {description && <p className='mt-4 text-fg-muted text-base md:text-lg leading-relaxed'>{description}</p>}
    </div>
  );
}
