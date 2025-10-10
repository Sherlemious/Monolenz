# 4. Technical Constraints and Integration Requirements

## 4.1 Existing Technology Stack

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

## 4.2 Integration Approach

### 4.2.1 Database Integration Strategy

**Constraint**: NO database changes required or allowed.

**Integration Approach**:
- Profiles table already exists in `public` schema with all required columns
- Profile `id` is foreign key to `auth.users.id` (1-to-1 relationship enforced by backend)
- Username has UNIQUE constraint (enforced at database level)
- All URL fields limited to 500 characters (enforced at database level)
- Frontend must handle constraint violation errors gracefully (409 Conflict for duplicate username)

**No migrations needed** - table structure is final for this enhancement.

---

### 4.2.2 API Integration Strategy

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

### 4.2.3 Frontend Integration Strategy

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

## 4.3 Code Organization and Standards

### 4.3.1 File Structure Approach

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

### 4.3.2 Coding Standards

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

## 4.4 Deployment and Operations

### 4.4.1 Build Process Integration

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

### 4.4.2 Deployment Strategy

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

### 4.4.3 Monitoring and Logging

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

## 4.5 Risk Assessment and Mitigation

### 4.5.1 Technical Risks

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

### 4.5.2 Integration Risks

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

### 4.5.3 Deployment Risks

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

### 4.5.4 Mitigation Strategies Summary

| Risk Category | Strategy |
|--------------|----------|
| **Technical** | Thorough testing, shared schema validation, error handling with rollback |
| **Integration** | API contract stability, token refresh automation, CORS verification |
| **Deployment** | Environment variable checklist, staging environment testing, cache busting |
| **User Experience** | Clear error messages, form progress saving (future), retry mechanisms |

---

