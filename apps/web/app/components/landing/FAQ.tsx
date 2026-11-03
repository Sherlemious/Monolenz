import { Plus } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

const faqs = [
  {
    q: 'What is Monolenz?',
    a: 'A single place to keep your professional profile — work, education, skills, projects and more — and publish it as a live page at your own URL.',
  },
  {
    q: 'How do I get a resume out of it?',
    a: 'Open your public page and use your browser’s Print → Save as PDF. The page is styled for print, so there’s no separate resume file to maintain.',
  },
  {
    q: 'Can I keep some things private?',
    a: 'Yes. Any entry can be hidden from your public page while staying in your editor, so you can publish it later.',
  },
  {
    q: 'What happens when I edit my profile?',
    a: 'Each save creates a new version. Previous versions are never overwritten, and your public page shows the latest one.',
  },
  {
    q: 'Is it really free?',
    a: 'Everything you can use today is free. Pro features like ATS-tailored resumes and custom domains are planned and not billed yet.',
  },
];

export default function FAQ() {
  return (
    <section id='faq' className='scroll-mt-20 border-t border-border'>
      <div className='mx-auto grid max-w-[1200px] gap-12 px-4 sm:px-6 py-20 md:grid-cols-[1fr_1.4fr] md:py-28'>
        <SectionHeading
          eyebrow='FAQ'
          title='Questions, answered.'
          description='Anything else? Create a free account and look around — it takes under a minute.'
        />
        <div className='divide-y divide-border border-y border-border'>
          {faqs.map((f) => (
            <details key={f.q} className='group py-5 [&_summary::-webkit-details-marker]:hidden'>
              <summary className='flex cursor-pointer list-none items-center justify-between gap-4 text-left text-[15px] font-medium'>
                {f.q}
                <Plus className='size-4 shrink-0 text-fg-muted transition-transform duration-200 group-open:rotate-45' />
              </summary>
              <p className='mt-3 pr-8 text-sm leading-relaxed text-fg-muted'>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
