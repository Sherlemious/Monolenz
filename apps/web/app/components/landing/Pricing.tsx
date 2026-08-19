'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const featuresFree = [
  'Master profile with 8 content types',
  'Public portfolio at /username',
  'Hide entries from the public page',
  'Themes for your public profile',
  'Print / save as PDF from the browser',
];

const featuresPro = [
  'Everything in Free',
  'ATS-tailored resume templates',
  'Application tracking',
  'Multiple public pages',
  'Custom domain',
];

const PricingSection: React.FC = () => {
  return (
    <section id='pricing'>
      <div className='max-w-[1200px] mx-auto px-4 py-20 md:py-24'>
        <div className='text-center mb-12'>
          <div className='inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-[12px] font-mono uppercase tracking-[0.1em] mb-4 border'>
            <span>Pricing</span>
          </div>
          <h2 className='text-3xl md:text-4xl font-bold tracking-tight'>Start free. Pro is on the roadmap.</h2>
          <p className='text-muted-foreground max-w-2xl mx-auto mt-3'>
            The product you can use today is free. Advanced workflows are planned, not billed yet.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          <Card>
            <CardHeader>
              <CardTitle className='text-xl'>Free</CardTitle>
              <CardDescription>Everything you need to publish a professional profile.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-4xl font-bold mb-4'>$0</div>
              <ul className='space-y-2 text-sm'>
                {featuresFree.map((f) => (
                  <li key={f} className='flex items-center gap-2'>
                    <Check className='size-4 text-[var(--chart-1)]' />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className='w-full' asChild>
                <Link href='/signup'>Get started</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className='relative'>
            <CardHeader>
              <div className='inline-flex items-center gap-2 text-xs font-medium text-muted-foreground'>
                <Lock className='size-3.5' /> Coming later
              </div>
              <CardTitle className='text-xl'>Pro</CardTitle>
              <CardDescription>Planned tools for job search workflows.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-4xl font-bold mb-4'>$—</div>
              <ul className='space-y-2 text-sm'>
                {featuresPro.map((f) => (
                  <li key={f} className='flex items-center gap-2'>
                    <Check className='size-4 text-[var(--chart-2)]' />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant='outline' className='w-full' disabled>
                Not available yet
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
