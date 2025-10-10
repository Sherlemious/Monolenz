# Technical Constraints

## Backend Constraints

### 1. Profile-User Relationship

**Constraint**: Profile `id` MUST match `auth.users.id` (1-to-1)

**Enforcement**:
```typescript
// In ProfileService.applyBusinessRules()
if (operation === 'create' && context?.userId) {
  processedData.id = context.userId;  // Force profile ID = user ID
}
```

**Implication**: Cannot create profile for another user

---

### 2. Username Uniqueness

**Constraint**: Usernames are globally unique (database constraint)

**Enforcement**:
- Database: `UNIQUE` constraint on `profiles.username`
- Service: Pre-check before update
- API: Returns 409 Conflict if username taken

**Code**:
```typescript
if (data.username) {
  const isAvailable = await this.profileRepository.checkUsernameAvailability(
    data.username,
    id  // Exclude current user
  );
  if (!isAvailable) {
    throw new ServiceError('Username is already taken', null, HTTP_STATUS_CODES.CONFLICT);
  }
}
```

---

### 3. Email Confirmation Required

**Constraint**: Users must confirm email before accessing protected routes

**Enforcement**: In auth middleware

```typescript
if (!user.email_confirmed_at) {
  return res.status(HTTP_STATUS_CODES.UNAUTHORIZED).json({
    success: false,
    message: 'Email not confirmed',
    errors: [{ field: 'email', message: 'Please confirm your email address' }],
  });
}
```

**Implication**: Show "Confirm your email" message if 401 with this error

---

### 4. Soft Delete Behavior

**Constraint**: DELETE operations don't remove data, just mark as deleted

**Implementation**:
```typescript
await profileService.delete(req.userId!, context, { soft: true });
```

**Note**: Soft delete logic not shown in provided code but mentioned in delete call

---

### 5. Privacy Filters

**Constraint**: Non-owners see limited profile data

**Implementation** (in ProfileService):
```typescript
private async applyPrivacyFilters(profile: ProfileEntity, context?: ServiceContext) {
  const isOwner = context?.userId === profile.id;
  const isAdmin = context?.userRole === 'admin';

  if (isOwner || isAdmin) {
    return profile;  // Full profile
  }

  // Public view - filter sensitive fields
  return {
    id: profile.id,
    username: profile.username,
    bio: profile.bio,
    profile_picture_url: profile.profile_picture_url,
    portfolio_url: profile.portfolio_url,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
    // linkedin_url and github_url are hidden
  };
}
```

**Fields Hidden for Public**:
- `linkedin_url`
- `github_url`
- `profile_links` (if not public)

---

## Frontend Constraints

### 1. Environment Variables Required

**Critical**: These MUST be set or app won't work

```bash
# .env.local (frontend)
NEXT_PUBLIC_SUPABASE_URL=<required>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<required>
NEXT_PUBLIC_API_URL=<optional, defaults to http://localhost:4000>
```

**Validation**: Add startup check

```typescript
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

---

### 2. Client-Side Only Components

**Constraint**: Profile page uses client-side hooks (`'use client'`)

**Implication**: 
- Cannot use server-side features in this page
- SEO considerations for profile pages
- Initial load requires API roundtrip

**Consideration**: Implement server-side rendering for public profiles later

---

### 3. CORS Configuration

**Constraint**: API must allow frontend origin

**Backend Configuration** (likely in `apps/api/src/app.ts`):

```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
```

**Frontend URLs**:
- Development: `http://localhost:3000`
- Production: Set `FRONTEND_URL` env var

---

## Known Issues / Technical Debt

### 1. Missing Profile Creation Flow

**Issue**: No UI for creating profile if it doesn't exist

**Current Behavior**: Shows error if profile not found

**Required**: Implement empty state with "Create Profile" form

**Story**: Should be part of PROF-001 or separate story

---

### 2. No Profile Edit Form

**Issue**: Placeholder in code, not implemented

**Location**: `apps/web/app/(app)/profile/page.tsx` line 67-69

```typescript
{isEditingProfile && (
  <div>Edit profile sheet will go here (PROF-002)</div>
)}
```

**Required**: 
- Edit form component
- Sheet/modal UI
- Form validation
- Submit handling

**Story**: PROF-002 (referenced in code)

---

### 3. No Image Upload

**Issue**: Profile picture URL is text field, no upload capability

**Current Workaround**: Users must provide external image URL

**Future Enhancement**: 
- Add file upload to Supabase Storage
- Generate signed URLs
- Image optimization/resizing

---

### 4. No Username Change Confirmation

**Issue**: Username changes are instant, no confirmation step

**Risk**: Accidental changes, SEO impact (if URLs use username)

**Recommendation**: Add confirmation dialog for username changes

---

### 5. No Rate Limiting Shown

**Note**: Rate limiting likely implemented in API but not documented

**Check**: Look for `express-rate-limit` usage in API code

---

