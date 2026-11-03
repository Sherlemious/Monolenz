import Link from 'next/link';
import { MonolenzLockup } from '@/components/brand/Logo';

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className='min-h-[100svh] grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]'>
      {/* Form column */}
      <div className='flex flex-col px-6 sm:px-12 py-8'>
        <Link href='/' className='self-start text-foreground hover:opacity-80 transition-opacity' aria-label='Home'>
          <MonolenzLockup height={22} />
        </Link>
        <div className='flex-1 flex items-center justify-center py-12'>{children}</div>
        <p className='text-[12px] text-muted-foreground'>One profile. A page to share, a résumé to print.</p>
      </div>

      {/* Showcase column */}
      <aside
        aria-hidden
        className='hidden lg:flex relative overflow-hidden border-l bg-bg-sunken items-center justify-center p-12'
      >
        <div className='grid-pattern !absolute !w-full !h-full' />
        <div className='relative w-full max-w-md'>
          <div className='absolute -inset-x-6 -top-6 bottom-10 rounded-2xl bg-card/60 border rotate-[-2.5deg]' />
          <div className='relative rounded-2xl border bg-card shadow-lg px-9 py-10'>
            <div className='flex items-center gap-4'>
              <div className='size-12 rounded-full bg-secondary ring-1 ring-border flex items-center justify-center font-serif text-xl'>
                A
              </div>
              <div>
                <p className='font-serif text-[28px] leading-none'>ada-lin</p>
                <p className='mt-1.5 text-[12px] text-muted-foreground'>Staff engineer · distributed systems</p>
              </div>
            </div>

            <SampleSection label='Experience'>
              <SampleRow date='2021 — Now' title='Staff Engineer' sub='Hollow Systems' />
              <SampleRow date='2017 — 2021' title='Senior Engineer' sub='Parcel' />
            </SampleSection>

            <SampleSection label='Skills'>
              <div className='flex flex-wrap gap-1.5'>
                {['Go', 'Rust', 'Kafka', 'Postgres', 'Kubernetes'].map((s) => (
                  <span key={s} className='rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground'>
                    {s}
                  </span>
                ))}
              </div>
            </SampleSection>

            <div className='mt-8 flex items-center justify-between border-t pt-4 text-[11px] text-muted-foreground'>
              <span className='flex items-center gap-1.5'>
                <span className='size-1.5 rounded-full bg-brand' /> Live at /ada-lin
              </span>
              <span>Saved 2 min ago</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function SampleSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className='mt-8'>
      <p className='mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
        {label}
        <span className='h-px flex-1 bg-border' />
      </p>
      <div className='space-y-3'>{children}</div>
    </div>
  );
}

function SampleRow({ date, title, sub }: { date: string; title: string; sub: string }) {
  return (
    <div className='grid grid-cols-[5.5rem_1fr] gap-3'>
      <span className='text-[11px] text-muted-foreground pt-0.5'>{date}</span>
      <span>
        <span className='block text-[13px] font-semibold'>{title}</span>
        <span className='block text-[12px] text-muted-foreground'>{sub}</span>
      </span>
    </div>
  );
}
