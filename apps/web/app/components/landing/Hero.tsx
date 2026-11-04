'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff, Globe, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Entry = { id: string; role: string; org: string; dates: string };

const categories = [
  'Experience',
  'Education',
  'Skills',
  'Projects',
  'Certifications',
  'Languages',
  'Volunteer',
  'Awards',
];

const entries: Entry[] = [
  { id: 'a', role: 'Senior Product Engineer', org: 'Northwind Labs', dates: '2023 — Now' },
  { id: 'b', role: 'Frontend Engineer', org: 'Paperplane', dates: '2020 — 2023' },
  { id: 'c', role: 'Freelance Developer', org: 'Self-employed', dates: '2018 — 2020' },
];

function ProductPreview() {
  const [hidden, setHidden] = useState<Record<string, boolean>>({ c: true });
  const visible = entries.filter((e) => !hidden[e.id]);

  return (
    <div className='relative mx-auto w-full max-w-[1040px]'>
      {/* glow */}
      <div
        aria-hidden
        className='pointer-events-none absolute -inset-x-10 -top-10 bottom-0 -z-10 rounded-[40px] opacity-70 blur-3xl'
        style={{
          background:
            'radial-gradient(60% 50% at 50% 30%, color-mix(in oklab, var(--accent-color) 22%, transparent), transparent 70%)',
        }}
      />

      <div className='overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-3)]'>
        {/* window chrome */}
        <div className='flex items-center gap-3 border-b border-border bg-bg-sunken/60 px-4 py-2.5'>
          <div className='flex gap-1.5' aria-hidden>
            <span className='size-2.5 rounded-full bg-border-strong' />
            <span className='size-2.5 rounded-full bg-border-strong' />
            <span className='size-2.5 rounded-full bg-border-strong' />
          </div>
          <div className='mx-auto flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1 font-mono text-[11px] text-fg-muted'>
            <Globe className='size-3' />
            monolenz.sherlemious.com/<span className='text-foreground'>alex</span>
          </div>
          <span className='hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-success'>
            <span className='size-1.5 rounded-full bg-success animate-pulse' /> Live
          </span>
        </div>

        <div className='grid md:grid-cols-[180px_1fr_1fr]'>
          {/* sidebar */}
          <aside className='hidden md:block border-r border-border bg-bg-sunken/40 p-3'>
            <div className='px-2 pb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-subtle'>Profile</div>
            <ul className='space-y-0.5'>
              {categories.map((c, i) => (
                <li
                  key={c}
                  className={cn(
                    'flex items-center justify-between rounded-md px-2 py-1.5 text-[12px]',
                    i === 0 ? 'bg-secondary text-foreground font-medium' : 'text-fg-muted'
                  )}
                >
                  {c}
                  {i === 0 && <span className='font-mono text-[10px] text-fg-subtle'>{entries.length}</span>}
                </li>
              ))}
            </ul>
          </aside>

          {/* editor */}
          <div className='border-b md:border-b-0 md:border-r border-border p-4 sm:p-5'>
            <div className='mb-3 flex items-center justify-between'>
              <span className='text-[13px] font-semibold'>Experience</span>
              <span className='font-mono text-[10px] uppercase tracking-[0.12em] text-fg-subtle'>Editor</span>
            </div>
            <ul className='space-y-2'>
              {entries.map((e) => {
                const isHidden = !!hidden[e.id];
                return (
                  <li
                    key={e.id}
                    className={cn(
                      'flex items-start justify-between gap-3 rounded-lg border p-3 transition-colors',
                      isHidden ? 'border-dashed border-border bg-transparent' : 'border-border bg-surface-2/60'
                    )}
                  >
                    <div className={cn('min-w-0 transition-opacity', isHidden && 'opacity-50')}>
                      <div className='truncate text-[13px] font-medium'>{e.role}</div>
                      <div className='truncate text-[12px] text-fg-muted'>
                        {e.org} · {e.dates}
                      </div>
                    </div>
                    <button
                      type='button'
                      onClick={() => setHidden((h) => ({ ...h, [e.id]: !h[e.id] }))}
                      aria-pressed={!isHidden}
                      aria-label={isHidden ? `Show ${e.role} on public page` : `Hide ${e.role} from public page`}
                      className={cn(
                        'inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors',
                        isHidden
                          ? 'border-border text-fg-subtle hover:text-foreground'
                          : 'border-accent-border bg-accent-soft text-foreground'
                      )}
                    >
                      {isHidden ? <EyeOff className='size-3' /> : <Eye className='size-3' />}
                      {isHidden ? 'Hidden' : 'Public'}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className='mt-3 text-[11px] text-fg-subtle'>Try it — toggle an entry and watch the page update.</p>
          </div>

          {/* public page preview */}
          <div className='bg-bg p-4 sm:p-5'>
            <div className='mb-3 flex items-center justify-between'>
              <span className='font-mono text-[10px] uppercase tracking-[0.12em] text-fg-subtle'>Public page</span>
              <span className='inline-flex items-center gap-1 text-[11px] text-fg-muted'>
                <Printer className='size-3' /> Print-ready
              </span>
            </div>
            <div className='rounded-lg border border-border bg-surface p-4'>
              <div className='flex items-center gap-3'>
                <div className='flex size-10 items-center justify-center rounded-full bg-accent-ml font-semibold text-[var(--accent-ink)]'>
                  A
                </div>
                <div>
                  <div className='font-serif text-xl leading-none'>Alex Rivera</div>
                  <div className='mt-1 text-[12px] text-fg-muted'>Product engineer · Lisbon</div>
                </div>
              </div>
              <div className='mt-4 border-t border-border pt-3'>
                <div className='mb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-subtle'>Experience</div>
                <ul className='space-y-2.5'>
                  {visible.map((e) => (
                    <li key={e.id} className='animate-in fade-in slide-in-from-top-1 duration-300'>
                      <div className='flex items-baseline justify-between gap-2'>
                        <span className='truncate text-[12.5px] font-medium'>{e.role}</span>
                        <span className='shrink-0 font-mono text-[10px] text-fg-subtle'>{e.dates}</span>
                      </div>
                      <div className='text-[11.5px] text-fg-muted'>{e.org}</div>
                    </li>
                  ))}
                  {visible.length === 0 && <li className='text-[12px] text-fg-subtle'>Nothing public yet.</li>}
                </ul>
              </div>
              <div className='mt-4 flex flex-wrap gap-1.5'>
                {['TypeScript', 'React', 'Postgres', 'Design systems'].map((s) => (
                  <span key={s} className='rounded-full border border-border px-2 py-0.5 text-[10.5px] text-fg-muted'>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const HeroSection = () => {
  return (
    <section className='relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28'>
      <div className='relative mx-auto max-w-[1200px] px-4 sm:px-6'>
        <div className='mx-auto max-w-3xl text-center'>
          <Link
            href='/signup'
            className='group inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 py-1 pl-1 pr-3 text-[12px] text-fg-muted backdrop-blur hover:border-border-strong transition-colors'
          >
            <span className='rounded-full bg-accent-ml px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--accent-ink)]'>
              Free
            </span>
            Claim your username today
            <ArrowRight className='size-3 transition-transform group-hover:translate-x-0.5' />
          </Link>

          <h1 className='mt-8 text-[2.75rem] leading-[1.02] sm:text-6xl md:text-7xl font-semibold tracking-[-0.045em] text-balance'>
            Write your career <span className='font-serif font-normal italic tracking-[-0.02em]'>once.</span>
            <br />
            <span className='text-fg-muted'>Share it everywhere.</span>
          </h1>

          <p className='mx-auto mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-fg-muted text-pretty'>
            Monolenz is a single home for your professional story. Keep everything in one profile, publish a live page
            at your own URL, and print a clean resume whenever someone asks for a PDF.
          </p>

          <div className='mt-9 flex flex-col sm:flex-row items-center justify-center gap-3'>
            <Button size='lg' className='w-full sm:w-auto px-6' asChild>
              <Link href='/signup'>
                Start building — it&apos;s free
                <ArrowRight className='size-4' />
              </Link>
            </Button>
            <Button size='lg' variant='outline' className='w-full sm:w-auto px-6' asChild>
              <Link href='/#how-it-works'>See how it works</Link>
            </Button>
          </div>
        </div>

        <div className='mt-16 md:mt-20'>
          <ProductPreview />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
