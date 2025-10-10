# 3. State Management Strategy

## 3.1 Central Hook: useProfile

**Location**: `lib/hooks/useProfile.ts` (EXISTING - No changes)

**Current Implementation** (from architecture doc):
```typescript
export function useProfile() {
  const [profile, setProfile] = useState<BasicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getMyProfile();
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: BasicProfileUpdate) => {
    const originalProfile = profile;
    
    // Optimistic update
    setProfile({ ...profile, ...updates });
    
    try {
      const updated = await profileApi.updateProfile(updates);
      setProfile(updated);
    } catch (err) {
      // Rollback
      setProfile(originalProfile);
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, updateProfile, refetch: fetchProfile };
}
```

**Why No Changes Needed**:
- ✅ Already implements optimistic updates
- ✅ Automatic rollback on error
- ✅ Loading and error states
- ✅ Manual refetch capability

**New Addition Required** (Story 1.3):
```typescript
// Add createProfile method to profileApi
export const profileApi = {
  // ... existing methods
  
  createProfile: async (data: ProfileCreateData): Promise<BasicProfile> => {
    const client = createBrowserApiClient();
    const response = await client.post<ApiResponse<BasicProfile>>(
      '/api/v1/profiles',
      data
    );
    return response.data;
  },
};
```

## 3.2 Page-Level State Orchestration

**Location**: `app/(app)/profile/page.tsx`

**State Architecture**:
```typescript
'use client';

export default function ProfilePage() {
  // Central profile state
  const { profile, loading, error, updateProfile, refetch } = useProfile();
  
  // UI mode state
  const [mode, setMode] = useState<'empty' | 'onboarding' | 'view' | 'editing'>('view');
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  
  // Determine mode based on profile state
  useEffect(() => {
    if (loading) return;
    
    if (!profile || error?.includes('404')) {
      setMode('empty');
    } else {
      setMode('view');
    }
  }, [profile, loading, error]);
  
  // Handlers
  const handleCreateProfile = async (data: ProfileCreateData) => {
    try {
      await profileApi.createProfile(data);
      await refetch();  // Fetch newly created profile
      setMode('view');
      toast.success('Profile created successfully!');
    } catch (err) {
      handleApiError(err);
    }
  };
  
  const handleUpdateProfile = async (updates: BasicProfileUpdate) => {
    try {
      await updateProfile(updates);  // Optimistic update
      setIsEditSheetOpen(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      handleApiError(err);
      setIsEditSheetOpen(true);  // Reopen on error
    }
  };
  
  // Render based on mode
  if (loading) return <ProfileSkeleton />;
  
  if (mode === 'empty') {
    return (
      <EmptyProfileState 
        onCreateClick={() => setMode('onboarding')} 
      />
    );
  }
  
  if (mode === 'onboarding') {
    return (
      <ProfileOnboardingWizard
        onComplete={handleCreateProfile}
        onCancel={() => setMode('empty')}
      />
    );
  }
  
  // View mode
  return (
    <>
      <ProfileView
        profile={profile!}
        onEditClick={() => setIsEditSheetOpen(true)}
      />
      
      <ProfileEditSheet
        profile={profile!}
        isOpen={isEditSheetOpen}
        onClose={() => setIsEditSheetOpen(false)}
        onSave={handleUpdateProfile}
      />
    </>
  );
}
```

**State Transitions**:
```
Loading → Empty → Onboarding → View
                            ↓
                         Editing (Sheet)
                            ↓
                         View (on save/cancel)
```

---

