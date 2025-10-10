# Quick Reference - Key Files

## Backend Profile Stack

| Purpose | File Path | Notes |
|---------|-----------|-------|
| **API Routes** | `apps/api/src/routes/v1/profiles.ts/profiles.ts` | All profile endpoints defined here |
| **Controller** | `apps/api/src/controllers/profile.ts` | HTTP request handling |
| **Service Layer** | `apps/api/src/services/domain/profile.service.ts` | Business logic & validation |
| **Repository** | `apps/api/src/repositories/profile/profile.ts` | Database operations |
| **Validation Schemas** | `packages/types/src/validation/profile-schemas.ts` | Shared Zod schemas |
| **Entity Types** | `packages/types/src/entities/user.ts` | Profile type definitions |
| **Database Schema** | `apps/api/prisma/schema.prisma` | Prisma models (line 399-415) |
| **Auth Middleware** | `apps/api/src/middleware/auth.ts` | Supabase JWT authentication |

## Frontend Profile Stack

| Purpose | File Path | Notes |
|---------|-----------|-------|
| **Profile Page** | `apps/web/app/(app)/profile/page.tsx` | Main profile page component |
| **API Client** | `apps/web/lib/api/profile.ts` | Profile API methods |
| **API Common** | `apps/web/lib/api/common.ts` | Base API client with auth |
| **useProfile Hook** | `apps/web/lib/hooks/useProfile.ts` | Profile state management |
| **Types** | `apps/web/lib/types/profile.ts` | Frontend type definitions |
| **Supabase Client** | `apps/web/utils/supabase/client.ts` | Supabase auth client |

## UI Components

| Component | File Path | Purpose |
|-----------|-----------|---------|
| **ProfileHeader** | `apps/web/components/profile/ProfileHeader.tsx` | Avatar, basic info, completeness |
| **ProfileAvatar** | `apps/web/components/profile/ProfileAvatar.tsx` | User avatar display |
| **ProfileBasicInfo** | `apps/web/components/profile/ProfileBasicInfo.tsx` | Username, bio display |
| **ProfileCompleteness** | `apps/web/components/profile/ProfileCompleteness.tsx` | Progress indicator |
| **ProfileSkeleton** | `apps/web/components/profile/ProfileSkeleton.tsx` | Loading state |

---

