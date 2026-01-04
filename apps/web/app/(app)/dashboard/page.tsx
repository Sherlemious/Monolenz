'use client';

/**
 * Dashboard Home Page
 * Main hub with navigation to profile and other features
 */

import Link from 'next/link';
import { User, Edit, FileText, Globe, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className='min-h-full bg-background p-8'>
      {/* Header */}
      <header className='mb-8'>
        <h1 className='text-3xl font-bold text-foreground mb-1'>Dashboard</h1>
        <p className='text-muted-foreground'>Manage your professional identity</p>
      </header>

      {/* Quick Actions Grid */}
      <section className='mb-10'>
        <h2 className='text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4'>Quick Actions</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          <Link
            href='/dashboard/profile'
            className='group flex items-center gap-4 p-5 bg-primary border border-primary rounded-xl transition-all hover:shadow-lg hover:shadow-primary/20'
          >
            <div className='w-12 h-12 rounded-lg bg-primary-foreground/20 text-primary-foreground flex items-center justify-center flex-shrink-0'>
              <User className='w-6 h-6' />
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className='text-base font-semibold text-primary-foreground mb-1'>My Profile</h3>
              <p className='text-sm text-primary-foreground/80'>View and manage your profile blocks</p>
            </div>
            <ArrowRight className='w-5 h-5 text-primary-foreground/70 group-hover:translate-x-1 transition-transform' />
          </Link>

          <Link
            href='/dashboard/profile/edit'
            className='group flex items-center gap-4 p-5 bg-card border border-border rounded-xl transition-all hover:border-ring hover:shadow-sm'
          >
            <div className='w-12 h-12 rounded-lg bg-secondary text-primary flex items-center justify-center flex-shrink-0'>
              <Edit className='w-6 h-6' />
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className='text-base font-semibold text-foreground mb-1'>Edit Profile</h3>
              <p className='text-sm text-muted-foreground'>Add or modify profile blocks</p>
            </div>
            <ArrowRight className='w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all' />
          </Link>

          <div className='flex items-center gap-4 p-5 bg-card/50 border border-border rounded-xl opacity-60 cursor-not-allowed'>
            <div className='w-12 h-12 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center flex-shrink-0'>
              <FileText className='w-6 h-6' />
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className='text-base font-semibold text-foreground mb-1'>Generate Resume</h3>
              <p className='text-sm text-muted-foreground mb-2'>Create tailored resumes from your blocks</p>
              <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-muted-foreground'>
                Coming Soon
              </span>
            </div>
          </div>

          <div className='flex items-center gap-4 p-5 bg-card/50 border border-border rounded-xl opacity-60 cursor-not-allowed'>
            <div className='w-12 h-12 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center flex-shrink-0'>
              <Globe className='w-6 h-6' />
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className='text-base font-semibold text-foreground mb-1'>Public Portfolio</h3>
              <p className='text-sm text-muted-foreground mb-2'>Share your professional portfolio</p>
              <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-muted-foreground'>
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section>
        <h2 className='text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4'>Getting Started</h2>

        <div className='bg-card border border-border rounded-xl p-6 space-y-6'>
          <div className='flex gap-4 items-start'>
            <div className='w-8 h-8 rounded-full bg-secondary text-primary font-semibold flex items-center justify-center flex-shrink-0 text-sm'>
              1
            </div>
            <div>
              <h3 className='text-base font-semibold text-foreground mb-1'>Add Your Experience</h3>
              <p className='text-sm text-muted-foreground'>
                Start by adding your work experience, education, and skills as blocks.
              </p>
            </div>
          </div>

          <div className='flex gap-4 items-start'>
            <div className='w-8 h-8 rounded-full bg-secondary text-primary font-semibold flex items-center justify-center flex-shrink-0 text-sm'>
              2
            </div>
            <div>
              <h3 className='text-base font-semibold text-foreground mb-1'>Organize & Customize</h3>
              <p className='text-sm text-muted-foreground'>
                Arrange blocks by importance and control what&apos;s public or private.
              </p>
            </div>
          </div>

          <div className='flex gap-4 items-start'>
            <div className='w-8 h-8 rounded-full bg-secondary text-primary font-semibold flex items-center justify-center flex-shrink-0 text-sm'>
              3
            </div>
            <div>
              <h3 className='text-base font-semibold text-foreground mb-1'>Generate & Share</h3>
              <p className='text-sm text-muted-foreground'>
                Create tailored resumes and portfolios from your single source of truth.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
