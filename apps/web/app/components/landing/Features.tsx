'use client';

import React from 'react';
import { Check, GitBranch, Layers, FileText, Globe, Briefcase, BarChart3, History } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const bullets = [
  {
    title: 'Single Source of Truth',
    description:
      'Build one comprehensive profile with 18+ content blocks: work, education, projects, publications, skills, and more.',
    icon: Layers,
  },
  {
    title: 'Write Once, Tailor Everywhere',
    description:
      'Generate role-specific resumes, live portfolios (monolenz.com/username), and keep applications in sync—without duplication.',
    icon: FileText,
  },
  {
    title: 'Version Control for Careers',
    description: 'Full version history like git—compare, branch, and evolve your professional story with confidence.',
    icon: History,
  },
  {
    title: 'Application Tracking & Insights',
    description: 'Track submissions, statuses, and performance metrics from one place. Know what works.',
    icon: BarChart3,
  },
  {
    title: 'Live Portfolio',
    description: 'Share a living profile at monolenz.com/username that updates the moment your data does.',
    icon: Globe,
  },
  {
    title: 'Future: Pro Tools',
    description:
      'Multiple portfolios, client testimonial verification, and more premium capabilities are on the roadmap.',
    icon: GitBranch,
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="border-t">
      <div className="max-w-[1200px] mx-auto px-4 py-20 md:py-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-[12px] font-mono uppercase tracking-[0.1em] mb-4 border">
            <span>Features</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything in one evolving profile</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-3">
            MonoLenz isn&apos;t just another CV maker—it&apos;s your central professional identity hub.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {bullets.map((item) => (
            <Card key={item.title} className="h-full">
              <CardHeader>
                <div className="inline-flex items-center justify-center size-9 rounded-md bg-muted text-muted-foreground">
                  <item.icon className="size-5" />
                </div>
                <CardTitle className="mt-2 text-base">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
          <div className="inline-flex items-center gap-2">
            <Check className="size-4 text-[var(--chart-1)]" /> 18+ content blocks
          </div>
          <div className="inline-flex items-center gap-2">
            <Check className="size-4 text-[var(--chart-2)]" /> Live portfolio URL
          </div>
          <div className="inline-flex items-center gap-2">
            <Check className="size-4 text-[var(--chart-3)]" /> Infinite versions
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
