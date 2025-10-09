# Athaar Profile Management UI - Brownfield Enhancement PRD

**Version**: 1.0  
**Date**: October 7, 2025  
**Author**: John (Product Manager)  
**Status**: Draft

---

## Change Log

| Change | Date | Version | Description | Author |
|--------|------|---------|-------------|--------|
| Initial PRD Draft | 2025-10-07 | 1.0 | Brownfield PRD for Profile UI Integration | John (PM) |

---

## 1. Intro Project Analysis and Context

### 1.1 Scope Assessment

This PRD is for a **SIGNIFICANT enhancement** to the existing Athaar project that requires comprehensive planning and multiple stories. This enhancement warrants a full PRD process because:

✅ **Requires multiple coordinated user stories** (Profile creation, edit, view, delete)  
✅ **Involves substantial UI/UX work** (Forms, validation, empty states, error handling)  
✅ **Requires careful integration planning** (Backend API already exists, frontend needs full CRUD UI)  
✅ **Multiple technical considerations** (Authentication, validation, optimistic updates, error handling)

This is NOT a simple 1-2 session feature. **Full Brownfield PRD is appropriate.**

---

### 1.2 Analysis Source

**Analysis Source**: ✅ **Architecture document available**  
**Location**: `docs/profile-integration-architecture.md`  
**Created by**: Winston (Architect)  
**Date**: October 7, 2025

This document provides comprehensive analysis including:
- Complete backend API specifications (7 endpoints)
- Frontend component architecture
- Authentication flow
- Data models and validation
- Technical constraints and known issues
- Integration patterns

---

### 1.3 Current Project State

**Project**: Athaar  
**Type**: Brownfield Enhancement - Profile UI Integration

#### Current State Summary

**✅ Backend (Fully Implemented & Tested)**:
- Express.js + TypeScript REST API
- Clean layered architecture (Controller → Service → Repository)
- 7 profile endpoints fully functional
- Supabase JWT authentication
- Zod validation (shared schemas)
- PostgreSQL + Prisma ORM
- Soft delete support

**⚠️ Frontend (Partially Implemented)**:
- Next.js 15 + React 19
- Basic profile page exists (`apps/web/app/(app)/profile/page.tsx`)
- `useProfile` hook with optimistic updates ✅
- Display components created (ProfileHeader, ProfileAvatar, etc.) ✅
- **MISSING**: Profile creation flow ❌
- **MISSING**: Profile edit form (PROF-002 placeholder) ❌
- **MISSING**: Null/empty state handling ❌
- **MISSING**: Error boundary and graceful degradation ❌

---

### 1.4 Available Documentation

✅ **Tech Stack Documentation** - Complete in architecture doc  
✅ **Source Tree/Architecture** - Complete in architecture doc  
✅ **API Documentation** - Complete with request/response examples  
✅ **Coding Standards** - Implicit from existing codebase  
✅ **Technical Debt Documentation** - 5 known issues documented  
✅ **Authentication Flow** - Fully documented  
✅ **Data Models & Validation** - Complete Zod schemas  
⚠️ **UX/UI Guidelines** - Not documented (will define in this PRD)

**Status**: We have sufficient documentation to proceed. The architecture document provides excellent foundation.

---

### 1.5 Enhancement Scope Definition

**Enhancement Type**: ☑ **New Feature Addition** + **UI/UX Implementation**

**Enhancement Description**:

Implement a complete profile management UI for the Athaar platform that enables users to create, view, update, and manage their profiles. The backend API is fully implemented and tested; this enhancement focuses on building the frontend user experience that integrates with the existing API while handling edge cases like null profiles, validation errors, and providing an intuitive, modern interface.

---

### 1.6 Impact Assessment

**Impact Level**: ☑ **Moderate Impact** (some existing code changes)

**Analysis**:
- ✅ Backend API requires NO changes (fully implemented)
- ⚠️ Frontend profile page exists but needs significant enhancement
- ✅ Existing `useProfile` hook can be leveraged
- ✅ Existing display components can be reused temporarily
- ⚠️ Need to add: Forms, modals, empty states, error handling
- ✅ No database migrations required
- ✅ No API contract changes
- ⚠️ Old placeholder components will be deleted after new components are tested

---

### 1.7 Goals

**Goals** (desired outcomes if successful):

1. **Enable complete profile lifecycle management** - Users can create, view, edit, and manage their profiles from the UI
2. **Handle all user scenarios gracefully** - New users (no profile), empty profiles, partial profiles, complete profiles
3. **Provide immediate feedback** - Optimistic updates, validation, clear error messages
4. **Ensure data integrity** - Client and server-side validation, proper error handling
5. **Modern, intuitive UX** - Clean forms, progressive disclosure, helpful guidance, mobile-responsive
6. **Seamless API integration** - Leverage existing backend without modifications, handle all API states

---

### 1.8 Background Context

Currently, Athaar has a **fully functional profile management API** implemented with Express.js, Prisma, and Supabase authentication. The backend supports complete CRUD operations, validation, username uniqueness checks, and privacy filters.

However, the **frontend UI is incomplete**. While basic display components exist, users cannot create or edit their profiles through the interface. New users who log in see errors because no profile creation flow exists. The profile page has placeholders for edit functionality (marked as PROF-002) but no implementation.

This enhancement will **bridge the gap** between the robust backend and the user experience, enabling users to fully manage their profiles. It fits with the existing project by completing the profile management feature set and providing a foundation for future profile-related features (analytics, visibility settings, image uploads).

**Why now**: The backend API is stable and tested. Completing the UI is the logical next step to make the profile system functional for end users.

---

## 2. Requirements

### 2.1 Functional Requirements

**FR1**: Users must be able to **create their initial profile** when visiting the profile page for the first time, providing a username (required) and optional fields (bio, profile picture URL, LinkedIn URL, GitHub URL, portfolio URL).

**FR2**: Users must be able to **view their complete profile** including all fields (username, bio, profile picture, social links) with a visual indicator of profile completeness.

**FR3**: Users must be able to **edit their profile** by clicking an "Edit Profile" button, which opens a form (Radix UI Sheet) pre-populated with current values, allowing updates to any field.

**FR4**: The system must display **appropriate empty states** when no profile exists, guiding users to create their profile with clear call-to-action.

**FR5**: Users must receive **immediate visual feedback** for profile updates through optimistic UI updates, with automatic rollback on errors.

**FR6**: The system must display **inline validation errors** for invalid inputs (username format, URL format, bio length) before and after submission.

