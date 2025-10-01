/**
 * Profile Page
 * PROF-001: View Own Basic Profile
 */

'use client';

import { useState } from 'react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileSkeleton } from '@/components/profile/ProfileSkeleton';
import { useProfile } from '@/lib/hooks/useProfile';
import { useBlocks } from '@/lib/hooks/useBlocks';
import { calculateCompleteness } from '@/lib/utils/completeness';

export default function ProfilePage() {
  const { profile, loading: profileLoading, error: profileError } = useProfile();
  const { blocks, loading: blocksLoading } = useBlocks();
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Calculate completeness
  const completeness = calculateCompleteness(profile, blocks);

  // Loading state
  if (profileLoading || blocksLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-5xl">
        <ProfileSkeleton />
      </div>
    );
  }

  // Error state
  if (profileError || !profile) {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-5xl">
        <div className="text-center p-8 border border-destructive rounded-lg bg-destructive/10">
          <h2 className="text-xl font-semibold text-destructive mb-2">
            Failed to Load Profile
          </h2>
          <p className="text-muted-foreground">
            {profileError || 'Unable to load your profile. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      <div className="space-y-6">
        {/* Profile Header */}
        <ProfileHeader
          profile={profile}
          completeness={completeness}
          onEditClick={() => setIsEditingProfile(true)}
        />

        {/* Block Sections (Placeholder for future stories) */}
        <div className="space-y-6">
          <p className="text-center text-muted-foreground py-12">
            Block sections coming soon...
          </p>
        </div>
      </div>

      {/* Edit Profile Sheet (Placeholder for PROF-002) */}
      {isEditingProfile && (
        <div>Edit profile sheet will go here (PROF-002)</div>
      )}
    </div>
  );
}

