# High-Level Architecture

## System Overview

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

## Technology Stack (Actual)

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

## Repository Structure

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