**FR7**: Users must be able to **cancel profile creation or editing** without saving changes, with unsaved changes discarded.

**FR8**: The system must handle **partial profile data** gracefully, showing which fields are missing and encouraging completion.

**FR9**: Users must see **loading states** (skeletons) while profile data is being fetched from the API.

**FR10**: The system must display **meaningful error messages** for all API failures (network errors, authentication errors, validation errors, conflicts).

**FR11**: Users must be able to **view their profile completeness** as a percentage with visual progress indicator showing which sections are complete/incomplete.

**FR12**: When users attempt to **change their username**, the system must display a **confirmation dialog** warning: *"Changing your username may affect your profile URL and how others find you. Are you sure?"* with Cancel/Confirm options.

**FR13**: The profile page must include an **integrated progressive multi-step onboarding wizard** for first-time users (no existing profile), with the following structure:
- **Step 1: Username** - Choose unique username with format validation
- **Step 2: Basic Info** - Add bio and profile picture URL
- **Step 3: Social Links** - Add LinkedIn, GitHub, Portfolio URLs (all optional)
- **Step 4: Review & Complete** - Review all information before submission
- Visual progress indicator showing current step (e.g., "Step 2 of 4")
- "Back" and "Next/Complete" navigation buttons
- Ability to save and continue later (if applicable)

---

### 2.2 Non-Functional Requirements

**NFR1**: The profile UI must maintain **existing authentication flow** using Supabase JWT tokens without modifications to the auth system.

**NFR2**: All form inputs must be **validated client-side** using the existing shared Zod schemas from `@monolenz/types/validation` before API submission.

**NFR3**: The UI must provide **optimistic updates** that update immediately on user action, with automatic rollback on API errors, maintaining the existing `useProfile` hook pattern.

**NFR4**: The profile edit form must be **mobile-responsive** and work seamlessly on screens from 320px to 1920px width.

**NFR5**: All user-facing text must be **clear and actionable**, avoiding technical jargon in error messages.

**NFR6**: The UI must follow **existing Radix UI + Tailwind CSS patterns** established in the codebase for visual consistency.

**NFR7**: Form submission must include **loading indicators** with disabled submit buttons to prevent duplicate submissions.

**NFR8**: The UI must handle **network failures gracefully** with retry options where appropriate.

**NFR9**: Profile creation and editing must complete within **2 seconds** under normal network conditions (excluding network latency).

---

### 2.3 Compatibility Requirements

**CR1 - Existing API Compatibility**: The frontend must integrate with the existing profile API endpoints (`GET /api/v1/profiles/me`, `PUT /api/v1/profiles/me`, `POST /api/v1/profiles`) without requiring any backend changes or API contract modifications.

**CR2 - Database Schema Compatibility**: The UI must respect existing database constraints (username uniqueness, 500-character URL limits, 50-character username limit, 500-character bio limit) and handle constraint violation errors appropriately.

**CR3 - UI/UX Consistency**: New profile forms and components must be **built from scratch** using Radix UI primitives (Button, Label, Input, Sheet, Dialog) and Tailwind CSS, following the established design patterns in the codebase. The existing placeholder components (`ProfileHeader`, `ProfileAvatar`, `ProfileBasicInfo`, `ProfileCompleteness`) will be **replaced** with new, production-ready components. **Deletion of old components will occur AFTER new components are fully implemented and tested.**

**CR4 - Integration Compatibility**: The profile UI must work seamlessly with existing navigation, dashboard layout (`apps/web/app/(app)/dashboard/layout.tsx`), and maintain consistency with other authenticated pages in the `(app)` route group.

**CR5 - Profile Visibility**: Profile visibility will default to existing backend behavior: profiles are public by default, showing username, bio, portfolio URL, and profile picture to all users. LinkedIn and GitHub URLs are only visible to the profile owner. No additional privacy settings will be added in this enhancement.

**CR6 - Validation Compatibility**: The frontend must use the same Zod validation schemas (`profileSchemas.createForm`, `profileSchemas.updateForm`) as the backend to ensure consistent validation rules and error messages across client and server.

---

## 3. User Interface Enhancement Goals

### 3.1 Integration with Existing UI

The profile management UI will integrate into the existing Athaar application structure as follows:

**Route Structure**:
- Profile lives at `/profile` within the `(app)` authenticated route group
- Uses existing `apps/web/app/(app)/dashboard/layout.tsx` for navigation/header
- Maintains consistency with other authenticated pages

**Design System Integration**:
- **Component Library**: Radix UI primitives (already in use)
- **Styling**: Tailwind CSS v4.1.11 (current version)
- **Typography**: Follow existing heading/body text patterns
- **Color Palette**: Use existing CSS variables for primary, secondary, destructive, muted colors
- **Spacing**: Maintain existing spacing scale (p-4, gap-6, etc.)
- **Animation**: Leverage existing animation classes (fade-in, slide-in)

**Component Patterns to Follow**:
- **Forms**: Radix UI Label + Input pattern seen in auth forms (`LoginForm.tsx`, `SignupForm.tsx`)
- **Buttons**: Radix UI Button with variants (default, outline, ghost, destructive)
- **Modals**: Radix UI Sheet for slide-out panels (edit profile form)
- **Dialogs**: Radix UI AlertDialog for confirmations (username change)
- **Loading**: Skeleton components for loading states (like existing `ProfileSkeleton.tsx`)
- **Toast Notifications**: Sonner (already in package.json) for success/error messages

**Navigation Integration**:
- Profile accessible from existing header/navigation
- Maintain existing authenticated layout wrapper
- Breadcrumb/back navigation if applicable

---

### 3.2 Modified/New Screens and Views

#### 3.2.1 Profile Page - Empty State (New Users)
- **Path**: `/profile`
- **State**: User authenticated but no profile exists (404 from API)
- **Components**:
  - Welcome message
  - Benefits of completing profile
  - "Get Started" CTA button
  - Illustration or empty state graphic

#### 3.2.2 Profile Page - Onboarding Wizard (New)
- **Path**: `/profile` (same page, wizard state)
- **Triggered**: When user clicks "Get Started" from empty state
- **Components**:
  - **Step 1: Username**
    - Username input field
    - Character count (3-50)
    - Format helper text
    - "Next" button (disabled until valid username)
  - **Step 2: Basic Info**
    - Bio textarea (500 char max with counter)
    - Profile picture URL input (optional)
    - URL preview/validation
    - "Back" and "Next" buttons
  - **Step 3: Social Links**
    - LinkedIn URL input (optional)
    - GitHub URL input (optional)
    - Portfolio URL input (optional)
    - URL validation and helper text
    - "Back" and "Next" buttons
  - **Step 4: Review**
    - Summary of all entered information
    - Profile preview (how it will appear)
    - "Back" and "Complete Profile" buttons
  - Progress indicator across all steps

