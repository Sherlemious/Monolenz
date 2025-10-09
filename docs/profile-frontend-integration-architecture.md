# Athaar Profile Management - Frontend Integration Architecture

**Version**: 1.0  
**Date**: October 9, 2025  
**Architect**: Winston  
**Type**: Frontend-Backend Integration Architecture  
**Status**: Ready for Development

---

## Document Purpose

This integration architecture bridges three critical documents:
1. **UI/UX Specification** (Sally) - User experience goals, flows, visual design
2. **Product Requirements Document** (John) - Functional requirements, stories
3. **Brownfield Technical Architecture** (Winston) - Existing backend API, data models

**Goal**: Provide developers with a complete technical blueprint for implementing the Profile Management UI that seamlessly integrates Sally's UX vision with the existing Athaar backend infrastructure.

---

## Executive Summary

### What We're Building

A complete profile management UI featuring:
- **4-Step Onboarding Wizard** for first-time profile creation
- **Profile View Mode** with completeness tracking
- **Edit Sheet Modal** with optimistic updates
- **Username Change Confirmation** workflow
- **Comprehensive Error Handling** across all states

### Integration Approach

**Frontend Technology Stack**:
- Next.js 15.4.2 (App Router, Client Components)
- React 19.1.0 with Hooks
- Radix UI + Tailwind CSS 4.1.11
- Zod 3.22.4 (shared validation)
- Sonner 2.0.7 (toast notifications)

**Backend Integration**:
- Express.js REST API (fully implemented, **zero changes required**)
- Supabase JWT authentication (automatic token injection)
- PostgreSQL + Prisma ORM
- Shared `@monolenz/types` package for type safety

