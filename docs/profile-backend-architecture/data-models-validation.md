# Data Models & Validation

## Database Schema (Prisma)

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

## TypeScript Type Definitions

### Backend Entity (Source of Truth)

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

### Frontend Types

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

## Validation Schemas (Zod)

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

