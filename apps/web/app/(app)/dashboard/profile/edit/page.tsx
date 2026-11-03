'use client';

/**
 * Profile Edit Page
 * - Redirects to /dashboard/profile if no profile exists
 * - Tab-based editor: Profile Info + Content sections
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Profile } from '@monolenz/types/entities';
import { BlockEditor } from '@/app/components/profile/blocks/BlockEditor';
import { ProfileInfoForm } from '@/app/components/profile/ProfileInfoForm';
import { ProfileLinksEditor } from '@/app/components/profile/ProfileLinksEditor';
import { useApiClient } from '@/lib/hooks/useApiClient';
import { createProfileApi } from '@/lib/api/profile';
import { createProfileBlocksApi } from '@/lib/api/profile-blocks';
import { useHasUnsavedChanges } from '@/lib/stores/profile-editor-store';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const EDITOR_TABS: { id: 'info' | 'blocks' | 'links'; label: string }[] = [
  { id: 'info', label: 'About' },
  { id: 'blocks', label: 'Content' },
  { id: 'links', label: 'Links' },
];

export default function ProfileEditPage() {
  const router = useRouter();
  const client = useApiClient();
  const blocksApi = useMemo(() => createProfileBlocksApi(client), [client]);
  const profileApi = useMemo(() => createProfileApi(client), [client]);
  const hasBlocksUnsavedChanges = useHasUnsavedChanges();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [latestVersionId, setLatestVersionId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'blocks' | 'links'>('info');
  const [hasProfileInfoUnsavedChanges, setHasProfileInfoUnsavedChanges] = useState(false);
  const [hasLinksUnsavedChanges, setHasLinksUnsavedChanges] = useState(false);

  const hasUnsavedChanges = hasBlocksUnsavedChanges || hasProfileInfoUnsavedChanges || hasLinksUnsavedChanges;

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Load user profile and latest version
  useEffect(() => {
    async function loadUserProfile() {
      try {
        setIsLoading(true);
        setError(null);

        const userProfile = await profileApi.getMyProfile();

        if (!userProfile) {
          router.replace('/dashboard/profile');
          return;
        }

        setProfile(userProfile);

        const latestVersion = await profileApi.getLatestVersion('me');
        if (latestVersion) {
          setLatestVersionId(latestVersion.version.id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }

    loadUserProfile();
  }, [profileApi, router]);

  const handleProfileSaved = useCallback((updated: Profile) => {
    setProfile(updated);
  }, []);

  const handleTabSwitch = useCallback(
    (newTab: 'info' | 'blocks' | 'links') => {
      if (activeTab === newTab) return;

      const currentTabHasChanges =
        (activeTab === 'info' && hasProfileInfoUnsavedChanges) ||
        (activeTab === 'blocks' && hasBlocksUnsavedChanges) ||
        (activeTab === 'links' && hasLinksUnsavedChanges);

      if (currentTabHasChanges) {
        const confirmed = window.confirm(
          'You have unsaved changes. It is recommended to save before switching tabs. Continue anyway?'
        );
        if (!confirmed) return;
      }

      setActiveTab(newTab);
    },
    [activeTab, hasProfileInfoUnsavedChanges, hasBlocksUnsavedChanges, hasLinksUnsavedChanges]
  );

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center h-full gap-4'>
        <div className='relative size-10'>
          <div className='absolute inset-0 rounded-full border-2 border-muted' />
          <div className='absolute inset-0 rounded-full border-2 border-t-primary animate-spin' />
        </div>
        <p className='text-muted-foreground text-sm'>Loading editor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center h-full text-center gap-4 p-8'>
        <div className='size-14 rounded-2xl bg-destructive/10 flex items-center justify-center'>
          <span className='text-destructive text-xl'>!</span>
        </div>
        <h2 className='text-lg font-semibold'>Unable to load editor</h2>
        <p className='text-muted-foreground text-sm max-w-sm'>{error}</p>
        <Button variant='outline' asChild>
          <Link href='/dashboard/profile'>Back to Profile</Link>
        </Button>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className='flex flex-col h-full'>
      {/* Header + section switcher */}
      <div className='flex flex-wrap items-center justify-between gap-3 px-6 md:px-10 py-4 border-b shrink-0'>
        <div className='flex items-center gap-5'>
          <h1 className='text-[17px] font-semibold tracking-tight'>Editor</h1>
          <div role='tablist' aria-label='Editor sections' className='inline-flex rounded-lg bg-secondary p-0.5'>
            {EDITOR_TABS.map((tab) => (
              <button
                key={tab.id}
                type='button'
                role='tab'
                aria-selected={activeTab === tab.id}
                onClick={() => handleTabSwitch(tab.id)}
                className={cn(
                  'h-7 px-3 rounded-md text-[13px] font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-card text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.08)] ring-1 ring-border'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className='flex items-center gap-3'>
          {hasUnsavedChanges && (
            <span className='flex items-center gap-1.5 text-[12px] text-muted-foreground'>
              <span className='size-1.5 rounded-full bg-warning animate-pulse' aria-hidden />
              Unsaved
            </span>
          )}
          <Button variant='ghost' size='sm' asChild>
            <a href={`/${profile.username}`} target='_blank' rel='noopener noreferrer'>
              Preview <ArrowUpRight className='size-3.5' />
            </a>
          </Button>
        </div>
      </div>

      {/* Content area */}
      <div className='flex-1 overflow-hidden'>
        {activeTab === 'info' && (
          <div className='overflow-y-auto h-full'>
            <ProfileInfoForm
              profile={profile}
              api={profileApi}
              onSaved={handleProfileSaved}
              onDirtyChange={setHasProfileInfoUnsavedChanges}
            />
          </div>
        )}
        {activeTab === 'blocks' && (
          <div className='h-full overflow-hidden'>
            <BlockEditor apiClient={blocksApi} profileIdentifier='me' initialVersionId={latestVersionId} />
          </div>
        )}
        {activeTab === 'links' && (
          <div className='overflow-y-auto h-full'>
            <ProfileLinksEditor api={profileApi} onDirtyChange={setHasLinksUnsavedChanges} />
          </div>
        )}
      </div>
    </div>
  );
}