#### 3.2.3 Profile Page - View Mode (Existing Profile)
- **Path**: `/profile`
- **State**: User has complete profile
- **Components** (All NEW, replace old):
  - **Profile Card** (replaces ProfileHeader):
    - Avatar display (from profile_picture_url or default)
    - Username (large, prominent)
    - Bio (if exists)
    - Social link icons/buttons (LinkedIn, GitHub, Portfolio)
    - Profile completeness indicator with percentage
    - "Edit Profile" button
  - **Completeness Section**:
    - Visual progress bar
    - List of complete/incomplete sections
    - Encouragement to complete missing fields
  - **Future**: Placeholder for blocks/versions (not in this scope)

#### 3.2.4 Profile Page - Edit Sheet (Modal)
- **Triggered**: Click "Edit Profile" button
- **Component**: Radix UI Sheet (slide-out from right)
- **Contains**:
  - Sheet header: "Edit Profile" + Close button
  - Form with all profile fields (pre-populated):
    - Username
    - Bio (textarea with counter)
    - Profile picture URL
    - LinkedIn URL
    - GitHub URL
    - Portfolio URL
  - Inline validation errors
  - Loading state on submit
  - "Cancel" and "Save Changes" buttons
  - Unsaved changes warning on close (if modified)

#### 3.2.5 Username Change Confirmation Dialog
- **Triggered**: When username field is modified in edit form and user clicks "Save"
- **Component**: Radix UI AlertDialog
- **Content**:
  - Warning icon
  - Title: "Confirm Username Change"
  - Message: "Changing your username from '[old]' to '[new]' may affect your profile URL and how others find you. This action cannot be easily undone. Are you sure you want to continue?"
  - "Cancel" button (secondary)
  - "Yes, Change Username" button (primary, slightly warning style)

#### 3.2.6 Error States
- **Network Error**: Toast notification with retry option
- **Validation Error**: Inline field errors (red text below inputs)
- **Conflict Error** (username taken): Inline error + message
- **Authentication Error**: Redirect to login with message

#### 3.2.7 Loading States
- **Initial Load**: Full page skeleton (similar to existing ProfileSkeleton)
- **Form Submission**: Button loading spinner + disabled state
- **Optimistic Update**: Immediate UI update, show subtle loading on avatar/card

---

### 3.3 UI Consistency Requirements

**Visual Consistency**:
1. All new components must match existing button styles (hover states, focus rings, disabled states)
2. Form inputs must have consistent height, padding, border-radius as auth forms
3. Error states must use existing destructive color variant
4. Success states must use existing success/green color variant
5. Modal/sheet backgrounds must match existing overlay styles

**Interaction Consistency**:
1. Form validation triggers on blur and on submit (not on every keystroke)
2. Loading states disable interactive elements (buttons, inputs)
3. Toast notifications appear top-right with 4-second auto-dismiss (existing Sonner config)
4. Dialogs can be dismissed with ESC key or clicking outside (standard Radix behavior)
5. Focus management: When sheet opens, focus first input; when closes, return focus to trigger button

**Accessibility Consistency**:
1. All form inputs must have associated labels (visible or aria-label)
2. Error messages must be associated with inputs via aria-describedby
3. Loading states must announce to screen readers
4. Keyboard navigation must work for entire flow (Tab, Enter, ESC)
5. Color contrast must meet WCAG AA standards (existing theme complies)

**Mobile Responsiveness**:
1. Onboarding wizard must work on mobile (320px+) with adjusted layout
2. Edit sheet must slide from bottom on mobile (<768px), right on desktop
3. Form inputs must be touch-friendly (min 44px height)
4. Text must remain readable without zooming (min 16px font size on mobile)

---

## 4. Technical Constraints and Integration Requirements

### 4.1 Existing Technology Stack

| Category | Technology | Version | Constraints & Notes |
|----------|-----------|---------|---------------------|
| **Frontend Runtime** | Next.js | 15.4.2 | App Router architecture; Server Components available but profile uses client components |
| **Frontend Library** | React | 19.1.0 | Latest stable; hooks-based patterns |
| **UI Framework** | Radix UI + Tailwind CSS | 4.1.11 | Component primitives + utility-first styling |
| **State Management** | React Hooks | Native | useProfile hook already implements optimistic updates |
| **Backend Runtime** | Node.js + Express | 4.18.2 | REST API server; no changes required |
| **Database** | PostgreSQL (Supabase) | N/A | Multi-schema (auth, public); managed by Supabase |
| **ORM** | Prisma | 6.12.0 | Type-safe database client; schema already includes profiles table |
| **Authentication** | Supabase Auth | 2.52.1 | JWT-based; email confirmation required for API access |
| **Validation** | Zod | 3.22.4 | **Shared schemas** between frontend and backend (critical constraint) |
| **Package Manager** | pnpm | Latest | Monorepo workspace; shared packages via `workspace:*` |
| **HTTP Client** | Fetch API | Native | Wrapped in custom API client with token injection |
| **Toast Notifications** | Sonner | 2.0.7 | Already installed; use for success/error feedback |

**Critical Stack Constraints**:
- ✅ Backend API requires **zero changes** (fully functional)
- ⚠️ Must use shared `@monolenz/types` package for validation schemas
- ⚠️ Supabase JWT token must be included in all authenticated requests
- ✅ Existing `useProfile` hook provides optimistic update pattern - **reuse this**

---

### 4.2 Integration Approach

#### 4.2.1 Database Integration Strategy

**Constraint**: NO database changes required or allowed.

**Integration Approach**:
- Profiles table already exists in `public` schema with all required columns
- Profile `id` is foreign key to `auth.users.id` (1-to-1 relationship enforced by backend)
- Username has UNIQUE constraint (enforced at database level)
- All URL fields limited to 500 characters (enforced at database level)
- Frontend must handle constraint violation errors gracefully (409 Conflict for duplicate username)

**No migrations needed** - table structure is final for this enhancement.

---

#### 4.2.2 API Integration Strategy

**Integration Pattern**: Use existing API client with automatic token injection.

