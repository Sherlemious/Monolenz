interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className='flex items-center justify-between px-6 md:px-8 py-5 border-b bg-card/50'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>{title}</h1>
        {description && <p className='text-sm text-muted-foreground mt-0.5'>{description}</p>}
      </div>
      {actions && <div className='flex items-center gap-2 shrink-0'>{actions}</div>}
    </div>
  );
}
