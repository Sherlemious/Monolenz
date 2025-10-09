# Athaar Profile Integration - Brownfield Architecture Document

## Document Information

**Project**: Athaar - Profile UI Integration  
**Type**: Brownfield Enhancement  
**Focus**: Profile Management CRUD Operations  
**Version**: 1.0  
**Date**: October 7, 2025  
**Architect**: Winston

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-10-07 | 1.0 | Initial brownfield profile architecture analysis | Winston |

---

## Executive Summary

This document captures the **CURRENT STATE** of the Athaar profile system for implementing a complete profile management UI. The backend API is **fully implemented and tested**. This document focuses exclusively on **profile-related components** to enable frontend integration.

### Critical Integration Points

⚠️ **IMPORTANT**: Profiles may be **NULL** on first user visit. The UI must handle:
1. No profile exists (null state)
2. Empty profile (created but no data)
3. Partial profile (some fields filled)
4. Complete profile (all fields filled)

---

## Table of Contents

1. [Quick Reference - Key Files](#quick-reference---key-files)
2. [High-Level Architecture](#high-level-architecture)
3. [API Specifications](#api-specifications)
4. [Data Models & Validation](#data-models--validation)
5. [Authentication Flow](#authentication-flow)
6. [Frontend Components](#frontend-components)
7. [Integration Patterns](#integration-patterns)
8. [Technical Constraints](#technical-constraints)
9. [Development Setup](#development-setup)
10. [Testing & Deployment](#testing--deployment)

---

## Quick Reference - Key Files

### Backend Profile Stack

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

### Frontend Profile Stack

| Purpose | File Path | Notes |
|---------|-----------|-------|
| **Profile Page** | `apps/web/app/(app)/profile/page.tsx` | Main profile page component |
| **API Client** | `apps/web/lib/api/profile.ts` | Profile API methods |
| **API Common** | `apps/web/lib/api/common.ts` | Base API client with auth |
| **useProfile Hook** | `apps/web/lib/hooks/useProfile.ts` | Profile state management |
| **Types** | `apps/web/lib/types/profile.ts` | Frontend type definitions |
| **Supabase Client** | `apps/web/utils/supabase/client.ts` | Supabase auth client |

### UI Components

| Component | File Path | Purpose |
|-----------|-----------|---------|
| **ProfileHeader** | `apps/web/components/profile/ProfileHeader.tsx` | Avatar, basic info, completeness |
| **ProfileAvatar** | `apps/web/components/profile/ProfileAvatar.tsx` | User avatar display |
| **ProfileBasicInfo** | `apps/web/components/profile/ProfileBasicInfo.tsx` | Username, bio display |
| **ProfileCompleteness** | `apps/web/components/profile/ProfileCompleteness.tsx` | Progress indicator |
| **ProfileSkeleton** | `apps/web/components/profile/ProfileSkeleton.tsx` | Loading state |

---

## High-Level Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Frontend                        │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │  Profile Page  │→ │  useProfile  │→ │  profileApi     │ │
│  │  (page.tsx)    │  │  Hook        │  │  Client         │ │
│  └────────────────┘  └──────────────┘  └─────────────────┘ │
│                                               ↓              │
│                                    ┌─────────────────────┐  │
│                                    │ Supabase Client     │  │
│                                    │ (JWT Token)         │  │
│                                    └─────────────────────┘  │
└───────────────────────────────────────────┼─────────────────┘
                                            │
                                     HTTP + Bearer Token
                                            │
┌───────────────────────────────────────────▼─────────────────┐
│                    Express.js API Server                     │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │   Auth     │→ │  Controller  │→ │     Service        │  │
│  │ Middleware │  │ (HTTP Layer) │  │ (Business Logic)   │  │
│  └────────────┘  └──────────────┘  └────────────────────┘  │
│                                               ↓              │
│                                    ┌────────────────────┐   │
│                                    │   Repository       │   │
│                                    │ (Database Access)  │   │
│                                    └────────────────────┘   │
└───────────────────────────────────────────┼─────────────────┘
                                            │
                                      Prisma ORM
                                            │
┌───────────────────────────────────────────▼─────────────────┐
│              PostgreSQL (Supabase Hosted)                    │
│                                                               │
│  auth.users (Supabase managed)  ←→  public.profiles         │
└───────────────────────────────────────────────────────────────┘
```

### Technology Stack (Actual)

| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
| **Frontend Runtime** | Next.js | 15.4.2 | App Router, Server Components |
| **Frontend Library** | React | 19.1.0 | Client components for profile |
| **UI Framework** | Radix UI + Tailwind | 4.1.11 | Component primitives |
| **State Management** | React Hooks | Native | useProfile, useEffect |
| **Backend Runtime** | Node.js + Express | 4.18.2 | REST API server |
| **Database** | PostgreSQL | (Supabase) | Multi-schema (auth, public) |
| **ORM** | Prisma | 6.12.0 | Type-safe DB client |
| **Authentication** | Supabase Auth | 2.52.1 | JWT-based, managed service |
| **Validation** | Zod | 3.22.4 | Shared schemas (FE + BE) |
| **Package Manager** | pnpm | Latest | Monorepo workspace |

### Repository Structure

```
Athaar/ (Monorepo Root)
├── apps/
│   ├── api/                          # Express API Server
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   │   └── profile.ts        # Profile HTTP handlers
│   │   │   ├── services/
│   │   │   │   └── domain/
│   │   │   │       └── profile.service.ts  # Business logic
│   │   │   ├── repositories/
│   │   │   │   └── profile/
│   │   │   │       └── profile.ts    # Database queries
│   │   │   ├── middleware/
│   │   │   │   └── auth.ts           # JWT validation
│   │   │   ├── routes/
│   │   │   │   └── v1/
│   │   │   │       └── profiles.ts/
│   │   │   │           └── profiles.ts  # Route definitions
│   │   │   └── config/
│   │   │       └── supabase.ts       # Supabase admin client
│   │   └── prisma/
│   │       └── schema.prisma         # Database schema
│   │
│   └── web/                          # Next.js Frontend
│       ├── app/
│       │   └── (app)/
│       │       └── profile/
│       │           └── page.tsx      # Profile page
│       ├── components/
│       │   └── profile/              # Profile UI components
│       │       ├── ProfileHeader.tsx
│       │       ├── ProfileAvatar.tsx
│       │       ├── ProfileBasicInfo.tsx
│       │       ├── ProfileCompleteness.tsx
│       │       └── ProfileSkeleton.tsx
│       ├── lib/
│       │   ├── api/
│       │   │   ├── client.ts         # API client factory
│       │   │   ├── common.ts         # Base HTTP client
│       │   │   └── profile.ts        # Profile API methods
│       │   ├── hooks/
│       │   │   └── useProfile.ts     # Profile state hook
│       │   └── types/
│       │       └── profile.ts        # Frontend types
│       └── utils/
│           └── supabase/
│               └── client.ts         # Supabase browser client
│
└── packages/
    └── types/                        # Shared Types Package
        └── src/
            ├── entities/
            │   └── user.ts           # Profile entity types
            └── validation/
                └── profile-schemas.ts # Zod validation schemas
```

---

## API Specifications

### Base Configuration

**API Base URL**: `process.env.NEXT_PUBLIC_API_URL` (default: `http://localhost:4000`)  
**API Version**: v1  
**Authentication**: Bearer token (Supabase JWT)

### Standard Response Format

All API responses follow this structure:

```typescript
{
  "success": boolean,
  "message": string,
  "data": T,                    // Response payload
  "meta": {
    "timestamp": string,        // ISO 8601
    "requestId": string,        // UUID
    "version": string           // API version
  }
}
```

### Error Response Format

```typescript
{
  "success": false,
  "message": string,
  "errors": [
    {
      "field": string,
      "message": string
    }
  ]
}
```

---

### Profile API Endpoints

#### 1. Get Current User's Profile

**Endpoint**: `GET /api/v1/profiles/me`  
**Authentication**: Required (Bearer token)  
**Purpose**: Retrieve authenticated user's profile

**Request Headers**:
```
Authorization: Bearer <supabase_jwt_token>
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "5846fa80-579f-40f0-aab7-d7fc4184b822",
    "username": "sherlemious",
    "bio": "medhat saleh is a cool dude ngl",
    "profile_picture_url": "https://www.duenduejdu.com/jdueduu",
    "linkedin_url": "https://www.linkedin.com/sherlemious",
    "github_url": "https://www.github.com/sherlemious",
    "portfolio_url": "https://www.sherlemious.com",
    "created_at": "2025-07-29T19:06:10.993Z",
    "updated_at": "2025-09-04T16:44:08.940Z"
  },
  "meta": {
    "timestamp": "2025-09-04T16:55:02.758Z",
    "requestId": "bf3d0527-01ce-477c-a988-3118d4990e18",
    "version": "1.0.0"
  }
}
```

**Error Response - Not Found** (404):
```json
{
  "success": false,
  "message": "Profile not found",
  "errors": []
}
```

**Error Response - Unauthorized** (401):
```json
{
  "success": false,
  "message": "Authentication required",
  "errors": [
    {
      "field": "authorization",
      "message": "Bearer token required"
    }
  ]
}
```

⚠️ **CRITICAL NOTE**: This endpoint may return 404 if:
- User just signed up and hasn't created a profile yet
- Profile was soft-deleted
- Frontend MUST handle null/404 state gracefully

---

#### 2. Update Current User's Profile

**Endpoint**: `PUT /api/v1/profiles/me`  
**Authentication**: Required (Bearer token)  
**Purpose**: Update authenticated user's profile (partial updates supported)

**Request Headers**:
```
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json
```

**Request Body** (all fields optional):
```json
{
  "username": "sherlemious",
  "bio": "medhat saleh is a cool dude ngl",
  "profile_picture_url": "https://www.duenduejdu.com/jdueduu",
  "linkedin_url": "https://www.linkedin.com/sherlemious",
  "github_url": "https://www.github.com/sherlemious",
  "portfolio_url": "https://www.sherlemious.com"
}
```

**Validation Rules**:
- `username`: 3-50 characters, alphanumeric + underscore/hyphen only
- `bio`: Max 500 characters
- `profile_picture_url`: Valid URL format
- `linkedin_url`: Valid URL format
- `github_url`: Valid URL format
- `portfolio_url`: Valid URL format
- Empty strings are converted to `null`

**Success Response** (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "5846fa80-579f-40f0-aab7-d7fc4184b822",
    "username": "sherlemious",
    "bio": "medhat saleh is a cool dude ngl",
    "profile_picture_url": "https://www.duenduejdu.com/jdueduu",
    "linkedin_url": "https://www.linkedin.com/sherlemious",
    "github_url": "https://www.github.com/sherlemious",
    "portfolio_url": "https://www.sherlemious.com",
    "created_at": "2025-07-29T19:06:10.993Z",
    "updated_at": "2025-09-04T16:44:08.940Z"
  },
  "meta": {
    "timestamp": "2025-09-04T16:55:02.758Z",
    "requestId": "bf3d0527-01ce-477c-a988-3118d4990e18",
    "version": "1.0.0"
  }
}
```

**Error Response - Validation** (422):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "username",
      "message": "Username must be at least 3 characters"
    }
  ]
}
```

**Error Response - Username Conflict** (409):
```json
{
  "success": false,
  "message": "Username is already taken",
  "errors": []
}
```

---

#### 3. Create Profile

**Endpoint**: `POST /api/v1/profiles`  
**Authentication**: Required (Bearer token)  
**Purpose**: Create initial profile for authenticated user

**Request Body** (username required, others optional):
```json
{
  "username": "newuser123",
  "bio": "Optional bio",
  "profile_picture_url": "https://example.com/avatar.jpg",
  "linkedin_url": "https://linkedin.com/in/newuser",
  "github_url": "https://github.com/newuser",
  "portfolio_url": "https://newuser.dev"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "id": "5846fa80-579f-40f0-aab7-d7fc4184b822",
    "username": "newuser123",
    "bio": "Optional bio",
    "profile_picture_url": "https://example.com/avatar.jpg",
    "linkedin_url": "https://linkedin.com/in/newuser",
    "github_url": "https://github.com/newuser",
    "portfolio_url": "https://newuser.dev",
    "created_at": "2025-10-07T12:00:00.000Z",
    "updated_at": "2025-10-07T12:00:00.000Z"
  },
  "meta": {
    "timestamp": "2025-10-07T12:00:00.000Z",
    "requestId": "uuid-here",
    "version": "1.0.0"
  }
}
```

---

#### 4. Delete Profile

**Endpoint**: `DELETE /api/v1/profiles/me`  
**Authentication**: Required (Bearer token)  
**Purpose**: Soft delete authenticated user's profile

⚠️ **NOTE**: This is a **soft delete** - profile is not physically removed from database

**Success Response** (200):
```json
{
  "success": true,
  "message": "Profile deleted successfully",
  "data": null,
  "meta": {
    "timestamp": "2025-10-07T12:00:00.000Z",
    "requestId": "uuid-here",
    "version": "1.0.0"
  }
}
```

---

#### 5. Check Username Availability

**Endpoint**: `GET /api/v1/profiles/username/:username/availability`  
**Authentication**: Optional (better UX if authenticated)  
**Purpose**: Check if username is available before creation/update

**Example**: `GET /api/v1/profiles/username/testuser/availability`

**Success Response** (200):
```json
{
  "success": true,
  "message": "Username is available",
  "data": {
    "username": "testuser",
    "available": true
  },
  "meta": {
    "timestamp": "2025-10-07T12:00:00.000Z",
    "requestId": "uuid-here",
    "version": "1.0.0"
  }
}
```

---

#### 6. Get Profile by Identifier

**Endpoint**: `GET /api/v1/profiles/:identifier`  
**Authentication**: Optional (shows limited data if not authenticated)  
**Purpose**: Get any user's profile by username or ID

**Query Parameters**:
- `include_links`: "true" | "false" (default: false)

**Example**: `GET /api/v1/profiles/sherlemious?include_links=true`

**Success Response** (200): Same format as "Get My Profile"

⚠️ **Privacy Filters**: 
- If not authenticated or not owner: Only shows public fields (username, bio, portfolio_url, profile_picture_url)
- linkedin_url and github_url are hidden for non-owners

---

#### 7. Search Profiles

**Endpoint**: `GET /api/v1/profiles/search`  
**Authentication**: Optional  
**Purpose**: Search profiles by username or bio

**Query Parameters**:
- `search` or `query`: Search term
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)
- `sort`: Sort field (default: created_at)
- `order`: "asc" | "desc" (default: desc)

**Example**: `GET /api/v1/profiles/search?query=developer&limit=20`

**Success Response** (200):
```json
{
  "success": true,
  "message": "Profiles retrieved successfully",
  "data": [
    { /* profile object */ },
    { /* profile object */ }
  ],
  "meta": {
    "timestamp": "2025-10-07T12:00:00.000Z",
    "requestId": "uuid-here",
    "version": "1.0.0",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42
    }
  }
}
```

---

## Data Models & Validation

### Database Schema (Prisma)

**Location**: `apps/api/prisma/schema.prisma` (lines 399-415)

```prisma
model profiles {
  id                  String          @id @db.Uuid
  username            String          @unique @db.VarChar(50)
  bio                 String?
  profile_picture_url String?         @db.VarChar(500)
  linkedin_url        String?         @db.VarChar(500)
  github_url          String?         @db.VarChar(500)
  portfolio_url       String?         @db.VarChar(500)
  created_at          DateTime?       @default(now()) @db.Timestamptz(6)
  updated_at          DateTime?       @default(now()) @db.Timestamptz(6)
  profile_links       profile_links[]
  users               users           @relation(fields: [id], references: [id], onDelete: NoAction, onUpdate: NoAction)
  versions            versions[]

  @@index([username], map: "idx_profiles_username")
  @@schema("public")
}
```

**Key Constraints**:
- `id` is a foreign key to `auth.users.id` (1-to-1 relationship)
- `username` must be unique across all profiles
- `username` indexed for fast lookups
- All URL fields limited to 500 characters

---

### TypeScript Type Definitions

#### Backend Entity (Source of Truth)

**Location**: `packages/types/src/entities/user.ts`

```typescript
export interface Profile {
  id: string;
  username: string;
  bio?: string;
  profile_picture_url?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PublicProfile {
  username: string;
  bio?: string;
  portfolio_url?: string;
  profile_picture_url?: string;
}
```

#### Frontend Types

**Location**: `apps/web/lib/types/profile.ts`

```typescript
export interface BasicProfile {
  id: string;
  username: string;
  bio?: string;
  profile_picture_url?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  created_at: string;  // ISO 8601 string (API format)
  updated_at: string;  // ISO 8601 string (API format)
}

export interface BasicProfileUpdate {
  username?: string;
  bio?: string;
  profile_picture_url?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
}

export interface UsernameAvailability {
  username: string;
  available: boolean;
}
```

---

### Validation Schemas (Zod)

**Location**: `packages/types/src/validation/profile-schemas.ts`

These schemas are **shared between frontend and backend** for consistent validation:

```typescript
import { z } from 'zod';

export const profileDataSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  profile_picture_url: z
    .string()
    .url('Invalid profile picture URL')
    .optional(),
  linkedin_url: z
    .string()
    .url('Invalid LinkedIn URL')
    .optional(),
  github_url: z
    .string()
    .url('Invalid GitHub URL')
    .optional(),
  portfolio_url: z
    .string()
    .url('Invalid portfolio URL')
    .optional(),
});

export const profileSchemas = {
  // For creating a new profile (username required)
  create: profileDataSchema.required({
    username: true,
  }),

  // For updating a profile (all fields optional)
  update: profileDataSchema.partial(),

  // For frontend forms (empty strings → undefined)
  createForm: profileDataSchema.extend({
    bio: z.string().transform((val) => val.trim() || undefined).optional(),
    profile_picture_url: z.string().transform((val) => val.trim() || undefined).optional(),
    linkedin_url: z.string().transform((val) => val.trim() || undefined).optional(),
    github_url: z.string().transform((val) => val.trim() || undefined).optional(),
    portfolio_url: z.string().transform((val) => val.trim() || undefined).optional(),
  }).required({ username: true }),

  updateForm: profileDataSchema.extend({
    bio: z.string().transform((val) => val.trim() || undefined).optional(),
    profile_picture_url: z.string().transform((val) => val.trim() || undefined).optional(),
    linkedin_url: z.string().transform((val) => val.trim() || undefined).optional(),
    github_url: z.string().transform((val) => val.trim() || undefined).optional(),
    portfolio_url: z.string().transform((val) => val.trim() || undefined).optional(),
  }).partial(),
};
```

**Validation Rules Summary**:

| Field | Required | Min | Max | Format |
|-------|----------|-----|-----|--------|
| username | Yes (create) | 3 | 50 | `/^[a-zA-Z0-9_-]+$/` |
| bio | No | - | 500 | Any string |
| profile_picture_url | No | - | - | Valid URL |
| linkedin_url | No | - | - | Valid URL |
| github_url | No | - | - | Valid URL |
| portfolio_url | No | - | - | Valid URL |

---

## Authentication Flow

### Overview

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. User logs in
       ↓
┌─────────────────────┐
│  Supabase Auth      │
│  (Managed Service)  │
└─────────┬───────────┘
          │ 2. Returns JWT token
          ↓
┌─────────────────────┐
│   Frontend          │
│   Stores session    │
└─────────┬───────────┘
          │ 3. API request with Bearer token
          ↓
┌─────────────────────────────────────┐
│   API: Auth Middleware              │
│   - Extract token from header       │
│   - Validate with Supabase          │
│   - Attach userId to request        │
└─────────┬───────────────────────────┘
          │ 4. Authenticated request
          ↓
┌─────────────────────────────────────┐
│   Profile Controller                │
│   - Access req.userId               │
│   - Process request                 │
└─────────────────────────────────────┘
```

### Authentication Implementation

#### Frontend: Token Retrieval

**Location**: `apps/web/lib/api/client.ts`

```typescript
import { createClient as createSupabaseBrowserClient } from '@/utils/supabase/client';
import { createApiClientWithTokenProvider } from './common';

export function createBrowserApiClient(baseInit?: RequestInit) {
  const supabase = createSupabaseBrowserClient();
  return createApiClientWithTokenProvider(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token;
  }, baseInit);
}
```

**Process**:
1. Supabase client retrieves current session
2. Extracts `access_token` (JWT)
3. Automatically added to all API requests as `Authorization: Bearer <token>`

---

#### Backend: Token Validation

**Location**: `apps/api/src/middleware/auth.ts`

```typescript
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      errors: [{ field: 'authorization', message: 'Bearer token required' }],
    });
  }

  const token = authHeader.substring(7); // Remove "Bearer "
  
  // Verify with Supabase
  const {
    data: { user },
    error,
  } = await supabaseAuth.auth.getUser(token);

  if (error || !user || !user.email_confirmed_at) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      errors: [{ field: 'authorization', message: 'Invalid token' }],
    });
  }

  // Attach user info to request
  req.user = user;
  req.userId = user.id;
  req.userRole = user.app_metadata?.role || 'user';
  next();
};
```

**Process**:
1. Extract Bearer token from Authorization header
2. Validate token with Supabase Admin Client
3. Check if email is confirmed
4. Attach `userId` and `userRole` to request object
5. Continue to controller

⚠️ **CONSTRAINT**: Users with unconfirmed emails are rejected (401)

---

### Route Protection

**Location**: `apps/api/src/routes/v1/profiles.ts/profiles.ts`

```typescript
// Public routes (no auth)
router.get('/public/:identifier', profileController.getPublicProfile);
router.get('/search', optionalAuth, profileController.searchProfiles);
router.get('/username/:username/availability', optionalAuth, profileController.checkUsername);

