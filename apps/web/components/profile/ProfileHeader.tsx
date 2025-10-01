/**
 * ProfileHeader Component
 * Fixed header showing avatar, basic info, completeness, and edit button
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { ProfileAvatar } from './ProfileAvatar';
import { ProfileBasicInfo } from './ProfileBasicInfo';
import { ProfileCompleteness } from './ProfileCompleteness';
import type { BasicProfile } from '@/lib/types/profile';
import type { CompletenessResult } from '@/lib/utils/completeness';

interface ProfileHeaderProps {
  profile: BasicProfile;
  completeness: CompletenessResult;
  onEditClick: () => void;
}

export function ProfileHeader({
  profile,
  completeness,
  onEditClick,
}: ProfileHeaderProps) {
  return (
    <Card className="sticky top-0 z-10">
      <CardHeader className="pb-6">
        <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
          {/* Avatar */}
          <ProfileAvatar
            username={profile.username}
            avatarUrl={profile.profile_picture_url}
          />

          {/* Basic Info */}
          <ProfileBasicInfo profile={profile} />

          {/* Right Side: Completeness + Edit Button */}
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <ProfileCompleteness completeness={completeness} />
            <Button onClick={onEditClick} className="w-full md:w-auto">
              Edit Profile
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

