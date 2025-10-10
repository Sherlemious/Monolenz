# Integration Patterns

## Pattern 1: Handling Null/Empty Profile State

**Problem**: New users may not have a profile on first visit (404 response)

**Solution**: Implement graceful degradation with CTA to create profile

```typescript
export default function ProfilePage() {
  const { profile, loading, error } = useProfile();

  if (loading) return <ProfileSkeleton />;

  // Handle null/404 profile
  if (error || !profile) {
    return (
      <EmptyProfileState
        onCreateClick={() => {
          // Show profile creation form
        }}
      />
    );
  }

  // Handle empty profile (exists but no data)
  if (!profile.username || !profile.bio) {
    return (
      <IncompleteProfilePrompt
        profile={profile}
        onCompleteClick={() => {
          // Show profile edit form
        }}
      />
    );
  }

  // Normal profile display
  return <ProfileDisplay profile={profile} />;
}
```

**State Flow**:
```
User Logs In
    ↓
Check Profile
    ├─→ [NULL/404] → Show "Create Profile" CTA
    ├─→ [Empty] → Show "Complete Profile" prompt
    └─→ [Complete] → Show full profile
```

---

## Pattern 2: Optimistic Updates

**Implementation**: Already in `useProfile` hook

```typescript
const updateProfile = async (updates: BasicProfileUpdate): Promise<void> => {
  const originalProfile = profile;
  
  // 1. Update UI immediately (optimistic)
  if (profile) {
    setProfile({ ...profile, ...updates });
  }
  
  try {
    // 2. Send to API
    const updatedProfile = await profileApi.updateProfile(updates);
    
    // 3. Confirm with server response
    setProfile(updatedProfile);
  } catch (err) {
    // 4. Rollback on error
    setProfile(originalProfile);
    
    // 5. Show error to user
    toast.error('Failed to update profile');
    throw err;
  }
};
```

**Benefits**:
- ✅ Instant UI feedback
- ✅ Automatic error recovery
- ✅ Better user experience

---

## Pattern 3: Form Validation

**Client-Side Validation** (before submission):

```typescript
import { profileSchemas } from '@monolenz/types/validation';

function ProfileEditForm() {
  const handleSubmit = async (formData: FormData) => {
    try {
      // Validate with Zod
      const validated = profileSchemas.updateForm.parse({
        username: formData.get('username'),
        bio: formData.get('bio'),
        // ... other fields
      });
      
      // Submit if valid
      await updateProfile(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Show validation errors
        setErrors(error.errors);
      }
    }
  };
}
```

**Server-Side Validation** (already implemented):
- Backend validates with same Zod schemas
- Returns 422 with detailed field errors
- Frontend displays errors inline

---

## Pattern 4: Username Availability Check

**Real-time validation during typing**:

```typescript
const [username, setUsername] = useState('');
const [isChecking, setIsChecking] = useState(false);
const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

// Debounced check
useEffect(() => {
  const timer = setTimeout(async () => {
    if (username.length >= 3) {
      setIsChecking(true);
      try {
        const result = await profileApi.checkUsername(username);
        setIsAvailable(result.available);
      } catch (error) {
        console.error('Failed to check username');
      } finally {
        setIsChecking(false);
      }
    }
  }, 500); // Wait 500ms after user stops typing

  return () => clearTimeout(timer);
}, [username]);
```

**UI Feedback**:
```
[username field] [✓ Available] [✗ Taken] [⟳ Checking...]
```

---

## Pattern 5: Error Handling

**API Error Structure**:

```typescript
interface ApiError {
  success: false;
  message: string;
  errors: Array<{
    field: string;
    message: string;
  }>;
}
```

**Frontend Handling**:

```typescript
try {
  await profileApi.updateProfile(data);
} catch (error: any) {
  // Parse API error
  const apiError = extractApiError(error);
  
  if (apiError.errors) {
    // Show field-specific errors
    apiError.errors.forEach(err => {
      setFieldError(err.field, err.message);
    });
  } else {
    // Show general error
    toast.error(apiError.message);
  }
}
```

---

