'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { User, Edit, Link2, Globe, ArrowRight, ExternalLink, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/app/components/dashboard/PageHeader';
import { useApiClient } from '@/lib/hooks/useApiClient';
import { createProfileApi } from '@/lib/api/profile';

export default function DashboardPage() {
  const client = useApiClient();
  const profileApi = useMemo(() => createProfileApi(client), [client]);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    profileApi
      .getMyProfile()
      .then((p) => setUsername(p?.username ?? null))
      .catch((err) => console.error('Failed to fetch profile:', err));
  }, [profileApi]);

  const copyPublicLink = async () => {
    if (!username) return;
    const url = `${window.location.origin}/${username}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Public link copied');
    } catch {
      toast.error('Could not copy link');
    }
  };

  return (
    <div className='h-full overflow-y-auto'>
      <PageHeader title='Dashboard' description='Manage your professional identity' />

      <div className='p-6 md:p-8 max-w-5xl'>
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

            {username ? (
              <button
                type='button'
                onClick={copyPublicLink}
                className='group flex items-center gap-4 p-5 bg-card border border-border rounded-xl transition-all hover:border-ring hover:shadow-sm text-left'
              >
                <div className='w-10 h-10 rounded-lg bg-secondary text-primary flex items-center justify-center shrink-0'>
                  <Link2 className='w-5 h-5' />
                </div>
                <div className='flex-1 min-w-0'>
                  <h3 className='text-sm font-semibold text-foreground mb-0.5'>Copy public link</h3>
                  <p className='text-xs text-muted-foreground truncate'>/{username}</p>
                </div>
              </button>
            ) : (
              <div className='flex items-center gap-4 p-5 bg-card/50 border border-border rounded-xl opacity-50 cursor-not-allowed'>
                <div className='w-10 h-10 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center shrink-0'>
                  <Link2 className='w-5 h-5' />
                </div>
                <div className='flex-1 min-w-0'>
                  <h3 className='text-sm font-semibold text-foreground mb-0.5'>Copy public link</h3>
                  <p className='text-xs text-muted-foreground'>Share your professional portfolio</p>
                  <span className='inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-muted-foreground mt-1'>
                    Set up profile first
                  </span>
                </div>
              </div>
            )}

            {username ? (
              <Link
                href={`/${username}`}
                className='group flex items-center gap-4 p-5 bg-card border border-border rounded-xl transition-all hover:border-ring hover:shadow-sm'
              >
                <div className='w-10 h-10 rounded-lg bg-secondary text-primary flex items-center justify-center shrink-0'>
                  <Globe className='w-5 h-5' />
                </div>
                <div className='flex-1 min-w-0'>
                  <h3 className='text-sm font-semibold text-foreground mb-0.5'>Public page</h3>
                  <p className='text-xs text-muted-foreground'>View, share, or print as PDF</p>
                </div>
                <div className='flex items-center gap-2 shrink-0'>
                  <Printer className='w-4 h-4 text-muted-foreground' />
                  <ExternalLink className='w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors' />
                </div>
              </Link>
            ) : (
              <div className='flex items-center gap-4 p-5 bg-card/50 border border-border rounded-xl opacity-50 cursor-not-allowed'>
                <div className='w-10 h-10 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center shrink-0'>
                  <Globe className='w-5 h-5' />
                </div>
                <div className='flex-1 min-w-0'>
                  <h3 className='text-sm font-semibold text-foreground mb-0.5'>Public page</h3>
                  <p className='text-xs text-muted-foreground'>Share your professional portfolio</p>
                  <span className='inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-muted-foreground mt-1'>
                    Set up profile first
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4'>Getting Started</h2>

          <div className='bg-card border border-border rounded-xl p-5 space-y-5'>
            <div className='flex gap-4 items-start'>
              <div className='w-7 h-7 rounded-full bg-secondary text-primary font-semibold flex items-center justify-center shrink-0 text-xs'>
                1
              </div>
              <div>
                <h3 className='text-sm font-semibold text-foreground mb-0.5'>Add your experience</h3>
                <p className='text-xs text-muted-foreground'>
                  Start with work, education, skills, and projects in the editor.
                </p>
              </div>
            </div>

            <div className='flex gap-4 items-start'>
              <div className='w-7 h-7 rounded-full bg-secondary text-primary font-semibold flex items-center justify-center shrink-0 text-xs'>
                2
              </div>
              <div>
                <h3 className='text-sm font-semibold text-foreground mb-0.5'>Choose what is public</h3>
                <p className='text-xs text-muted-foreground'>
                  Hide any entry from your public page without deleting it.
                </p>
              </div>
            </div>

            <div className='flex gap-4 items-start'>
              <div className='w-7 h-7 rounded-full bg-secondary text-primary font-semibold flex items-center justify-center shrink-0 text-xs'>
                3
              </div>
              <div>
                <h3 className='text-sm font-semibold text-foreground mb-0.5'>Share or print</h3>
                <p className='text-xs text-muted-foreground'>
                  Copy your public link, or open the page and use Print / Save as PDF.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
