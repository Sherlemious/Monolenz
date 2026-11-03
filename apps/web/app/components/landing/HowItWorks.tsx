import { PenLine, Globe, Printer } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

const steps = [
  {
    n: '01',
    icon: PenLine,
    title: 'Write it once',
    body: 'Add your experience, education, skills and more in a focused editor. Every save is kept as its own snapshot.',
  },
  {
    n: '02',
    icon: Globe,
    title: 'Publish your page',
    body: 'Pick a username and your profile goes live at your own URL. Hide anything you are not ready to show.',
  },
  {
    n: '03',
    icon: Printer,
    title: 'Print on demand',
    body: 'Need a resume? Open your public page and save it as a PDF. No second document to keep in sync.',
  },
];

export default function HowItWorks() {
  return (
    <section id='how-it-works' className='scroll-mt-20 border-t border-border'>
      <div className='mx-auto max-w-[1200px] px-4 sm:px-6 py-20 md:py-28'>
        <SectionHeading
          eyebrow='How it works'
          title={
            <>
              From scattered files to <span className='font-serif font-normal italic'>one</span> source of truth.
            </>
          }
          description='No more hunting for the latest resume, or updating the same job in four different places.'
        />

        <ol className='mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3'>
          {steps.map((s) => (
            <li key={s.n} className='relative bg-surface p-6 sm:p-8'>
              <div className='flex items-center justify-between'>
                <span className='inline-flex size-10 items-center justify-center rounded-lg border border-border bg-secondary'>
                  <s.icon className='size-[18px]' />
                </span>
                <span className='font-mono text-xs text-fg-subtle'>{s.n}</span>
              </div>
              <h3 className='mt-8 text-lg font-semibold tracking-[-0.01em]'>{s.title}</h3>
              <p className='mt-2 text-sm leading-relaxed text-fg-muted'>{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