**Backend API Endpoints** (NO changes):
- `POST /api/v1/profiles` - Create profile (onboarding Step 4 completion)
- `GET /api/v1/profiles/me` - Fetch user's profile (page load)
- `PUT /api/v1/profiles/me` - Update profile (edit form submission)
- All endpoints return standard format: `{ success, message, data, meta }`

**Request/Response Handling**:
```typescript
// Profile Creation (Onboarding)
POST /api/v1/profiles
Body: { username, bio?, profile_picture_url?, linkedin_url?, github_url?, portfolio_url? }
Response: { success: true, data: ProfileObject }

// Profile Update (Edit Form)
PUT /api/v1/profiles/me
Body: { ...same as above, all fields optional }
Response: { success: true, data: ProfileObject }
```

**Error Handling Strategy**:
- **401 Unauthorized**: Redirect to login (token expired/invalid)
- **404 Not Found**: Show empty state with onboarding CTA
- **409 Conflict**: Show inline error "Username already taken"
- **422 Validation Error**: Display field-specific errors inline
- **500 Server Error**: Show generic error toast with retry option

**Authentication Flow**:
1. Supabase client retrieves session token automatically
2. `createBrowserApiClient()` wraps fetch with token injection
3. All profile API calls use this client (no manual token handling)
4. Backend middleware validates token on every protected request

---

#### 4.2.3 Frontend Integration Strategy

**Component Architecture**:

```
/app/(app)/profile/page.tsx (Main Profile Page - Client Component)
├── State: Empty Profile (404)
│   └── <EmptyProfileState /> (New)
│       └── Triggers onboarding wizard
│
├── State: Onboarding Mode
│   └── <ProfileOnboardingWizard /> (New)
│       ├── <UsernameStep /> (Step 1)
│       ├── <BasicInfoStep /> (Step 2)
│       ├── <SocialLinksStep /> (Step 3)
│       └── <ReviewStep /> (Step 4)
│
├── State: Profile Exists
│   └── <ProfileView /> (New - replaces old ProfileHeader)
│       ├── <ProfileCard /> (New)
│       ├── <CompletenessIndicator /> (New)
│       └── <ProfileEditSheet /> (New - Modal)
│           ├── <ProfileEditForm />
│           └── <UsernameChangeDialog /> (Conditional)
│
└── State: Loading
    └── <ProfileSkeleton /> (Existing - may need updates)
```

**State Management Pattern**:
```typescript
// Leverage existing useProfile hook
const { profile, loading, error, updateProfile, refetch } = useProfile();

// Add local state for UI modes
const [mode, setMode] = useState<'view' | 'onboarding' | 'editing'>('view');
const [onboardingStep, setOnboardingStep] = useState(1);
const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

// Determine mode based on profile state
useEffect(() => {
  if (loading) return;
  if (!profile) setMode('onboarding');
  else setMode('view');
}, [profile, loading]);
```

**Routing Strategy**:
- Single route `/profile` handles all states (empty, onboarding, view, edit)
- No URL parameters needed (state managed internally)
- Edit form opens as overlay (sheet), not separate route
- Preserves existing authenticated layout wrapper

---

### 4.3 Code Organization and Standards

#### 4.3.1 File Structure Approach

```
apps/web/
├── app/(app)/profile/
│   └── page.tsx                          # Main orchestrator (updated)
│
├── components/profile/                   # Profile components folder
│   ├── EmptyProfileState.tsx            # NEW
│   ├── ProfileOnboardingWizard.tsx      # NEW
│   │   ├── steps/                       # NEW subfolder
│   │   │   ├── UsernameStep.tsx
│   │   │   ├── BasicInfoStep.tsx
│   │   │   ├── SocialLinksStep.tsx
│   │   │   └── ReviewStep.tsx
│   ├── ProfileView.tsx                  # NEW (main view component)
│   ├── ProfileCard.tsx                  # NEW (replaces ProfileHeader)
│   ├── ProfileEditSheet.tsx             # NEW (edit form modal)
│   ├── UsernameChangeDialog.tsx         # NEW (confirmation dialog)
│   ├── CompletenessIndicator.tsx        # NEW (replaces ProfileCompleteness)
│   ├── ProfileSkeleton.tsx              # KEEP (may update)
│   │
│   # DELETE AFTER NEW COMPONENTS TESTED:
│   ├── ProfileHeader.tsx                # DELETE
│   ├── ProfileAvatar.tsx                # DELETE
│   ├── ProfileBasicInfo.tsx             # DELETE
│   └── ProfileCompleteness.tsx          # DELETE
│
├── lib/hooks/
│   └── useProfile.ts                    # KEEP (already optimal)
│
├── lib/api/
│   └── profile.ts                       # KEEP (already has all methods)
│
└── lib/utils/
    └── profile-validation.ts            # NEW (client-side validation helpers)
```

**Component Naming Conventions**:
- Components: PascalCase (e.g., `ProfileEditSheet`)
- Hooks: camelCase with `use` prefix (e.g., `useProfile`)
- Utilities: camelCase (e.g., `validateProfileData`)
- Types: PascalCase (e.g., `ProfileFormData`)

---

#### 4.3.2 Coding Standards

**TypeScript Requirements**:
- Strict mode enabled (existing tsconfig)
- All props interfaces must be explicitly typed
- No `any` types (use `unknown` if type is truly unknown)
- Use Zod schemas for runtime validation, derive types when possible

**React Patterns**:
- Prefer functional components with hooks (no class components)
- Use `'use client'` directive for client components explicitly
- Memoize expensive computations with `useMemo`
- Use controlled components for forms

**Form Handling**:
```typescript
// Use controlled components with React state
const [formData, setFormData] = useState<ProfileFormData>({});

// Validate with Zod before submission
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  try {
    const validated = profileSchemas.createForm.parse(formData);
    await profileApi.createProfile(validated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Display field errors
    }
  }
};
```

**Error Handling**:
```typescript
// Always catch and handle API errors
try {
  await updateProfile(data);
  toast.success('Profile updated successfully');
} catch (error) {
  const apiError = error as ApiError;
  if (apiError.errors) {
    // Show field-specific errors
  } else {
    toast.error(apiError.message || 'Failed to update profile');
  }
}
```

---

### 4.4 Deployment and Operations

#### 4.4.1 Build Process Integration

**No changes to build process**:
- Next.js builds profile page as client component bundle
- Existing `pnpm build` in `apps/web` handles all new components
- TypeScript compilation catches type errors pre-build
- ESLint runs on all new files (must pass with 0 warnings)

