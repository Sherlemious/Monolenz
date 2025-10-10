# Frontend Components

## Component Architecture

```
┌────────────────────────────────────────────────────┐
│  ProfilePage (page.tsx)                            │
│  - Fetches data via useProfile hook                │
│  - Handles loading/error states                    │
│  - Manages edit mode state                         │
└───────────────────┬────────────────────────────────┘
                    │
        ┌───────────┴──────────┬──────────────┐
        ↓                      ↓              ↓
┌─────────────────┐  ┌────────────────┐  ┌────────────┐
│ ProfileHeader   │  │ EditProfileForm│  │  Blocks    │
│ - Avatar        │  │ (PROF-002)     │  │ (Future)   │
│ - Basic Info    │  │ Not impl yet   │  │            │
│ - Completeness  │  │                │  │            │
└─────────────────┘  └────────────────┘  └────────────┘
```

---

## useProfile Hook

**Location**: `apps/web/lib/hooks/useProfile.ts`

**Purpose**: Central state management for profile data with optimistic updates

```typescript
export function useProfile() {
  const [profile, setProfile] = useState<BasicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileApi.getMyProfile();
      setProfile(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update profile (optimistic)
  const updateProfile = async (updates: BasicProfileUpdate): Promise<void> => {
    const originalProfile = profile;
    // Optimistic update
    if (profile) {
      setProfile({ ...profile, ...updates });
    }
    try {
      const updatedProfile = await profileApi.updateProfile(updates);
      setProfile(updatedProfile);
    } catch (err: unknown) {
      // Rollback on error
      setProfile(originalProfile);
      throw err;
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile,
  };
}
```

**Features**:
- ✅ Auto-fetches on component mount
- ✅ Loading and error states
- ✅ Optimistic updates (instant UI feedback)
- ✅ Automatic rollback on error
- ✅ Manual refetch capability

---

## Profile API Client

**Location**: `apps/web/lib/api/profile.ts`

```typescript
import { createBrowserApiClient } from './client';
import type { BasicProfile, BasicProfileUpdate, UsernameAvailability } from '@/lib/types/profile';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export const profileApi = {
  // Get current user's profile
  getMyProfile: async (): Promise<BasicProfile> => {
    const client = createBrowserApiClient();
    const response = await client.get<ApiResponse<BasicProfile>>('/api/v1/profiles/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (data: BasicProfileUpdate): Promise<BasicProfile> => {
    const client = createBrowserApiClient();
    const response = await client.put<ApiResponse<BasicProfile>, BasicProfileUpdate>(
      '/api/v1/profiles/me',
      data
    );
    return response.data;
  },

  // Get any user's profile
  getProfile: async (identifier: string): Promise<BasicProfile> => {
    const client = createBrowserApiClient();
    const response = await client.get<ApiResponse<BasicProfile>>(
      `/api/v1/profiles/${identifier}`
    );
    return response.data;
  },

  // Check username availability
  checkUsername: async (username: string): Promise<UsernameAvailability> => {
    const client = createBrowserApiClient();
    const response = await client.get<ApiResponse<UsernameAvailability>>(
      `/api/v1/profiles/username/${username}/availability`
    );
    return response.data;
  },
};
```

**Features**:
- ✅ Automatic authentication (token injection)
- ✅ Type-safe API methods
- ✅ Unwraps API response structure
- ✅ Error handling (throws on failure)

---

## UI Components

### ProfileHeader

**Location**: `apps/web/components/profile/ProfileHeader.tsx`

**Purpose**: Fixed header showing avatar, info, completeness, and edit button

```typescript
interface ProfileHeaderProps {
  profile: BasicProfile;
  completeness: CompletenessResult;
  onEditClick: () => void;
}
```

**Layout**:
```
┌────────────────────────────────────────────────────────┐
│  [Avatar] [Username]                [Progress] [Edit]  │
│           [Bio]                                         │
└────────────────────────────────────────────────────────┘
```

---

### ProfileSkeleton

**Location**: `apps/web/components/profile/ProfileSkeleton.tsx`

**Purpose**: Loading state placeholder

Shows animated skeleton while `useProfile` is fetching data.

---

## Current Profile Page Implementation

**Location**: `apps/web/app/(app)/profile/page.tsx`

**Current State**:
```typescript
export default function ProfilePage() {
  const { profile, loading: profileLoading, error: profileError } = useProfile();
  const { blocks, loading: blocksLoading } = useBlocks();
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Calculate completeness
  const completeness = calculateCompleteness(profile, blocks);

  // Loading state
  if (profileLoading || blocksLoading) {
    return <ProfileSkeleton />;
  }

  // Error state
  if (profileError || !profile) {
    return <ErrorDisplay error={profileError} />;
  }

  return (
    <div>
      <ProfileHeader
        profile={profile}
        completeness={completeness}
        onEditClick={() => setIsEditingProfile(true)}
      />
      {/* Edit form placeholder (PROF-002) */}
      {/* Block sections placeholder (future stories) */}
    </div>
  );
}
```

⚠️ **MISSING IMPLEMENTATION**: Edit profile form (PROF-002 story)

---

