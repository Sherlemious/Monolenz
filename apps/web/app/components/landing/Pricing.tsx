import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHeading } from './SectionHeading';

const featuresFree = [
  'One profile with all 8 sections',
  'Public page at your own username',
  'Hide entries from your public page',
  'Five public page themes',
  'Print or save as PDF',
  'Full version history of your saves',
];

const featuresPro = [
  'Everything in Free',
  'ATS-tailored resume templates',
  'Application tracking',
  'Multiple public pages',
  'Custom domain',
];

export default function PricingSection() {
  return (
    <section id='pricing' className='scroll-mt-20 border-t border-border'>
      <div className='mx-auto max-w-[1200px] px-4 sm:px-6 py-20 md:py-28'>
        <SectionHeading
          align='center'
          eyebrow='Pricing'
          title='Free while we build.'
          description='Everything available today costs nothing. Pro features are on the roadmap and not billed yet.'
        />

        <div className='mx-auto mt-14 grid max-w-4xl gap-4 md:grid-cols-2'>
          <div className='relative flex flex-col rounded-xl border border-accent-border bg-surface p-7 shadow-[var(--shadow-2)]'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>Free</h3>
              <span className='rounded-full bg-accent-ml px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--accent-ink)]'>
                Available now
              </span>
            </div>
            <div className='mt-5 flex items-baseline gap-1'>
              <span className='text-5xl font-semibold tracking-[-0.04em]'>$0</span>
              <span className='text-sm text-fg-muted'>/ forever</span>
            </div>
            <ul className='mt-7 space-y-3 text-sm'>
              {featuresFree.map((f) => (
                <li key={f} className='flex items-start gap-2.5'>
                  <Check className='mt-0.5 size-4 shrink-0 text-accent-ml' />
                  {f}
                </li>
              ))}
            </ul>
            <Button size='lg' className='mt-8 w-full' asChild>
              <Link href='/signup'>Create your profile</Link>
            </Button>
          </div>

          <div className='relative flex flex-col rounded-xl border border-dashed border-border bg-transparent p-7'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>Pro</h3>
              <span className='rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-fg-muted'>
                On the roadmap
              </span>
            </div>
            <div className='mt-5 flex items-baseline gap-1'>
              <span className='text-5xl font-semibold tracking-[-0.04em] text-fg-subtle'>—</span>
            </div>
            <ul className='mt-7 space-y-3 text-sm text-fg-muted'>
              {featuresPro.map((f) => (
                <li key={f} className='flex items-start gap-2.5'>
                  <Check className='mt-0.5 size-4 shrink-0 text-fg-subtle' />
                  {f}
                </li>
              ))}
            </ul>
            <Button size='lg' variant='outline' className='mt-auto w-full' disabled>
              Not available yet
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
