'use client';

import React from 'react';
import { Check, GitBranch, Layers, FileText, Globe, EyeOff, Palette } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const bullets = [
  {
    title: 'Single source of truth',
    description:
      'One profile with eight content types: work, education, skills, projects, certifications, languages, volunteer work, and awards.',
    icon: Layers,
  },
  {
    title: 'Live portfolio URL',
    description: 'Share a public page at /your-username. Updates go live when you save.',
    icon: Globe,
  },
  {
    title: 'Printable resume',
    description: 'Open your public page and save a PDF from the browser. No separate resume file to keep in sync.',
    icon: FileText,
  },
  {
    title: 'Hide what you want private',
    description: 'Keep entries in your editor and hide them from the public page until you are ready to show them.',
    icon: EyeOff,
  },
  {
    title: 'Themes',
    description: 'Five built-in themes so your public page can match the tone you want.',
    icon: Palette,
  },
  {
    title: 'On the roadmap',
    description:
      'ATS-tailored resumes, application tracking, and richer version history are planned — not shipped yet.',
    icon: GitBranch,
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
            Monolenz is a professional identity hub: write your story once, publish it, and print it when you need a
            resume.
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
          {bullets.map((item) => (
            <Card key={item.title} className='h-full'>
              <CardHeader>
                <div className='inline-flex items-center justify-center size-9 rounded-md bg-secondary text-fg-muted border border-border'>
                  <item.icon className='size-5' />
                </div>
                <CardTitle className='mt-2 text-base'>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className='mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-fg-muted'>
          <div className='inline-flex items-center gap-2'>
            <Check className='size-4 text-accent-ml' /> 8 content types
          </div>
          <div className='inline-flex items-center gap-2'>
            <Check className='size-4 text-success' /> Live portfolio URL
          </div>
          <div className='inline-flex items-center gap-2'>
            <Check className='size-4 text-info' /> Print to PDF
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