// Protected routes (auth required) - All routes after this use authenticate middleware
router.use(authenticate);

router.post('/', profileController.createProfile);
router.get('/me', profileController.getMyProfile);
router.put('/me', profileController.updateProfile);
router.delete('/me', profileController.deleteProfile);
router.get('/:identifier', profileController.getProfile);
```

**Authentication Types**:
- **No auth**: Anyone can access
- **Optional auth** (`optionalAuth`): Works without auth but provides better experience if authenticated
- **Required auth** (`authenticate`): Must be authenticated, 401 if not

---

### Environment Variables Required

#### Frontend (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_API_URL=http://localhost:4000  # or production API URL
```

#### Backend (.env)

```bash
DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here  # For backend validation
PORT=4000
NODE_ENV=development
```

---

## Frontend Components

### Component Architecture

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

### useProfile Hook

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

### Profile API Client

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

### UI Components

#### ProfileHeader

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

#### ProfileSkeleton

**Location**: `apps/web/components/profile/ProfileSkeleton.tsx`

**Purpose**: Loading state placeholder

Shows animated skeleton while `useProfile` is fetching data.

---

### Current Profile Page Implementation

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

## Integration Patterns

### Pattern 1: Handling Null/Empty Profile State

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

### Pattern 2: Optimistic Updates

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