**Key Integration Pattern**: Client-side state management with optimistic updates, backed by robust error handling and automatic rollback.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Component Architecture](#2-component-architecture)
3. [State Management Strategy](#3-state-management-strategy)
4. [API Integration Layer](#4-api-integration-layer)
5. [User Flow Implementation](#5-user-flow-implementation)
6. [Form & Validation Architecture](#6-form--validation-architecture)
7. [Error Handling Architecture](#7-error-handling-architecture)
8. [Responsive & Accessibility Implementation](#8-responsive--accessibility-implementation)
9. [Performance Architecture](#9-performance-architecture)
10. [Development Workflow](#10-development-workflow)

---

## 1. Architecture Overview

### 1.1 System Integration Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Browser (Client-Side)                         │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         Profile Page (/app/(app)/profile/page.tsx)       │   │
│  │                                                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │ Empty State  │  │  Onboarding  │  │ Profile View │  │   │
│  │  │   Component  │  │    Wizard    │  │  Component   │  │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │   │
│  │         │                  │                  │          │   │
│  │         └──────────────────┴──────────────────┘          │   │
│  │                            │                             │   │
│  │                   ┌────────▼─────────┐                   │   │
│  │                   │  useProfile Hook │                   │   │
│  │                   │  - State Mgmt    │                   │   │
│  │                   │  - Optimistic UI │                   │   │
│  │                   └────────┬─────────┘                   │   │
│  │                            │                             │   │
│  │                   ┌────────▼─────────┐                   │   │
│  │                   │  profileApi      │                   │   │
│  │                   │  Client Methods  │                   │   │
│  │                   └────────┬─────────┘                   │   │
│  └─────────────────────────────┼──────────────────────────┘   │
│                                │                               │
│                       ┌────────▼─────────┐                     │
│                       │ Supabase Client  │                     │
│                       │ (Token Provider) │                     │
│                       └────────┬─────────┘                     │
└────────────────────────────────┼──────────────────────────────┘
                                 │
                        HTTP + Bearer Token
                                 │
┌────────────────────────────────▼──────────────────────────────┐
│                   Express.js API Server                        │
│                   (NO CHANGES REQUIRED)                        │
│                                                                 │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌─────────────┐ │
│  │   Auth   │→ │ Controller │→ │  Service │→ │ Repository  │ │
│  │Middleware│  │            │  │          │  │             │ │
│  └──────────┘  └────────────┘  └──────────┘  └─────────────┘ │
│                                                        │        │
└────────────────────────────────────────────────────────┼───────┘
                                                         │
                                                         │
┌────────────────────────────────────────────────────────▼───────┐
│              PostgreSQL (Supabase Hosted)                       │
│                                                                 │
│    auth.users (Supabase)  ←→  public.profiles                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Integration Layers

**Layer 1: UI Components** (Radix UI + Tailwind)
- Presentation layer implementing Sally's UX design
- Stateless, reusable components
- Accessibility built-in via Radix primitives

**Layer 2: State Management** (React Hooks)
- `useProfile` hook for profile data
- Local state for UI modes (onboarding, view, edit)
- Optimistic updates with rollback

**Layer 3: API Integration** (Fetch + Supabase Auth)
- `profileApi` client with type-safe methods
- Automatic JWT token injection
- Error transformation and handling

**Layer 4: Backend Services** (Existing - No Changes)
- Express.js REST API
- Supabase authentication
- PostgreSQL database

---

## 2. Component Architecture

### 2.1 Component Hierarchy

```
apps/web/
├── app/(app)/profile/
│   └── page.tsx                          # ORCHESTRATOR COMPONENT
│       ├── State: mode ('empty' | 'onboarding' | 'view' | 'editing')
│       ├── Hook: useProfile()
│       └── Renders appropriate component based on state
│
├── components/profile/                    # PROFILE-SPECIFIC COMPONENTS
│   │
│   ├── EmptyProfileState.tsx             # NEW - Story 1.1
│   │   ├── Props: { onCreateClick: () => void }
│   │   └── Renders: Welcome message, benefits, CTA
│   │
│   ├── ProfileOnboardingWizard.tsx       # NEW - Stories 1.2, 1.3
│   │   ├── Props: { onComplete: (data) => Promise<void> }
│   │   ├── State: currentStep (1-4), formData, errors
│   │   └── Children:
│   │       ├── steps/UsernameStep.tsx
│   │       ├── steps/BasicInfoStep.tsx
│   │       ├── steps/SocialLinksStep.tsx
│   │       └── steps/ReviewStep.tsx
│   │
│   ├── ProfileView.tsx                   # NEW - Story 1.4
│   │   ├── Props: { profile: BasicProfile }
│   │   └── Children:
│   │       ├── ProfileCard.tsx
│   │       └── CompletenessIndicator.tsx
│   │
│   ├── ProfileCard.tsx                   # NEW - Story 1.4
│   │   ├── Props: { profile: BasicProfile, onEditClick: () => void }
│   │   ├── Renders: Avatar, username, bio, social links
│   │   └── Uses: ProfileAvatar (composition)
│   │
│   ├── ProfileEditSheet.tsx              # NEW - Story 1.5
│   │   ├── Component: Radix Sheet (modal)
│   │   ├── Props: { profile: BasicProfile, isOpen, onClose, onSave }
│   │   ├── State: formData, errors, isDirty, isSubmitting
│   │   └── Children:
│   │       ├── ProfileEditForm
│   │       └── UsernameChangeDialog (conditional)
│   │
│   ├── UsernameChangeDialog.tsx          # NEW - Story 1.6
│   │   ├── Component: Radix AlertDialog
│   │   ├── Props: { oldUsername, newUsername, onConfirm, onCancel }
│   │   └── Renders: Warning message, Cancel/Confirm buttons
│   │
│   ├── CompletenessIndicator.tsx         # NEW - Story 1.4
│   │   ├── Props: { profile: BasicProfile, variant: 'expanded' | 'compact' }
│   │   ├── Calculates: Percentage based on filled fields
│   │   └── Renders: Progress bar, field checklist
│   │
│   └── ProfileSkeleton.tsx               # EXISTING - Minor updates
│       ├── Renders: Shimmer placeholders
│       └── Matches: ProfileCard layout
│
└── lib/
    ├── hooks/
    │   └── useProfile.ts                 # EXISTING - Reuse as-is
    │
    ├── api/
    │   ├── client.ts                     # EXISTING - Token provider
    │   └── profile.ts                    # EXISTING - Add createProfile()
    │
    └── utils/
        ├── profile-helpers.ts            # EXISTING - Completeness calc
        └── validation.ts                 # NEW - Client-side Zod helpers
```

### 2.2 Component Specifications

#### 2.2.1 ProfileOnboardingWizard

**Location**: `components/profile/ProfileOnboardingWizard.tsx`

**Purpose**: Multi-step profile creation wizard (FR13)

**Props**:
```typescript
interface ProfileOnboardingWizardProps {
  onComplete: (data: ProfileCreateData) => Promise<void>;
  onCancel?: () => void;
}
```

**State**:
```typescript
const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
const [formData, setFormData] = useState<Partial<ProfileCreateData>>({});
const [errors, setErrors] = useState<Record<string, string>>({});
const [isSubmitting, setIsSubmitting] = useState(false);
```

**Step Flow**:
1. **Step 1**: Username (required, validates format, checks availability)
2. **Step 2**: Bio + Profile Picture URL (optional, validates URLs)
3. **Step 3**: Social Links (optional, validates URLs)
4. **Step 4**: Review + Submit (shows preview, calls onComplete)

**Validation Strategy**:
- Validate current step on "Next" click
- Maintain wizard state across back/forward navigation
- Show inline errors immediately
- Final validation before submit

**Integration with UX Spec**:
- Section 3.1 (Flow 1: Profile Creation)
- Section 4.2 (Screen 2: Onboarding Wizard)
- Progress indicator: "Step X of 4"
- Mobile: Full-width layout, bottom sheet behavior

---

#### 2.2.2 ProfileEditSheet

**Location**: `components/profile/ProfileEditSheet.tsx`

**Purpose**: Modal form for editing existing profile (FR3)

**Props**:
```typescript
interface ProfileEditSheetProps {
  profile: BasicProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: BasicProfileUpdate) => Promise<void>;
}
```

**State**:
```typescript
const [formData, setFormData] = useState<BasicProfileUpdate>(profile);
const [errors, setErrors] = useState<Record<string, string>>({});
const [isDirty, setIsDirty] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [showUsernameConfirm, setShowUsernameConfirm] = useState(false);
```

**Behavior**:
- Pre-populate all fields from `profile` prop
- Track changes with `isDirty` flag
- Warn on close if unsaved changes exist (AC6)
- Username change triggers confirmation dialog (Story 1.6)
- Optimistic update on save (via `onSave` callback)

**Radix Sheet Configuration**:
```typescript
<Sheet open={isOpen} onOpenChange={onClose}>
  <SheetContent 
    side="right"           // Desktop
    className="sm:bottom"  // Mobile: bottom sheet
  >
    {/* Form content */}
  </SheetContent>
</Sheet>
```

**Mobile Responsiveness** (UX Spec Section 8.2):
- Desktop (≥768px): Slide from right, 480px width
- Mobile (<768px): Slide from bottom, 85vh height

---

#### 2.2.3 CompletenessIndicator

**Location**: `components/profile/CompletenessIndicator.tsx`

**Purpose**: Visual progress tracking (FR11)

**Calculation Logic** (from PRD AC3):
```typescript
function calculateCompleteness(profile: BasicProfile): number {
  const fields = [
    'username',           // Always filled (required)
    'bio',
    'profile_picture_url',
    'linkedin_url',
    'github_url',
    'portfolio_url'
  ];
  
  const filledCount = fields.filter(field => 
    profile[field] && profile[field].trim() !== ''
  ).length;
  
  return Math.round((filledCount / fields.length) * 100);
}
```

**Rendering**:
```typescript
<div>
  <Progress value={percentage} className="h-2" />
  <p>{percentage}% Complete</p>
  
  {/* Missing fields */}
  {missingFields.map(field => (
    <div key={field}>
      ✗ {fieldName} → Add to complete
    </div>
  ))}
</div>
```

**Variants**:
- `expanded`: Full checklist with progress bar
- `compact`: Progress bar + percentage only

---

## 3. State Management Strategy

### 3.1 Central Hook: useProfile

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

### 3.2 Page-Level State Orchestration

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

## 4. API Integration Layer

### 4.1 Authentication Flow

**Automatic Token Injection** (Existing - No changes):

```typescript
// lib/api/client.ts (EXISTING)
import { createClient as createSupabaseBrowserClient } from '@/utils/supabase/client';

export function createBrowserApiClient(baseInit?: RequestInit) {
  const supabase = createSupabaseBrowserClient();
  
  return createApiClientWithTokenProvider(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;  // JWT token
  }, baseInit);
}
```

**Process**:
1. Component calls `profileApi.getMyProfile()`
2. `createBrowserApiClient()` retrieves Supabase session
3. Extracts JWT token from session
4. Adds `Authorization: Bearer <token>` header
5. Makes API request
6. Backend validates token via middleware

**No Manual Token Handling Required** ✅

### 4.2 API Client Methods

**Location**: `lib/api/profile.ts`

**Existing Methods** (Keep):
- `getMyProfile()` - GET /api/v1/profiles/me
- `updateProfile(data)` - PUT /api/v1/profiles/me
- `getProfile(identifier)` - GET /api/v1/profiles/:identifier
- `checkUsername(username)` - GET /api/v1/profiles/username/:username/availability

**New Method Required** (Story 1.3):
```typescript
createProfile: async (data: ProfileCreateData): Promise<BasicProfile> => {
  const client = createBrowserApiClient();
  const response = await client.post<ApiResponse<BasicProfile>>(
    '/api/v1/profiles',
    data
  );
  
  if (!response.success) {
    throw new ApiError(response.message, response.errors);
  }
  
  return response.data;
}
```

### 4.3 Error Transformation

**API Error Structure** (from backend):
```typescript
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "username", "message": "Username must be at least 3 characters" }
  ]
}
```

**Frontend Error Handler**:
```typescript
// lib/utils/api-errors.ts (NEW)
export class ApiError extends Error {
  constructor(
    message: string,
    public errors: Array<{ field: string; message: string }> = [],
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): void {
  if (error instanceof ApiError) {
    // Field-specific errors
    if (error.errors.length > 0) {
      error.errors.forEach(err => {
        toast.error(`${err.field}: ${err.message}`);
      });
    } else {
      toast.error(error.message);
    }
  } else if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error('An unexpected error occurred');
  }
}
```

**HTTP Status Code Mapping** (Story 1.7):

| Status | Error Type | Frontend Handling |
|--------|-----------|-------------------|
| **401** | Unauthorized | Redirect to `/login` if "Invalid token"<br>Toast "Confirm your email" if "Email not confirmed" |
| **404** | Not Found | Show empty state with "Create Profile" CTA |
| **409** | Conflict | Show inline error "Username taken", reopen form |
| **422** | Validation | Display field errors inline, keep form open |
| **500** | Server Error | Toast "Something went wrong" with retry button |
| **Network** | Connection | Toast "Check your connection" with retry |

---

## 5. User Flow Implementation

### 5.1 Flow 1: Profile Creation (Onboarding)

**UX Spec Reference**: Section 3.1

**Technical Implementation**:

```typescript
// ProfileOnboardingWizard.tsx
export function ProfileOnboardingWizard({ onComplete }: Props) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [data, setData] = useState<Partial<ProfileCreateData>>({});
  
  // Step 1: Username
  const validateUsername = async (username: string) => {
    // Client validation (Zod)
    const result = profileSchemas.createForm.shape.username.safeParse(username);
    if (!result.success) return result.error.errors[0].message;
    
    // Server validation (availability)
    const { available } = await profileApi.checkUsername(username);
    if (!available) return 'Username is already taken';
    
    return null;  // Valid
  };
  
  const handleNext = async () => {
    if (step === 4) {
      // Final submit
      try {
        await onComplete(data as ProfileCreateData);
      } catch (error) {
        if (error.statusCode === 409) {
          // Username conflict - navigate to Step 1
          setStep(1);
          toast.error('Username taken. Please choose another.');
        } else if (error.statusCode === 422) {
          // Validation error - navigate to affected step
          const firstError = error.errors[0];
          const errorStep = getStepForField(firstError.field);
          setStep(errorStep);
          // Show inline error
        }
      }
    } else {
      setStep((prev) => (prev + 1) as any);
    }
  };
  
  return (
    <div>
      {/* Progress indicator */}
      <div>Step {step} of 4</div>
      
      {/* Step components */}
      {step === 1 && <UsernameStep data={data} onChange={setData} />}
      {step === 2 && <BasicInfoStep data={data} onChange={setData} />}
      {step === 3 && <SocialLinksStep data={data} onChange={setData} />}
      {step === 4 && <ReviewStep data={data} />}
      
      {/* Navigation */}
      <div>
        {step > 1 && <Button onClick={() => setStep(step - 1)}>Back</Button>}
        <Button onClick={handleNext}>
          {step === 4 ? 'Complete Profile' : `Next: ${getNextStepName(step)}`}
        </Button>
      </div>
    </div>
  );
}
```

**Error Handling** (UX Spec 3.1 Edge Cases):
- **409 Conflict**: Navigate to Step 1, focus username field
- **422 Validation**: Navigate to step with error, show inline
- **Network Error**: Show retry, maintain wizard state
- **Token Expired**: Redirect to login, lose progress

---

### 5.2 Flow 2: Profile Editing

**UX Spec Reference**: Section 3.3

**Technical Implementation**:

```typescript
// ProfileEditSheet.tsx
export function ProfileEditSheet({ profile, isOpen, onClose, onSave }: Props) {
  const [formData, setFormData] = useState(profile);
  const [isDirty, setIsDirty] = useState(false);
  const [showUsernameConfirm, setShowUsernameConfirm] = useState(false);
  
  const handleClose = () => {
    if (isDirty) {
      if (confirm('You have unsaved changes. Discard?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };
  
  const handleSave = async () => {
    // Validate client-side
    const result = profileSchemas.updateForm.safeParse(formData);
    if (!result.success) {
      // Show validation errors
      return;
    }
    
    // Check if username changed
    if (formData.username !== profile.username) {
      setShowUsernameConfirm(true);
      return;
    }
    
    // Save directly
    await saveProfile();
  };
  
  const saveProfile = async () => {
    try {
      await onSave(formData);  // Optimistic update in parent
      // Sheet closes on success
    } catch (error) {
      // Error handling - sheet stays open
      if (error.statusCode === 409) {
        setErrors({ username: 'Username already taken' });
      }
    }
  };
  
  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent>
          {/* Form fields */}
          {/* ... */}
          <Button onClick={handleSave}>Save Changes</Button>
        </SheetContent>
      </Sheet>
      
      <UsernameChangeDialog
        open={showUsernameConfirm}
        oldUsername={profile.username}
        newUsername={formData.username}
        onConfirm={saveProfile}
        onCancel={() => setShowUsernameConfirm(false)}
      />
    </>
  );
}
```

**Optimistic Update Flow**:
1. User clicks "Save Changes"
2. `onSave(formData)` called in parent
3. Parent calls `updateProfile(formData)` (useProfile hook)
4. Hook updates UI immediately (optimistic)
5. Hook makes API call
6. On success: UI already updated ✅
7. On error: Hook rolls back, sheet reopens with error

---

### 5.3 Flow 3: Username Change Confirmation

**UX Spec Reference**: Section 3.4

**Technical Implementation**:

```typescript
// UsernameChangeDialog.tsx
export function UsernameChangeDialog({ 
  open, 
  oldUsername, 
  newUsername, 
  onConfirm, 
  onCancel 
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <AlertTriangle className="w-12 h-12 text-warning" />
            Confirm Username Change
          </AlertDialogTitle>
          <AlertDialogDescription>
            Changing your username from <strong>'{oldUsername}'</strong> to{' '}
            <strong>'{newUsername}'</strong> may affect your profile URL and how 
            others find you. This action cannot be easily undone.
            
            Are you sure you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-warning hover:bg-warning/90"
          >
            Yes, Change Username
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

**Interaction Flow**:
1. User changes username in edit form
2. Clicks "Save Changes"
3. System detects `formData.username !== profile.username`
4. Shows confirmation dialog
5. User clicks "Cancel" → Dialog closes, form remains open
6. User clicks "Yes, Change" → Proceeds with save (optimistic update)

---

## 6. Form & Validation Architecture

### 6.1 Shared Validation Schemas

**Location**: `packages/types/src/validation/profile-schemas.ts` (EXISTING)

**Already Defined** (from architecture doc):
```typescript
export const profileSchemas = {
  create: profileDataSchema.required({ username: true }),
  update: profileDataSchema.partial(),
  
  // Form schemas (handle empty strings)
  createForm: profileDataSchema.extend({
    bio: z.string().transform(val => val.trim() || undefined).optional(),
    // ... other fields with same transform
  }).required({ username: true }),
  
  updateForm: profileDataSchema.extend({
    bio: z.string().transform(val => val.trim() || undefined).optional(),
    // ... other fields
  }).partial(),
};
```

**No Changes Required** ✅

### 6.2 Client-Side Validation Strategy

**When to Validate**:
- **On Blur**: Validate individual fields (show inline errors)
- **On Submit**: Validate entire form (prevent submission if invalid)
- **Real-time**: Character counters, username availability

**Implementation Pattern**:
```typescript
// In form component
const [errors, setErrors] = useState<Record<string, string>>({});

const validateField = (field: string, value: any) => {
  const schema = profileSchemas.createForm.shape[field];
  const result = schema.safeParse(value);
  
  if (result.success) {
    setErrors(prev => ({ ...prev, [field]: '' }));
    return true;
  } else {
    setErrors(prev => ({ ...prev, [field]: result.error.errors[0].message }));
    return false;
  }
};

// In input component
<Input
  value={formData.username}
  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
  onBlur={() => validateField('username', formData.username)}
  error={errors.username}
/>
```

### 6.3 Character Counters

**Implementation**:
```typescript
// Bio field (500 char max)
const bioLength = formData.bio?.length || 0;
const bioMaxLength = 500;

<div className="relative">
  <Textarea
    value={formData.bio}
    onChange={(e) => {
      if (e.target.value.length <= bioMaxLength) {
        setFormData({ ...formData, bio: e.target.value });
      }
    }}
    maxLength={bioMaxLength}
  />
  <span className="text-sm text-muted-foreground">
    {bioLength}/{bioMaxLength}
  </span>
</div>
```

**Character Limits** (from validation schemas):
- Username: 50 chars
- Bio: 500 chars
- URLs: 500 chars (enforced by database)

---

## 7. Error Handling Architecture

### 7.1 Error Classification

**Type 1: Client-Side Validation Errors**
- **When**: Before API call, during form interaction
- **Display**: Inline below field (red text)
- **Example**: "Username must be at least 3 characters"

**Type 2: API Validation Errors (422)**
- **When**: Server rejects data after submission
- **Display**: Inline field errors + toast summary
- **Example**: Backend validates URL format differently

**Type 3: Business Logic Errors (409)**
- **When**: Constraint violation (username taken)
- **Display**: Inline error + toast notification
- **Action**: Reopen form, focus affected field

**Type 4: Authentication Errors (401)**
- **When**: Token expired/invalid or email unconfirmed
- **Display**: Toast message
- **Action**: Redirect to login OR show "Confirm email" message

**Type 5: Server/Network Errors (500, Network)**
- **When**: Server error or connection failure
- **Display**: Toast with retry button
- **Action**: Maintain form state, allow retry

### 7.2 Error Handling Implementation

**Central Error Handler**:
```typescript
// lib/utils/error-handler.ts (NEW)
export function handleProfileError(
  error: unknown,
  context: 'create' | 'update' | 'fetch'
): {
  type: 'inline' | 'toast' | 'redirect';
  message: string;
  fieldErrors?: Record<string, string>;
  action?: () => void;
} {
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 401:
        if (error.message.includes('Email not confirmed')) {
          return {
            type: 'toast',
            message: 'Please confirm your email address to continue',
          };
        }
        return {
          type: 'redirect',
          message: 'Session expired. Please log in again.',
          action: () => router.push('/login'),
        };
      
      case 404:
        return {
          type: 'inline',
          message: 'Profile not found',
        };
      
      case 409:
        return {
          type: 'inline',
          message: 'Username is already taken',
          fieldErrors: { username: 'This username is not available' },
        };
      
      case 422:
        const fieldErrors = error.errors.reduce((acc, err) => {
          acc[err.field] = err.message;
          return acc;
        }, {} as Record<string, string>);
        
        return {
          type: 'inline',
          message: 'Please correct the errors and try again',
          fieldErrors,
        };
      
      case 500:
      default:
        return {
          type: 'toast',
          message: 'Something went wrong. Please try again.',
          action: () => window.location.reload(),
        };
    }
  }
  
  // Network error
  return {
    type: 'toast',
    message: 'Network error. Please check your connection.',
    action: () => window.location.reload(),
  };
}
```

**Usage in Components**:
```typescript
try {
  await profileApi.createProfile(data);
} catch (error) {
  const handled = handleProfileError(error, 'create');
  
  if (handled.type === 'inline') {
    setErrors(handled.fieldErrors || {});
    toast.error(handled.message);
  } else if (handled.type === 'toast') {
    toast.error(handled.message, {
      action: handled.action ? {
        label: 'Retry',
        onClick: handled.action,
      } : undefined,
    });
  } else if (handled.type === 'redirect') {
    toast.error(handled.message);
    handled.action?.();
  }
}
```

---

## 8. Responsive & Accessibility Implementation

### 8.1 Responsive Breakpoints

**Tailwind Breakpoints** (UX Spec Section 8.1):
```typescript
// tailwind.config.js (existing)
{
  screens: {
    'sm': '640px',   // Not used for profile
    'md': '768px',   // Tablet - Sheet direction change
    'lg': '1024px',  // Desktop
    'xl': '1280px',  // Wide desktop
  }
}
```

**Profile-Specific Breakpoints**:
- **Mobile**: < 768px (bottom sheets, stacked layout)
- **Desktop**: ≥ 768px (side sheets, side-by-side layout)

### 8.2 Responsive Component Behavior

**ProfileEditSheet**:
```typescript
<Sheet open={isOpen} onOpenChange={onClose}>
  <SheetContent
    side="right"                        // Desktop default
    className="
      md:max-w-[480px]                  // Desktop: fixed width
      max-md:bottom-0                   // Mobile: bottom sheet
      max-md:h-[85vh]                   // Mobile: 85% height
      max-md:rounded-t-lg               // Mobile: rounded top corners
    "
  >
    {/* Form content */}
  </SheetContent>
</Sheet>
```

**ProfileOnboardingWizard** (Mobile Layout):
```typescript
<div className="
  max-w-[480px] mx-auto px-4        // Centered, mobile padding
  md:px-6                            // Desktop padding
">
  {/* Progress indicator */}
  <div className="
    flex items-center justify-center  // Mobile: centered dots
    md:justify-between                // Desktop: full stepper
  ">
    <StepIndicator step={currentStep} />
  </div>
  
  {/* Form fields */}
  <div className="space-y-4 md:space-y-6">
    {/* Inputs */}
  </div>
  
  {/* Navigation buttons */}
  <div className="
    flex flex-col gap-3               // Mobile: stacked
    md:flex-row md:justify-between    // Desktop: inline
  ">
    <Button variant="secondary">Back</Button>
    <Button>Next</Button>
  </div>
</div>
```

### 8.3 Accessibility Implementation

**ARIA Attributes**:
```typescript
// Form fields with errors
<div>
  <Label htmlFor="username">Username *</Label>
  <Input
    id="username"
    aria-required="true"
    aria-invalid={!!errors.username}
    aria-describedby={errors.username ? "username-error" : undefined}
  />
  {errors.username && (
    <p id="username-error" className="text-destructive text-sm" role="alert">
      {errors.username}
    </p>
  )}
</div>

// Progress indicator
<div role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={4}>
  Step {currentStep} of 4
</div>

// Loading states
<Button disabled={isSubmitting}>
  {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
  {isSubmitting ? (
    <span className="sr-only">Saving profile...</span>
  ) : (
    'Save Changes'
  )}
</Button>
```

**Keyboard Navigation**:
- Tab order: Inputs → Buttons (logical flow)
- Enter: Submit form (in all steps)
- ESC: Close sheet/dialog
- Focus trap: Radix UI handles automatically

**Screen Reader Support**:
- All inputs have labels (visible or aria-label)
- Error messages announced via `role="alert"`
- Loading states announced via `sr-only` text
- Form submission status announced

**WCAG 2.1 AA Compliance** (UX Spec Section 7):
- Color contrast: 4.5:1 for normal text ✅
- Focus indicators: 2px ring ✅
- Touch targets: 44x44px minimum ✅
- Keyboard accessible: All interactive elements ✅

---

## 9. Performance Architecture

### 9.1 Optimization Strategies

**1. Lazy Loading Components**:
```typescript
// app/(app)/profile/page.tsx
import { lazy, Suspense } from 'react';

const ProfileEditSheet = lazy(() => import('@/components/profile/ProfileEditSheet'));

// In component
{isEditSheetOpen && (
  <Suspense fallback={null}>
    <ProfileEditSheet {...props} />
  </Suspense>
)}
```
**Benefit**: ~30KB saved on initial page load

**2. Optimistic UI Updates** (Already Implemented):
- Zero perceived latency for successful operations
- Instant visual feedback
- Automatic rollback on error

**3. Debounced API Calls**:
```typescript
// Username availability check
const [username, setUsername] = useState('');
const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

const checkAvailability = useMemo(
  () => debounce(async (value: string) => {
    if (value.length >= 3) {
      const result = await profileApi.checkUsername(value);
      setIsAvailable(result.available);
    }
  }, 500),
  []
);

useEffect(() => {
  checkAvailability(username);
}, [username]);
```
**Benefit**: Reduces API calls by ~80% during typing

**4. Skeleton Loading States**:
```typescript
// Prevents layout shift
if (loading) {
  return <ProfileSkeleton />;  // Matches ProfileCard dimensions
}
```

**5. Image Optimization**:
```typescript
// Avatar component
<img
  src={profile.profile_picture_url || '/default-avatar.svg'}
  alt={`${profile.username}'s avatar`}
  loading="lazy"
  width={120}
  height={120}
  onError={(e) => {
    e.currentTarget.src = '/default-avatar.svg';
  }}
/>
```

### 9.2 Performance Targets

**Core Web Vitals** (UX Spec Section 9.3):
- **LCP**: < 2.5s (Profile card appears)
- **FID**: < 100ms (Button click response)
- **CLS**: < 0.1 (Skeleton prevents layout shift)

**Bundle Size**:
- Profile page bundle: < 50KB gzipped
- Lazy-loaded edit sheet: ~30KB additional

**Interaction Response**:
- Optimistic update: < 50ms (instant)
- API roundtrip: < 500ms (4G network)
- Animation: 60fps (GPU-accelerated transforms)

---

## 10. Development Workflow

### 10.1 Story Implementation Sequence

**Phase 1: Foundation** (Stories 1.1, 1.2)
1. Empty state component
2. Onboarding wizard Step 1 (username)
3. API client `createProfile()` method

**Phase 2: Onboarding** (Story 1.3)
4. Wizard Steps 2, 3, 4
5. Form validation integration
6. Error handling for onboarding

**Phase 3: Profile View** (Story 1.4)
7. ProfileCard component
8. CompletenessIndicator component
9. ProfileView composition
10. Delete old placeholder components

**Phase 4: Editing** (Stories 1.5, 1.6)
11. ProfileEditSheet component
12. Form pre-population
13. Username change confirmation dialog
14. Optimistic update integration

**Phase 5: Polish** (Stories 1.7, 1.8)
15. Comprehensive error handling
16. Mobile responsiveness
17. Accessibility audit
18. Performance optimization

### 10.2 Testing Strategy

**Component Testing**:
```typescript
// ProfileOnboardingWizard.test.tsx
describe('ProfileOnboardingWizard', () => {
  it('validates username format', async () => {
    render(<ProfileOnboardingWizard onComplete={jest.fn()} />);
    
    const input = screen.getByLabelText('Username');
    await userEvent.type(input, 'ab');  // Too short
    await userEvent.tab();  // Trigger blur
    
    expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
  });
  
  it('advances to step 2 on valid username', async () => {
    render(<ProfileOnboardingWizard onComplete={jest.fn()} />);
    
    await userEvent.type(screen.getByLabelText('Username'), 'validuser');
    await userEvent.click(screen.getByText('Next: Basic Info'));
    
    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
  });
});
```

**Integration Testing**:
```typescript
// profile-page.integration.test.tsx
describe('Profile Page Integration', () => {
  it('creates profile and displays it', async () => {
    server.use(
      rest.get('/api/v1/profiles/me', (req, res, ctx) => {
        return res(ctx.status(404));  // No profile
      }),
      rest.post('/api/v1/profiles', (req, res, ctx) => {
        return res(ctx.json({ success: true, data: mockProfile }));
      })
    );
    
    render(<ProfilePage />);
    
    // Empty state
    expect(screen.getByText('Create Your Profile')).toBeInTheDocument();
    
    // Start wizard
    await userEvent.click(screen.getByText('Create Your Profile'));
    
    // Fill wizard
    await userEvent.type(screen.getByLabelText('Username'), 'newuser');
    await userEvent.click(screen.getByText('Next: Basic Info'));
    // ... complete wizard
    
    await userEvent.click(screen.getByText('Complete Profile'));
    
    // Profile view
    await waitFor(() => {
      expect(screen.getByText('newuser')).toBeInTheDocument();
    });
  });
});
```

### 10.3 Code Quality Checklist

**Before PR**:
- [ ] TypeScript: No `any` types, all props typed
- [ ] ESLint: Zero warnings
- [ ] Accessibility: Lighthouse score ≥ 95
- [ ] Component tests: All critical paths covered
- [ ] Error handling: All API errors handled
- [ ] Mobile: Tested on 375px width
- [ ] Keyboard: Tab order logical, ESC closes modals
- [ ] Screen reader: VoiceOver/NVDA tested

---

## Appendix

### A. Component Props Reference

```typescript
// EmptyProfileState.tsx
interface EmptyProfileStateProps {
  onCreateClick: () => void;
}

// ProfileOnboardingWizard.tsx
interface ProfileOnboardingWizardProps {
  onComplete: (data: ProfileCreateData) => Promise<void>;
  onCancel?: () => void;
}

// ProfileView.tsx
interface ProfileViewProps {
  profile: BasicProfile;
  onEditClick: () => void;
}

// ProfileCard.tsx
interface ProfileCardProps {
  profile: BasicProfile;
  onEditClick: () => void;
}

// ProfileEditSheet.tsx
interface ProfileEditSheetProps {
  profile: BasicProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: BasicProfileUpdate) => Promise<void>;
}

// UsernameChangeDialog.tsx
interface UsernameChangeDialogProps {
  open: boolean;
  oldUsername: string;
  newUsername: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// CompletenessIndicator.tsx
interface CompletenessIndicatorProps {
  profile: BasicProfile;
  variant?: 'expanded' | 'compact';
}
```

### B. File Creation Checklist

**New Files to Create**:
```
✅ components/profile/EmptyProfileState.tsx
✅ components/profile/ProfileOnboardingWizard.tsx
  ├── components/profile/steps/UsernameStep.tsx
  ├── components/profile/steps/BasicInfoStep.tsx
  ├── components/profile/steps/SocialLinksStep.tsx
  └── components/profile/steps/ReviewStep.tsx
✅ components/profile/ProfileView.tsx
✅ components/profile/ProfileCard.tsx
✅ components/profile/ProfileEditSheet.tsx
✅ components/profile/UsernameChangeDialog.tsx
✅ components/profile/CompletenessIndicator.tsx
✅ lib/utils/error-handler.ts
✅ lib/utils/validation.ts
```

**Files to Update**:
```
✏️  app/(app)/profile/page.tsx (orchestration logic)
✏️  lib/api/profile.ts (add createProfile method)
✏️  components/profile/ProfileSkeleton.tsx (minor layout updates)
```

**Files to Delete** (After Story 1.4 complete):
```
❌ components/profile/ProfileHeader.tsx
❌ components/profile/ProfileAvatar.tsx
❌ components/profile/ProfileBasicInfo.tsx
❌ components/profile/ProfileCompleteness.tsx
```

### C. Environment Variables

**Required** (already configured):
```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:4000

# Backend (.env)
DATABASE_URL=postgresql://...
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### D. Key Integration Points Summary

| Layer | Component | Integration Point | Status |
|-------|-----------|------------------|--------|
| **UI** | ProfileOnboardingWizard | Uses profileSchemas.createForm | ✅ Shared schema |
| **State** | useProfile hook | Implements optimistic updates | ✅ Already built |
| **API** | profileApi.createProfile() | POST /api/v1/profiles | ⚠️ Add method |
| **Auth** | createBrowserApiClient() | Auto JWT injection | ✅ Working |
| **Backend** | Profile API endpoints | Express.js routes | ✅ No changes |
| **Database** | profiles table | PostgreSQL schema | ✅ No changes |

---

## Next Steps

**For Product Manager (John)**:
- Review integration architecture
- Approve story sequence
- Set sprint deadlines

**For UX Designer (Sally)**:
- Create Figma prototypes based on Section 2 (Component Architecture)
- Design mobile variants for bottom sheets
- Provide design tokens (colors, spacing)

**For Developers**:
1. **Setup**: Verify environment variables
2. **Start with Story 1.1**: Empty state component
3. **Follow sequence**: Foundation → Onboarding → View → Edit → Polish
4. **Test continuously**: Component tests, integration tests, manual testing
5. **Delete old components**: Only after Story 1.4 fully tested

**Ready to Begin Implementation** ✅

---

**END OF INTEGRATION ARCHITECTURE**