**Environment Variables** (existing, no changes):
```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
NEXT_PUBLIC_API_URL=http://localhost:4000  # Dev: localhost, Prod: api domain
```

---

#### 4.4.2 Deployment Strategy

**Frontend Deployment**:
- Deploy to existing Next.js hosting (Vercel/similar)
- No backend deployment needed (API unchanged)
- Environment variables already configured in hosting platform

**Deployment Steps**:
1. Merge feature branch to main
2. Run `pnpm build` in `apps/web` (CI/CD pipeline)
3. Deploy build artifacts to hosting
4. No database migrations required
5. No API server restart needed

**Rollback Strategy**:
- Frontend: Revert to previous deployment (hosting platform feature)
- Backend: Not applicable (no changes)
- Database: Not applicable (no migrations)

---

#### 4.4.3 Monitoring and Logging

**Frontend Monitoring**:
- Log profile creation/update errors to console (development)
- Consider adding error tracking (Sentry) in production for:
  - API call failures
  - Validation errors (unexpected)
  - Component render errors

**Key Metrics to Track** (future consideration):
- Profile completion rate (onboarding → successful creation)
- Drop-off rate by onboarding step
- Average time to complete onboarding
- Edit form usage frequency
- Username change frequency

**User Feedback**:
- Success toasts for profile creation/updates (via Sonner)
- Error toasts for network/server failures
- Inline validation messages for form errors

---

### 4.5 Risk Assessment and Mitigation

#### 4.5.1 Technical Risks

**Risk 1: Shared Zod Schema Mismatch**
- **Description**: Frontend and backend validation schemas could drift if `@monolenz/types` package is not kept in sync
- **Impact**: Validation errors, form submission failures, user confusion
- **Mitigation**: 
  - Use pnpm workspace to ensure same version in both apps
  - Add pre-commit hook to verify schema consistency
  - Include validation schema tests in CI/CD

**Risk 2: Optimistic Update Rollback Failures**
- **Description**: Optimistic UI updates might not rollback correctly on API errors, leaving stale UI state
- **Impact**: User sees incorrect profile data until page refresh
- **Mitigation**: 
  - Thoroughly test error scenarios
  - Store original profile state before optimistic update
  - Add timeout fallback to refetch profile if update hangs

**Risk 3: Component Deletion Timing**
- **Description**: Deleting old components before new ones are fully tested could break existing functionality
- **Impact**: Profile page completely broken until fix deployed
- **Mitigation**: 
  - Delete old components ONLY after new components pass testing
  - Create separate story for component cleanup
  - Use feature branch for development, test thoroughly before merge

---

#### 4.5.2 Integration Risks

**Risk 1: API Response Format Changes**
- **Description**: Backend team inadvertently changes API response structure
- **Impact**: Frontend breaks due to unexpected response format
- **Mitigation**: 
  - API is already stable and tested (per architecture doc)
  - Add TypeScript types for API responses
  - Consider API contract tests (future)
  - Communicate with backend team about API stability

**Risk 2: Authentication Token Expiration**
- **Description**: User completes long onboarding wizard, token expires, profile creation fails
- **Impact**: Lost form data, frustrating user experience
- **Mitigation**: 
  - Supabase automatically refreshes tokens (already handled)
  - Save wizard progress to localStorage (optional enhancement)
  - Display clear error message if token expired: "Session expired. Please log in again."

**Risk 3: CORS Configuration**
- **Description**: CORS headers not configured for production frontend domain
- **Impact**: All API calls fail in production
- **Mitigation**: 
  - Verify CORS config includes production domain
  - Test in staging environment before production deploy
  - Backend likely already configured (existing auth flows work)

---

#### 4.5.3 Deployment Risks

**Risk 1: Missing Environment Variables**
- **Description**: Production deployment missing `NEXT_PUBLIC_API_URL` or Supabase keys
- **Impact**: Profile page cannot connect to API
- **Mitigation**: 
  - Verify environment variables in hosting platform before deploy
  - Add startup check to validate required env vars exist
  - Document required env vars in deployment guide

**Risk 2: Cache Invalidation**
- **Description**: Users see old profile page (cached) after deployment
- **Impact**: Missing new onboarding wizard, unable to create/edit profile
- **Mitigation**: 
  - Next.js automatic cache busting (build hash in filenames)
  - Add cache headers to force revalidation on deployment
  - Communicate deployment to active users (optional)

---

#### 4.5.4 Mitigation Strategies Summary

| Risk Category | Strategy |
|--------------|----------|
| **Technical** | Thorough testing, shared schema validation, error handling with rollback |
| **Integration** | API contract stability, token refresh automation, CORS verification |
| **Deployment** | Environment variable checklist, staging environment testing, cache busting |
| **User Experience** | Clear error messages, form progress saving (future), retry mechanisms |

---

## 5. Epic and Story Structure

### 5.1 Epic Approach

**Epic Structure Decision**: **Single Epic - "Profile Management UI"** with 8 sequenced stories that build upon each other incrementally while maintaining existing system integrity.

**Rationale for Single Epic**:
1. **Cohesive Feature Set**: All stories contribute to one user goal (complete profile management)
2. **Shared Dependencies**: Components and hooks are reused across creation, viewing, and editing
3. **API Integration**: All stories integrate with the same backend API endpoints
4. **User Journey**: Stories follow natural user progression (create → view → edit)
5. **Brownfield Pattern**: This is an enhancement to one feature area, not multiple unrelated features

---

## Epic 1: Profile Management UI

**Epic Goal**: Enable complete profile lifecycle management through an intuitive, responsive UI that integrates seamlessly with the existing Athaar backend API, allowing users to create, view, edit, and manage their profiles while maintaining existing system integrity.

**Integration Requirements**: 
- Integrate with existing profile API endpoints (POST, GET, PUT) without backend modifications
- Use existing `useProfile` hook for state management and optimistic updates
- Follow established Radix UI + Tailwind CSS patterns
- Maintain compatibility with existing authentication flow (Supabase JWT)
- Delete old placeholder components only after new components are fully tested

---

### Story 1.1: Empty Profile State & Error Handling

**As a** new user who has just signed up,  
**I want** to see a welcoming empty state when I have no profile,  
**so that** I understand I need to create a profile and feel guided to do so.

#### Acceptance Criteria

**AC1**: When a user navigates to `/profile` and the API returns 404 (no profile exists), the page displays an `EmptyProfileState` component with:
- Welcome heading: "Welcome to Your Profile"
- Descriptive text explaining benefits of completing a profile
- Clear call-to-action button: "Create Your Profile"
- Optional illustration or empty state graphic

