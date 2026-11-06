'use client';

/**
 * Profile Overview Page
 * - No profile: step-by-step onboarding wizard
 * - Has profile: polished read-only view of profile info and blocks
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import type { Profile, VersionBlockDetail } from '@monolenz/types/entities';
import { useApiClient } from '@/lib/hooks/useApiClient';
import { createProfileApi } from '@/lib/api/profile';
import { Button } from '@/components/ui/button';
import { OnboardingWizard } from '@/app/components/onboarding/OnboardingWizard';
import { ArrowUpRight } from 'lucide-react';
import { PageHeader } from '@/app/components/dashboard/PageHeader';
import { ProfileHeader, ProfileSections } from '@/app/components/profile/ProfileDocument';

// ============================================================================
// Main Page
// ============================================================================

export default function ProfilePage() {
  const client = useApiClient();
  const profileApi = useMemo(() => createProfileApi(client), [client]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [blocks, setBlocks] = useState<VersionBlockDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        const userProfile = await profileApi.getMyProfile();
        setProfile(userProfile);

        if (userProfile) {
          const latest = await profileApi.getLatestVersion('me');
          if (latest?.blocks) {
            setBlocks(latest.blocks);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [profileApi]);

  const handleProfileCreated = useCallback((newProfile: Profile) => {
    setProfile(newProfile);
  }, []);

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center h-full gap-4'>
        <div className='relative size-10'>
          <div className='absolute inset-0 rounded-full border-2 border-muted' />
          <div className='absolute inset-0 rounded-full border-2 border-t-primary animate-spin' />
        </div>
        <p className='text-muted-foreground text-sm'>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center h-full text-center gap-3 p-8'>
        <div className='size-14 rounded-2xl bg-destructive/10 flex items-center justify-center'>
          <span className='text-destructive text-xl'>!</span>
        </div>
        <h2 className='text-lg font-semibold'>Something went wrong</h2>
        <p className='text-muted-foreground text-sm max-w-sm'>{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className='h-full overflow-y-auto'>
        <OnboardingWizard api={profileApi} onCreated={handleProfileCreated} />
      </div>
    );
  }

  return (
    <div className='h-full overflow-y-auto'>
      <ProfileOverview profile={profile} blocks={blocks} />
    </div>
  );
}

// ============================================================================
// Profile Overview
// ============================================================================

function ProfileOverview({ profile, blocks }: { profile: Profile; blocks: VersionBlockDetail[] }) {
  const hidden = blocks.filter((b) => b.is_visible === false).length;
  return (
    <div className='min-h-full'>
      <PageHeader
        title='Profile'
        maxWidth='max-w-4xl'
        description={
          hidden > 0
            ? `This is what visitors see. ${hidden} hidden ${hidden === 1 ? 'entry is' : 'entries are'} shown faded and only visible to you.`
            : 'This is exactly what visitors see on your public page.'
        }
        actions={
          <>
            <Button variant='outline' asChild>
              <a href={`/${profile.username}`} target='_blank' rel='noopener noreferrer'>
                View public page <ArrowUpRight className='size-3.5' />
              </a>
            </Button>
            <Button asChild>
              <Link href='/dashboard/profile/edit'>
                <EditIcon className='size-3.5' />
                Edit
              </Link>
            </Button>
          </>
        }
      />

      <div className='px-6 md:px-10 pb-12 max-w-4xl'>
        <div className='rounded-xl border bg-card shadow-[0_1px_2px_rgb(0_0_0/0.03)]'>
          <div className='px-6 sm:px-12 py-10 sm:py-14'>
            <ProfileHeader profile={profile} />
            <div className='mt-12'>
              {blocks.length === 0 ? (
                <div className='flex flex-col items-center text-center py-12 border border-dashed rounded-xl'>
                  <p className='font-serif text-2xl'>Your page is a blank sheet.</p>
                  <p className='text-muted-foreground text-sm mt-2 mb-6 max-w-sm'>
                    Add experience, skills, education and more. Everything you add shows up here.
                  </p>
                  <Button asChild>
                    <Link href='/dashboard/profile/edit'>
                      <PlusIcon className='size-4' />
                      Add your first entry
                    </Link>
                  </Button>
                </div>
              ) : (
                <ProfileSections blocks={blocks} showHidden />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
      />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M12 4v16m8-8H4' />
    </svg>
  );
}