### Pattern 3: Form Validation

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

### Pattern 4: Username Availability Check

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

### Pattern 5: Error Handling

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

## Technical Constraints

### Backend Constraints

#### 1. Profile-User Relationship

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

#### 2. Username Uniqueness

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

#### 3. Email Confirmation Required

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

#### 4. Soft Delete Behavior

**Constraint**: DELETE operations don't remove data, just mark as deleted

**Implementation**:
```typescript
await profileService.delete(req.userId!, context, { soft: true });
```

**Note**: Soft delete logic not shown in provided code but mentioned in delete call

---

#### 5. Privacy Filters

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

### Frontend Constraints

#### 1. Environment Variables Required

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

#### 2. Client-Side Only Components

**Constraint**: Profile page uses client-side hooks (`'use client'`)

**Implication**: 
- Cannot use server-side features in this page
- SEO considerations for profile pages
- Initial load requires API roundtrip

**Consideration**: Implement server-side rendering for public profiles later

---

#### 3. CORS Configuration

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

### Known Issues / Technical Debt

#### 1. Missing Profile Creation Flow

**Issue**: No UI for creating profile if it doesn't exist

**Current Behavior**: Shows error if profile not found

**Required**: Implement empty state with "Create Profile" form

**Story**: Should be part of PROF-001 or separate story

