'use client';

/**
 * Profile Edit Page
 * - Redirects to /dashboard/profile if no profile exists
 * - Tab-based editor: Profile Info + Content sections
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Profile } from '@monolenz/types/entities';
import { BlockEditor } from '@/app/components/profile/blocks/BlockEditor';
import { ProfileInfoForm } from '@/app/components/profile/ProfileInfoForm';
import { useProfileBlocksApi } from '@/lib/hooks/useProfileBlocks';
import { useProfileApi } from '@/lib/hooks/useProfile';
import { useHasUnsavedChanges } from '@/lib/stores/profile-editor-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ProfileEditPage() {
  const router = useRouter();
  const blocksApi = useProfileBlocksApi();
  const profileApi = useProfileApi();
  const hasBlocksUnsavedChanges = useHasUnsavedChanges();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [latestVersionId, setLatestVersionId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'blocks'>('info');
  const [hasProfileInfoUnsavedChanges, setHasProfileInfoUnsavedChanges] = useState(false);

  // Combined unsaved changes from both tabs
  const hasUnsavedChanges = hasBlocksUnsavedChanges || hasProfileInfoUnsavedChanges;

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
    (newTab: 'info' | 'blocks') => {
      // Don't switch if already on that tab
      if (activeTab === newTab) return;

      // Check if current tab has unsaved changes
      const currentTabHasChanges =
        (activeTab === 'info' && hasProfileInfoUnsavedChanges) || (activeTab === 'blocks' && hasBlocksUnsavedChanges);

      if (currentTabHasChanges) {
        const confirmed = window.confirm(
          'You have unsaved changes on this tab. Switching tabs will not discard your changes, but you should save them first. Continue?'
        );
        if (!confirmed) return;
      }

      setActiveTab(newTab);
    },
    [activeTab, hasProfileInfoUnsavedChanges, hasBlocksUnsavedChanges]
  );

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center h-screen gap-4'>
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
      <div className='flex flex-col items-center justify-center h-screen text-center gap-4 p-8'>
        <div className='size-14 rounded-2xl bg-destructive/10 flex items-center justify-center'>
          <span className='text-destructive text-xl'>!</span>
        </div>
        <h2 className='text-lg font-semibold'>Unable to load editor</h2>
        <p className='text-muted-foreground text-sm max-w-sm'>{error}</p>
        <Button variant='outline' asChild>
          <Link href='/dashboard/profile'>← Back to Profile</Link>
        </Button>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className='flex flex-col h-screen bg-background'>
      {/* Top navigation */}
      <nav className='flex justify-between items-center px-6 h-14 border-b bg-card shrink-0'>
        <div className='flex items-center gap-4'>
          <Link
            href='/dashboard/profile'
            className='inline-flex items-center gap-1.5 text-muted-foreground text-sm font-medium hover:text-foreground transition-colors'
            onClick={(e) => {
              if (hasUnsavedChanges) {
                const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
                if (!confirmed) e.preventDefault();
              }
            }}
          >
            <ArrowLeftIcon className='size-4' />
            Profile
          </Link>

          <span className='text-border'>|</span>

          <span className='text-sm font-semibold'>{profile.username}</span>
        </div>

        {hasUnsavedChanges && (
          <Badge
            variant='outline'
            className='text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800'
          >
            <span className='size-1.5 rounded-full bg-amber-500 animate-pulse mr-1.5' />
            Unsaved changes
          </Badge>
        )}
      </nav>

      {/* Tab bar */}
      <div className='flex px-6 border-b bg-card shrink-0'>
        <button
          type='button'
          className={cn(
            'relative px-4 py-3 text-sm font-medium transition-colors',
            activeTab === 'info' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => handleTabSwitch('info')}
        >
          Profile Info
          {activeTab === 'info' && <span className='absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full' />}
        </button>
        <button
          type='button'
          className={cn(
            'relative px-4 py-3 text-sm font-medium transition-colors',
            activeTab === 'blocks' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => handleTabSwitch('blocks')}
        >
          Content
          {activeTab === 'blocks' && (
            <span className='absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full' />
          )}
        </button>
      </div>

      {/* Content area */}
      <div className='flex-1 overflow-hidden'>
        {activeTab === 'info' ? (
          <div className='overflow-y-auto h-full'>
            <ProfileInfoForm
              profile={profile}
              api={profileApi}
              onSaved={handleProfileSaved}
              onDirtyChange={setHasProfileInfoUnsavedChanges}
            />
          </div>
        ) : (
          <div className='h-full overflow-hidden'>
            <BlockEditor apiClient={blocksApi} profileIdentifier='me' initialVersionId={latestVersionId} />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
    </svg>
  );
}