**AC2**: When the "Create Your Profile" button is clicked, the page transitions to show the onboarding wizard (Step 1 visible).

**AC3**: When API returns authentication error (401), the user is redirected to `/login` with a message: "Your session has expired. Please log in again."

**AC4**: When API returns network error or 500 server error, a toast notification displays: "Unable to load profile. Please try again." with a "Retry" button that refetches profile data.

**AC5**: All error states maintain the existing dashboard layout (header/navigation visible).

#### Integration Verification

**IV1**: Verify existing `useProfile` hook correctly handles 404 response and sets error state without breaking page render.

**IV2**: Verify existing Supabase authentication redirect logic works when token is invalid/expired.

**IV3**: Verify toast notifications use existing Sonner configuration and appear in correct position (top-right).

---

### Story 1.2: Onboarding Wizard - Step 1 (Username)

**As a** new user starting profile creation,  
**I want** to choose my username in a focused, simple first step,  
**so that** I can establish my identity without being overwhelmed.

#### Acceptance Criteria

**AC1**: When the onboarding wizard is active, Step 1 displays:
- Progress indicator: "Step 1 of 4"
- Section heading: "Choose Your Username"
- Helper text: "This will be your unique identifier on Athaar. Choose wisely - it can be changed later."
- Username input field with placeholder "e.g., john_developer"
- Character counter showing "0/50"
- Format hint below input: "3-50 characters: letters, numbers, underscores, and hyphens only"

**AC2**: Username input validates format in real-time:
- Shows red error text if less than 3 characters: "Username must be at least 3 characters"
- Shows red error text if more than 50 characters: "Username must be less than 50 characters"
- Shows red error text if contains invalid characters: "Only letters, numbers, underscores, and hyphens allowed"
- Shows green checkmark icon when format is valid

**AC3**: "Next" button at bottom is:
- Disabled (grayed out) when username is empty or format is invalid
- Enabled (primary style) when username format is valid
- Shows text "Next: Basic Info"

**AC4**: Clicking "Next" button when enabled saves username to wizard state and advances to Step 2.

**AC5**: Back button is not shown on Step 1 (first step).

#### Integration Verification

**IV1**: Verify username validation uses the shared Zod schema from `@monolenz/types/validation/profile-schemas.ts` (specifically the username portion).

**IV2**: Verify wizard state (username value) persists when user navigates back from Step 2 to Step 1.

**IV3**: Verify username is normalized (trimmed, lowercased if needed) according to existing backend business rules.

---

### Story 1.3: Onboarding Wizard - Steps 2, 3, 4 (Basic Info, Social Links, Review)

**As a** new user completing profile creation,  
**I want** to add my bio, profile picture, and social links in organized steps,  
**so that** I can build a complete profile without confusion.

#### Acceptance Criteria

**AC1 - Step 2: Basic Info**
- Progress indicator: "Step 2 of 4"
- Section heading: "Tell Us About Yourself"
- Bio textarea with:
  - Label: "Bio (optional)"
  - Placeholder: "Share a bit about yourself..."
  - Character counter: "0/500"
  - Max 500 characters enforced
- Profile picture URL input with:
  - Label: "Profile Picture URL (optional)"
  - Placeholder: "https://example.com/avatar.jpg"
  - URL format validation (shows error if invalid URL)
- "Back" button (returns to Step 1)
- "Next: Social Links" button (always enabled, fields optional)

**AC2 - Step 3: Social Links**
- Progress indicator: "Step 3 of 4"
- Section heading: "Connect Your Profiles"
- Three URL input fields (all optional):
  - LinkedIn URL with placeholder "https://linkedin.com/in/yourname"
  - GitHub URL with placeholder "https://github.com/yourname"
  - Portfolio URL with placeholder "https://yourportfolio.com"
- Each URL field validates format (shows error if invalid URL format)
- "Back" button (returns to Step 2)
- "Next: Review" button (enabled when no validation errors)

**AC3 - Step 4: Review & Complete**
- Progress indicator: "Step 4 of 4"
- Section heading: "Review Your Profile"
- Profile preview card displaying:
  - Avatar placeholder (or from profile_picture_url if provided)
  - Username (large, prominent)
  - Bio (if provided, or "No bio added" in muted text)
  - Social link icons (only visible links shown)
- "Back" button (returns to Step 3)
- "Complete Profile" button (primary, prominent)

**AC4**: Clicking "Complete Profile" button:
- Shows loading spinner on button
- Disables all form inputs
- Calls `POST /api/v1/profiles` with all wizard data
- On success: Shows success toast "Profile created successfully!" and transitions to profile view mode
- On error (409 - username taken): Shows error toast "Username '[username]' is already taken" with "Go Back" button that returns to Step 1
- On error (422 - validation): Shows specific field errors and highlights affected step
- On error (other): Shows generic error toast with retry option

**AC5**: All steps maintain wizard state - user can navigate back and forward without losing data until final submission.

#### Integration Verification

**IV1**: Verify profile creation uses existing `profileApi.createProfile()` method from `apps/web/lib/api/profile.ts`.

**IV2**: Verify successful profile creation triggers `useProfile` hook to refetch and update profile state.

**IV3**: Verify username conflict (409) error is handled gracefully without breaking wizard flow.

**IV4**: Verify all URL fields validate using Zod URL schema from shared types package.

**IV5**: Verify wizard clears state after successful profile creation.

---

### Story 1.4: Profile View Component (Replace Old Components)

**As a** user with an existing profile,  
**I want** to see my complete profile information in a clean, organized layout,  
**so that** I can view my profile details and access editing functionality.

#### Acceptance Criteria

**AC1**: When profile exists and loads successfully, the page displays new `ProfileView` component containing:
- `ProfileCard` component with:
  - Avatar (from profile_picture_url or default placeholder)
  - Username (large, bold heading)
  - Bio (if exists, or "No bio added" in muted text)
  - Social link buttons (only for links that exist):
    - LinkedIn icon button (opens in new tab)
    - GitHub icon button (opens in new tab)
    - Portfolio icon button (opens in new tab)
  - "Edit Profile" button (prominent, top-right or below info)

**AC2**: Profile displays `CompletenessIndicator` component showing:
- Progress bar (0-100%) based on filled fields
- Percentage text: "75% Complete"
- List of missing optional fields: "Add LinkedIn to improve your profile"
- Encouraging message when 100%: "Your profile is complete! 🎉"