---

#### 2. No Profile Edit Form

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

#### 3. No Image Upload

**Issue**: Profile picture URL is text field, no upload capability

**Current Workaround**: Users must provide external image URL

**Future Enhancement**: 
- Add file upload to Supabase Storage
- Generate signed URLs
- Image optimization/resizing

---

#### 4. No Username Change Confirmation

**Issue**: Username changes are instant, no confirmation step

**Risk**: Accidental changes, SEO impact (if URLs use username)

**Recommendation**: Add confirmation dialog for username changes

---

#### 5. No Rate Limiting Shown

**Note**: Rate limiting likely implemented in API but not documented

**Check**: Look for `express-rate-limit` usage in API code

---

## Development Setup

### Prerequisites

- **Node.js**: v20+
- **pnpm**: Latest version
- **PostgreSQL**: Running instance (or Supabase project)
- **Supabase Account**: For authentication

---

### Local Development

#### 1. Clone and Install

```bash
cd /home/youssef/projects/athaar/Athaar
pnpm install
```

#### 2. Configure Environment Variables

**Frontend** (`apps/web/.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Backend** (`apps/api/.env`):
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/athaar
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=4000
NODE_ENV=development
```

#### 3. Database Setup

```bash
cd apps/api

# Pull schema from database
pnpm db:pull

# Generate Prisma Client
pnpm db:generate
```

#### 4. Start Development Servers

**Terminal 1 - Backend**:
```bash
cd apps/api
pnpm dev
# Server starts on http://localhost:4000
```

**Terminal 2 - Frontend**:
```bash
cd apps/web
pnpm dev
# App starts on http://localhost:3000
```

#### 5. Verify Setup

1. Visit `http://localhost:3000`
2. Sign up / Log in
3. Navigate to `/profile`
4. Should see profile page (or create profile prompt)

---

### Project Scripts

#### Frontend (`apps/web`)

```bash
pnpm dev            # Start dev server (port 3000)
pnpm dev:turbo      # Start with Turbo (port 3100)
pnpm build          # Production build
pnpm start          # Start production server
pnpm lint           # ESLint check
pnpm check-types    # TypeScript check
```

#### Backend (`apps/api`)

```bash
pnpm dev            # Start dev server with watch mode
pnpm build          # Build for production
pnpm start          # Start production server
pnpm type-check     # TypeScript check
pnpm lint           # ESLint check
pnpm db:generate    # Generate Prisma Client
pnpm db:push        # Push schema to database
pnpm db:pull        # Pull schema from database
pnpm openapi:generate  # Generate OpenAPI spec
```

---

### Monorepo Structure

```
Athaar/
├── apps/
│   ├── api/        # Backend Express server
│   └── web/        # Frontend Next.js app
├── packages/
│   ├── types/      # Shared TypeScript types
│   ├── eslint-config/  # Shared ESLint config
│   └── typescript-config/  # Shared TS config
├── pnpm-workspace.yaml
└── turbo.json      # Turborepo configuration
```

**Package Management**: 
- Uses pnpm workspaces
- Shared packages via `workspace:*`
- Example: `@monolenz/types` used by both frontend and backend

---

## Testing & Deployment

### Current Testing State

⚠️ **No profile tests found** in provided code

**Recommended Tests**:

#### Backend Tests (Needed)
1. Unit tests for ProfileService
2. Integration tests for Profile API endpoints
3. Repository tests for database queries
4. Validation tests for Zod schemas

#### Frontend Tests (Needed)
1. Component tests for Profile UI
2. Hook tests for useProfile
3. API client tests
4. E2E tests for profile flows

---

### API Testing (Current)

**Tool**: Postman (mentioned by user)

**Postman Collection**: Should create/export for documentation

**Example Endpoints to Test**:
```
GET {{v1link}}/profiles/me
PUT {{v1link}}/profiles/me
POST {{v1link}}/profiles
DELETE {{v1link}}/profiles/me
GET {{v1link}}/profiles/username/testuser/availability
```

---

### Deployment Checklist

#### Pre-Deployment

- [ ] Environment variables configured (production)
- [ ] Database migrations run
- [ ] Prisma Client generated
- [ ] Frontend built successfully
- [ ] Backend built successfully
- [ ] SSL/TLS certificates configured
- [ ] CORS origins updated for production
- [ ] API rate limiting configured
- [ ] Error tracking setup (e.g., Sentry)
- [ ] Logging configured

#### Production Environment Variables

**Frontend**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://production.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

**Backend**:
```bash
DATABASE_URL=postgresql://user:pass@prod-db:5432/athaar
SUPABASE_URL=https://production.supabase.co
SUPABASE_SERVICE_ROLE_KEY=prod-service-role-key
PORT=4000
NODE_ENV=production
```

---

## Appendix

### Common Issues & Solutions

#### Issue 1: "Profile not found" on first login

**Cause**: New users don't have profile automatically created

**Solution**: Implement profile creation flow in UI

**Temporary Workaround**: Manually create profile via API POST request

---

#### Issue 2: CORS errors in browser console

**Cause**: API not allowing frontend origin

**Solution**: Check CORS configuration in API:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
```

---

#### Issue 3: "Authentication required" errors

**Cause**: Token not being sent or expired

**Debug Steps**:
1. Check browser console for token
2. Verify Supabase session exists
3. Check token expiration
4. Try re-logging in

**Check Session**:
```typescript
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
```

---

#### Issue 4: Validation errors on form submission

**Cause**: Client-side and server-side validation mismatch

**Solution**: Both use same Zod schemas from `@monolenz/types/validation`

**Verify**: Check that shared package is up-to-date in both apps

---

### Useful Commands

#### Database

```bash
# View database structure
cd apps/api
pnpm prisma studio

# Reset database (DANGER)
pnpm prisma db push --force-reset

# View database logs (Supabase)
# Use Supabase dashboard
```

#### Debugging

```bash
# Frontend
cd apps/web
# Check environment
pnpm next info

# Backend
cd apps/api
# Check TypeScript errors
pnpm type-check

# Run with debugging
DEBUG=* pnpm dev
```

---

### Next Steps for Implementation

#### Immediate Priorities

1. **Implement Profile Creation Flow**
   - Empty state component
   - Create profile form
   - Initial profile setup wizard

2. **Implement Profile Edit Form** (PROF-002)
   - Edit sheet/modal component
   - Form validation
   - Username availability check
   - Image URL preview
   - Save/cancel actions

3. **Handle Null Profile State**
   - Graceful error handling
   - Create profile CTA
   - Loading states

4. **Add Profile Completeness Logic**
   - Calculate completion percentage
   - Show missing fields
   - Encourage profile completion

#### Future Enhancements

5. **Image Upload**
   - Supabase Storage integration
   - Image cropper
   - Avatar generator

6. **Profile Visibility Settings**
   - Public/private toggle
   - Field-level privacy

7. **Profile Analytics**
   - View count
   - Link clicks
   - Profile completeness tracking

---

### Reference Links

- **Supabase Docs**: https://supabase.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Zod Docs**: https://zod.dev
- **Radix UI**: https://www.radix-ui.com

---

## Document Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-07 | Initial brownfield architecture document | Winston |

---

**END OF DOCUMENT**

