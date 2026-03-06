'use client';

/**
 * Dashboard Home Page
 * Main hub with navigation to profile and other features
 */

import Link from 'next/link';
import { User, Edit, FileText, Globe, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className='h-full overflow-y-auto'>
      <div className='p-6 md:p-8 max-w-5xl'>
        {/* Header */}
        <header className='mb-8'>
          <h1 className='text-2xl font-bold text-foreground mb-1'>Dashboard</h1>
          <p className='text-sm text-muted-foreground'>Manage your professional identity</p>
        </header>

        {/* Quick Actions Grid */}
        <section className='mb-10'>
          <h2 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4'>Quick Actions</h2>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <Link
              href='/dashboard/profile'
              className='group flex items-center gap-4 p-5 bg-primary border border-primary rounded-xl transition-all hover:shadow-lg hover:shadow-primary/20'
            >
              <div className='w-10 h-10 rounded-lg bg-primary-foreground/20 text-primary-foreground flex items-center justify-center shrink-0'>
                <User className='w-5 h-5' />
              </div>
              <div className='flex-1 min-w-0'>
                <h3 className='text-sm font-semibold text-primary-foreground mb-0.5'>My Profile</h3>
                <p className='text-xs text-primary-foreground/80'>View and manage your profile</p>
              </div>
              <ArrowRight className='w-4 h-4 text-primary-foreground/70 group-hover:translate-x-1 transition-transform' />
            </Link>

            <Link
              href='/dashboard/profile/edit'
              className='group flex items-center gap-4 p-5 bg-card border border-border rounded-xl transition-all hover:border-ring hover:shadow-sm'
            >
              <div className='w-10 h-10 rounded-lg bg-secondary text-primary flex items-center justify-center shrink-0'>
                <Edit className='w-5 h-5' />
              </div>
              <div className='flex-1 min-w-0'>
                <h3 className='text-sm font-semibold text-foreground mb-0.5'>Edit Profile</h3>
                <p className='text-xs text-muted-foreground'>Add or modify your content</p>
              </div>
              <ArrowRight className='w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all' />
            </Link>

            <div className='flex items-center gap-4 p-5 bg-card/50 border border-border rounded-xl opacity-50 cursor-not-allowed'>
              <div className='w-10 h-10 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center shrink-0'>
                <FileText className='w-5 h-5' />
              </div>
              <div className='flex-1 min-w-0'>
                <h3 className='text-sm font-semibold text-foreground mb-0.5'>Generate Resume</h3>
                <p className='text-xs text-muted-foreground'>Create tailored resumes</p>
                <span className='inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-muted-foreground mt-1'>
                  Coming Soon
                </span>
              </div>
            </div>

            <div className='flex items-center gap-4 p-5 bg-card/50 border border-border rounded-xl opacity-50 cursor-not-allowed'>
              <div className='w-10 h-10 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center shrink-0'>
                <Globe className='w-5 h-5' />
              </div>
              <div className='flex-1 min-w-0'>
                <h3 className='text-sm font-semibold text-foreground mb-0.5'>Public Portfolio</h3>
                <p className='text-xs text-muted-foreground'>Share your professional portfolio</p>
                <span className='inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-muted-foreground mt-1'>
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section>
          <h2 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4'>Getting Started</h2>

          <div className='bg-card border border-border rounded-xl p-5 space-y-5'>
            <div className='flex gap-4 items-start'>
              <div className='w-7 h-7 rounded-full bg-secondary text-primary font-semibold flex items-center justify-center shrink-0 text-xs'>
                1
              </div>
              <div>
                <h3 className='text-sm font-semibold text-foreground mb-0.5'>Add Your Experience</h3>
                <p className='text-xs text-muted-foreground'>
                  Start by adding your work experience, education, and skills.
                </p>
              </div>
            </div>

            <div className='flex gap-4 items-start'>
              <div className='w-7 h-7 rounded-full bg-secondary text-primary font-semibold flex items-center justify-center shrink-0 text-xs'>
                2
              </div>
              <div>
                <h3 className='text-sm font-semibold text-foreground mb-0.5'>Organize & Customize</h3>
                <p className='text-xs text-muted-foreground'>
                  Arrange items by importance and control what&apos;s public or private.
                </p>
              </div>
            </div>

            <div className='flex gap-4 items-start'>
              <div className='w-7 h-7 rounded-full bg-secondary text-primary font-semibold flex items-center justify-center shrink-0 text-xs'>
                3
              </div>
              <div>
                <h3 className='text-sm font-semibold text-foreground mb-0.5'>Generate & Share</h3>
                <p className='text-xs text-muted-foreground'>
                  Create tailored resumes and portfolios from your single source of truth.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