**AC3**: Completeness calculation:
- Username: Required, always counts as filled
- Bio: 20% if filled
- Profile Picture URL: 20% if filled
- LinkedIn URL: 20% if filled
- GitHub URL: 20% if filled
- Portfolio URL: 20% if filled
- Total: 100% = all 6 fields filled

**AC4**: Loading state shows `ProfileSkeleton` component (existing, may need minor updates).

**AC5**: After this story is complete and tested, **old components are deleted**:
- Delete `ProfileHeader.tsx`
- Delete `ProfileAvatar.tsx`
- Delete `ProfileBasicInfo.tsx`
- Delete `ProfileCompleteness.tsx`

#### Integration Verification

**IV1**: Verify profile data is fetched using existing `useProfile` hook with no modifications to the hook itself.

**IV2**: Verify social link URLs open in new tab with `target="_blank"` and `rel="noopener noreferrer"` for security.

**IV3**: Verify `CompletenessIndicator` calculation matches existing `calculateCompleteness` utility function (if exists) or uses same logic.

**IV4**: Verify new `ProfileCard` component follows exact same styling patterns as existing authenticated page components (same card style, padding, shadows).

**IV5**: Verify old component imports are removed from `page.tsx` without breaking page render.

---

### Story 1.5: Profile Edit Form (Sheet Modal)

**As a** user with an existing profile,  
**I want** to edit my profile details in a focused modal form,  
**so that** I can update my information without losing context of my current profile.

#### Acceptance Criteria

**AC1**: Clicking "Edit Profile" button opens `ProfileEditSheet` (Radix UI Sheet) that:
- Slides in from right on desktop (>768px)
- Slides in from bottom on mobile (≤768px)
- Overlays the profile view with semi-transparent backdrop
- Traps focus inside sheet (ESC key closes, clicking backdrop closes)
- Returns focus to "Edit Profile" button when closed

**AC2**: Sheet header displays:
- Title: "Edit Profile"
- Close button (X icon, top-right)

**AC3**: Sheet body contains `ProfileEditForm` with all fields pre-populated from current profile:
- Username field (with current username value)
- Bio textarea (with current bio or empty)
- Profile Picture URL (with current URL or empty)
- LinkedIn URL (with current URL or empty)
- GitHub URL (with current URL or empty)
- Portfolio URL (with current URL or empty)

**AC4**: Form validation:
- Username: 3-50 characters, alphanumeric + underscore/hyphen (inline error on blur)
- Bio: Max 500 characters with counter (inline error at 501)
- URLs: Valid URL format (inline error on blur if invalid)
- All fields show validation state (error text in red below field)

**AC5**: Sheet footer contains:
- "Cancel" button (secondary style) - closes sheet without saving
- "Save Changes" button (primary style) - submits form

**AC6**: If user modifies any field and attempts to close sheet (X button or backdrop click), show inline confirmation: "You have unsaved changes. Are you sure you want to close?" with "Discard Changes" / "Keep Editing" options.

**AC7**: Form submission (clicking "Save Changes"):
- Validates all fields client-side
- If validation fails: Shows inline errors, keeps sheet open
- If validation passes: Proceeds to username check (Story 1.6) or saves immediately if username unchanged

#### Integration Verification

**IV1**: Verify sheet uses existing `useProfile().updateProfile()` method for optimistic updates.

**IV2**: Verify form validation uses shared Zod schemas (`profileSchemas.updateForm`) from `@monolenz/types/validation`.

**IV3**: Verify sheet accessibility (keyboard navigation, focus trap, ARIA labels) follows Radix UI defaults.

**IV4**: Verify sheet overlay does not interfere with existing dashboard header/navigation.

**IV5**: Verify mobile responsiveness - sheet is usable on 320px width screens.

---

### Story 1.6: Username Change Confirmation Dialog

**As a** user attempting to change my username,  
**I want** to see a warning about the implications,  
**so that** I can make an informed decision before proceeding.

#### Acceptance Criteria

**AC1**: When user changes username in edit form and clicks "Save Changes", the system:
- Detects username has changed (compares to original profile.username)
- If unchanged: Proceeds directly to save (optimistic update + API call)
- If changed: Shows `UsernameChangeDialog` (Radix UI AlertDialog) before saving

**AC2**: `UsernameChangeDialog` displays:
- Warning icon (⚠️ or similar)
- Title: "Confirm Username Change"
- Message: "Changing your username from '[old_username]' to '[new_username]' may affect your profile URL and how others find you. This action cannot be easily undone. Are you sure you want to continue?"
- Two buttons:
  - "Cancel" (secondary style) - closes dialog, returns to edit form
  - "Yes, Change Username" (primary style, slightly warning color) - proceeds with save

**AC3**: Clicking "Yes, Change Username":
- Closes confirmation dialog
- Closes edit sheet
- Performs optimistic update (updates UI immediately with new username)
- Calls `PUT /api/v1/profiles/me` with updated data
- On success: Shows success toast "Profile updated successfully!"
- On error (409 - username taken): Rolls back UI, shows error toast "Username '[new_username]' is already taken. Please choose another.", reopens edit sheet
- On error (other): Rolls back UI, shows error toast with retry option

**AC4**: Clicking "Cancel" in dialog:
- Closes dialog
- Returns focus to edit form (still open)
- Username field remains editable

**AC5**: Dialog can be dismissed with ESC key (same as clicking "Cancel").

#### Integration Verification

**IV1**: Verify optimistic update uses existing `useProfile().updateProfile()` rollback mechanism on error.

**IV2**: Verify username conflict (409) error reopens edit sheet with error message clearly visible near username field.

**IV3**: Verify dialog does not appear if username is unchanged (even if other fields are modified).

**IV4**: Verify dialog follows existing Radix UI AlertDialog patterns (focus management, dismissal behavior).

**IV5**: Verify "Yes, Change Username" button styling provides subtle visual warning (border color or slight red tint) without being overly alarming.

---

### Story 1.7: Error Handling & Edge Cases

**As a** user interacting with the profile system,  
**I want** clear, actionable error messages for all failure scenarios,  
**so that** I understand what went wrong and how to resolve it.

#### Acceptance Criteria

