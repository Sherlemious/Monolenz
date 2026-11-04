import { Check, EyeOff, FileText, GitCommitHorizontal, Layers, Palette } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { cn } from '@/lib/utils';

const categories = [
  'Work experience',
  'Education',
  'Skills',
  'Projects',
  'Certifications',
  'Languages',
  'Volunteer',
  'Awards',
];

const themes = [
  { name: 'Default', bg: 'oklch(0.985 0.003 90)', fg: 'oklch(0.18 0.01 250)', ac: 'oklch(0.72 0.20 128)' },
  { name: 'Midnight', bg: 'oklch(0.18 0.03 270)', fg: 'oklch(0.95 0.01 270)', ac: 'oklch(0.70 0.15 280)' },
  { name: 'Ocean', bg: 'oklch(0.96 0.02 230)', fg: 'oklch(0.25 0.06 240)', ac: 'oklch(0.60 0.14 230)' },
  { name: 'Forest', bg: 'oklch(0.96 0.02 150)', fg: 'oklch(0.25 0.05 150)', ac: 'oklch(0.55 0.13 150)' },
  { name: 'Sunset', bg: 'oklch(0.97 0.02 60)', fg: 'oklch(0.28 0.06 40)', ac: 'oklch(0.68 0.17 45)' },
];

const versions = [
  { label: 'Added Northwind Labs role', time: 'Today' },
  { label: 'Updated skills', time: '3 days ago' },
  { label: 'First publish', time: 'Last month' },
];

function Tile({
  className,
  icon: Icon,
  title,
  body,
  children,
}: {
  className?: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface p-6 sm:p-7 transition-colors hover:border-border-strong',
        className
      )}
    >
      <div className='flex items-center gap-2.5'>
        <Icon className='size-4 text-fg-muted' />
        <h3 className='text-[15px] font-semibold tracking-[-0.01em]'>{title}</h3>
      </div>
      <p className='mt-2 max-w-md text-sm leading-relaxed text-fg-muted'>{body}</p>
      {children && <div className='mt-6 flex-1'>{children}</div>}
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section id='features' className='scroll-mt-20 border-t border-border'>
      <div className='mx-auto max-w-[1200px] px-4 sm:px-6 py-20 md:py-28'>
        <SectionHeading
          eyebrow='Features'
          title='Everything your professional story needs. Nothing it doesn’t.'
          description='A calm, focused toolset — built around one profile that powers everything else.'
        />

        <div className='mt-14 grid gap-4 md:grid-cols-6'>
          <Tile
            className='md:col-span-4'
            icon={Layers}
            title='Eight sections, one profile'
            body='Structured fields for every part of your career, so your story stays consistent wherever it shows up.'
          >
            <div className='flex flex-wrap gap-2'>
              {categories.map((c, i) => (
                <span
                  key={c}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px]',
                    i < 4 ? 'border-accent-border bg-accent-soft text-foreground' : 'border-border text-fg-muted'
                  )}
                >
                  {i < 4 && <Check className='size-3.5' />}
                  {c}
                </span>
              ))}
            </div>
          </Tile>

          <Tile
            className='md:col-span-2'
            icon={EyeOff}
            title='Private by choice'
            body='Keep drafts and old roles in your editor without showing them publicly.'
          >
            <div className='space-y-2'>
              {[
                { t: 'Staff Engineer', on: true },
                { t: 'Side project', on: false },
              ].map((r) => (
                <div
                  key={r.t}
                  className='flex items-center justify-between rounded-lg border border-border bg-surface-2/50 px-3 py-2'
                >
                  <span className={cn('text-[13px]', !r.on && 'text-fg-subtle line-through')}>{r.t}</span>
                  <span
                    className={cn(
                      'relative h-5 w-9 rounded-full border transition-colors',
                      r.on ? 'border-accent-border bg-accent-ml' : 'border-border bg-secondary'
                    )}
                    aria-hidden
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 size-3.5 rounded-full bg-surface shadow-sm',
                        r.on ? 'right-0.5' : 'left-0.5'
                      )}
                    />
                  </span>
                </div>
              ))}
            </div>
          </Tile>

          <Tile
            className='md:col-span-2'
            icon={Palette}
            title='Five themes'
            body='Choose a look for your public page that fits your tone.'
          >
            <div className='grid grid-cols-5 gap-2'>
              {themes.map((t) => (
                <div key={t.name} className='flex flex-col items-center gap-1.5'>
                  <div
                    className='aspect-[3/4] w-full rounded-md border border-border p-1.5'
                    style={{ background: t.bg }}
                    title={t.name}
                  >
                    <div className='h-1 w-3/4 rounded-full' style={{ background: t.fg }} />
                    <div className='mt-1 h-1 w-1/2 rounded-full opacity-40' style={{ background: t.fg }} />
                    <div className='mt-2 h-1.5 w-1/3 rounded-full' style={{ background: t.ac }} />
                  </div>
                  <span className='text-[10px] text-fg-subtle'>{t.name}</span>
                </div>
              ))}
            </div>
          </Tile>

          <Tile
            className='md:col-span-2'
            icon={GitCommitHorizontal}
            title='Every save is a snapshot'
            body='Edits never overwrite history — each save creates a new immutable version.'
          >
            <ol className='relative space-y-3 border-l border-border pl-4'>
              {versions.map((v, i) => (
                <li key={v.label} className='relative'>
                  <span
                    className={cn(
                      'absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-surface',
                      i === 0 ? 'bg-accent-ml' : 'bg-border-strong'
                    )}
                  />
                  <div className='text-[13px]'>{v.label}</div>
                  <div className='font-mono text-[10px] text-fg-subtle'>{v.time}</div>
                </li>
              ))}
            </ol>
          </Tile>

          <Tile
            className='md:col-span-2'
            icon={FileText}
            title='Resume, without the file'
            body='Your public page is print-optimised. Save as PDF from any browser in seconds.'
          >
            <div className='mx-auto w-28 rotate-[-3deg] rounded-md border border-border bg-bg-raised p-3 shadow-[var(--shadow-2)] transition-transform group-hover:rotate-0'>
              <div className='h-1.5 w-2/3 rounded-full bg-foreground/80' />
              <div className='mt-1 h-1 w-1/2 rounded-full bg-fg-subtle/60' />
              <div className='mt-3 space-y-1'>
                {[90, 75, 85, 60, 80, 70].map((w, i) => (
                  <div key={i} className='h-1 rounded-full bg-border-strong/70' style={{ width: `${w}%` }} />
                ))}
              </div>
              <div className='mt-3 font-mono text-[8px] text-fg-subtle'>resume.pdf</div>
            </div>
          </Tile>
        </div>
      </div>
    </section>
  );
}
