# 1. Architecture Overview

## 1.1 System Integration Diagram

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

## 1.2 Integration Layers

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

