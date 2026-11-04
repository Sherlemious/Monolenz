interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Small label above the title, e.g. a breadcrumb or section name */
  eyebrow?: React.ReactNode;
  /** Tailwind max-width class so actions line up with the page content (e.g. 'max-w-5xl') */
  maxWidth?: string;
}

export function PageHeader({ title, description, actions, eyebrow, maxWidth }: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between px-6 md:px-10 pt-8 md:pt-10 pb-6 ${maxWidth ?? ''}`}
    >
      <div className='min-w-0'>
        {eyebrow && <div className='mb-1.5 text-[13px] text-muted-foreground'>{eyebrow}</div>}
        <h1 className='text-[26px] font-semibold tracking-[-0.02em] text-foreground'>{title}</h1>
        {description && <p className='mt-1 text-sm text-muted-foreground max-w-xl'>{description}</p>}
      </div>
      {actions && <div className='flex items-center gap-2 shrink-0'>{actions}</div>}
    </div>
  );
}