**AC1 - Network Errors**: When any API call fails due to network issues:
- Show toast notification: "Network error. Please check your connection."
- Provide "Retry" button in toast that re-attempts the failed operation
- Maintain existing UI state (don't clear forms or lose data)

**AC2 - Authentication Errors (401)**: When API returns 401 Unauthorized:
- If error message is "Email not confirmed": Show toast "Please confirm your email address to access your profile" (stay on page)
- If error message is "Invalid or expired token": Redirect to `/login` with message "Your session has expired. Please log in again."

**AC3 - Validation Errors (422)**: When API returns 422 Unprocessable Entity:
- Parse `errors` array from response
- Display field-specific errors inline (red text below each affected field)
- If in onboarding wizard: Highlight and navigate to step containing error
- If in edit form: Keep sheet open with errors visible
- Show toast: "Please correct the errors and try again"

**AC4 - Conflict Errors (409)**: When API returns 409 Conflict (username taken):
- Show toast: "Username '[username]' is already taken. Please choose another."
- If in onboarding wizard: Navigate back to Step 1 with username field focused
- If in edit form: Reopen edit sheet with username field focused and error displayed

**AC5 - Server Errors (500)**: When API returns 500 Internal Server Error:
- Show toast: "Something went wrong on our end. Please try again later."
- Provide "Retry" button in toast
- Log error to console for debugging

**AC6 - Empty Profile State**: When profile exists but all optional fields are empty:
- Display profile with placeholders ("No bio added", default avatar)
- Show completeness at minimum (16.67% for username only)
- Display encouraging message: "Complete your profile to stand out! Add a bio and profile picture."

**AC7 - Partial Form Submission**: When user starts onboarding, navigates away, then returns:
- Wizard state is reset (don't persist across sessions)
- User starts fresh from Step 1
- (Optional future enhancement: Save wizard progress to localStorage)

#### Integration Verification

**IV1**: Verify all error toasts use existing Sonner configuration and auto-dismiss after 4 seconds (except those with action buttons).

**IV2**: Verify error messages match backend API error messages for consistency.

**IV3**: Verify optimistic update rollback works correctly for all error types (UI reverts to previous state).

**IV4**: Verify console.error logs include sufficient context for debugging (API endpoint, request data, error response).

**IV5**: Verify form state (wizard or edit form) is preserved during error handling (user doesn't lose entered data).

---

### Story 1.8: Mobile Responsiveness & Accessibility

**As a** user on mobile or using assistive technology,  
**I want** the profile system to work seamlessly on my device,  
**so that** I can manage my profile regardless of how I access Athaar.

#### Acceptance Criteria

**AC1 - Mobile Onboarding Wizard (320px - 768px)**:
- All wizard steps display correctly on 320px width (smallest mobile)
- Input fields have minimum 44px touch target height
- Text is readable without zooming (minimum 16px font size)
- "Next" / "Back" buttons are full-width or prominently sized on mobile
- Progress indicator is visible and doesn't overlap content
- Step navigation works with touch gestures

**AC2 - Mobile Edit Sheet**:
- Sheet slides from bottom (not right) on screens ≤768px
- Sheet height is appropriate (70-90% viewport height)
- Form fields are stacked vertically with adequate spacing
- "Save Changes" / "Cancel" buttons are full-width on mobile
- Keyboard pushes sheet up (doesn't hide inputs)

**AC3 - Mobile Profile View**:
- Profile card layout stacks vertically on mobile (avatar → username → bio → links)
- Social link buttons are touch-friendly (minimum 44x44px)
- "Edit Profile" button is prominent and easily tappable
- Completeness indicator is visible without horizontal scroll

**AC4 - Keyboard Navigation**:
- Tab order follows logical flow (Step 1 field → Next button → ...)
- All interactive elements focusable via keyboard
- Focus visible indicators (outline or ring) on all inputs/buttons
- Enter key submits forms (in wizard steps and edit sheet)
- ESC key closes modals/sheets

**AC5 - Screen Reader Accessibility**:
- All form inputs have associated labels (visible or aria-label)
- Error messages associated with inputs via aria-describedby
- Progress indicator announces step (aria-live region): "Step 2 of 4"
- Loading states announce: "Saving profile..." (aria-live="polite")
- Success/error toasts are announced to screen readers

**AC6 - Color Contrast**:
- All text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- Error states use both color AND icon (not color alone)
- Links/buttons have sufficient contrast in all states (default, hover, focus, disabled)

**AC7 - Responsive Breakpoints**:
- Mobile: 320px - 767px (single column, bottom sheets)
- Tablet: 768px - 1023px (partial two-column, side sheets)
- Desktop: 1024px+ (full layout, side sheets)

#### Integration Verification

**IV1**: Verify mobile responsiveness tested on:
- iPhone SE (375px width)
- Android (360px width)
- Tablet (768px width)

**IV2**: Verify keyboard navigation tested with Tab, Shift+Tab, Enter, ESC keys for all flows.

**IV3**: Verify screen reader compatibility tested with at least one tool (NVDA, JAWS, or VoiceOver).

**IV4**: Verify color contrast using automated tool (e.g., axe DevTools, Lighthouse).

**IV5**: Verify existing Radix UI components maintain accessibility defaults (focus trapping, ARIA attributes).

---

## Epic Summary

**Total Stories**: 8  
**Estimated Sequence**: 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7 → 1.8

**Dependencies**:
- Stories 1.1-1.3 (onboarding) must complete before 1.4 (profile view)
- Story 1.4 must complete before 1.5 (edit form)
- Story 1.5 must complete before 1.6 (username confirmation)
- Story 1.7 (error handling) spans all stories (implement incrementally)
- Story 1.8 (mobile/a11y) can be developed alongside or after core stories

**Rollback Strategy**: Each story can be individually rolled back without affecting others (feature flags not required due to single-page scope).

---

## Appendix

### Key References

- **Architecture Document**: `docs/profile-integration-architecture.md` (Winston, 2025-10-07)
- **Backend API**: Fully implemented, no changes required
- **Shared Types Package**: `@monolenz/types` (Zod validation schemas)
- **Existing Hook**: `apps/web/lib/hooks/useProfile.ts` (optimistic updates)

### Development Notes

- **Component Deletion**: Old placeholder components (`ProfileHeader`, `ProfileAvatar`, `ProfileBasicInfo`, `ProfileCompleteness`) will be deleted AFTER new components are fully tested (Story 1.4 completion)
- **API Base URL**: Configured via `NEXT_PUBLIC_API_URL` environment variable
- **Authentication**: Automatic via Supabase client + `createBrowserApiClient()` wrapper
- **Validation**: Shared Zod schemas ensure consistency between frontend and backend

---

**END OF PRD**

