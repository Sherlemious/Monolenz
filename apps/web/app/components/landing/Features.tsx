import { Check } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const bullets = [
  {
    title: 'Single Source of Truth',
    description:
      'Build one comprehensive profile with 18+ content blocks: work, education, projects, publications, skills, and more.',
  },
  {
    title: 'Write Once, Tailor Everywhere',
    description:
      'Generate role-specific resumes, live portfolios (monolenz.com/username), and keep applications in sync—without duplication.',
  },
  {
    title: 'Version Control for Careers',
    description: 'Full version history like git—compare, branch, and evolve your professional story with confidence.',
  },
  {
    title: 'Application Tracking & Insights',
    description: 'Track submissions, statuses, and performance metrics from one place. Know what works.',
  },
  {
    title: 'Live Portfolio',
    description: 'Share a living profile at monolenz.com/username that updates the moment your data does.',
  },
  {
    title: 'Auto Apply',
    description:
      'We pick the best resume and data to apply based on your work history.',
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section id='features'>
      <div className='max-w-[1200px] mx-auto px-4 py-20 md:py-24'>
        <div className='text-center mb-12'>
          <div className='inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-[12px] font-mono uppercase tracking-[0.1em] mb-4 border'>
            <span>Features</span>
          </div>
          <h2 className='text-3xl md:text-4xl font-bold tracking-tight'>Everything in one evolving profile</h2>
          <p className='text-muted-foreground max-w-2xl mx-auto mt-3'>
            MonoLenz isn&apos;t just another CV maker—it&apos;s your central professional identity hub.
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
          {bullets.map((item) => (
            <Card
              key={item.title}
              className='h-full bg-neutral-900 text-white border border-neutral-800 shadow-xl'
            >
              <CardHeader>
                <CardTitle className='mt-2 text-base text-white'>{item.title}</CardTitle>
                <CardDescription className='text-neutral-300'>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className='mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground'>
          <div className='inline-flex items-center gap-2'>
            <Check className='size-4 text-white' /> We apply for you automatically
          </div>
          <div className='inline-flex items-center gap-2'>
            <Check className='size-4 text-white' /> Tailormade application CVs
          </div>
          <div className='inline-flex items-center gap-2'>
            <Check className='size-4 text-white' /> Infinite versions
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
