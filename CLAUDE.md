# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands should be run from the repo root unless noted.

### Root (orchestrates everything via Turbo)

```bash
pnpm dev              # Start all apps in dev mode
pnpm build            # Full build (pulls DB schema, generates Prisma client)
pnpm build:without-db # Build without DB (CI without DB access)
pnpm lint             # Lint all packages
pnpm check-types      # TypeScript check all packages
pnpm format           # Prettier write
pnpm format:check     # Prettier check (used in CI)
pnpm pre-commit       # format + lint + check-types (runs before commits)
```

### API (`apps/api`)

```bash
pnpm dev              # tsx watch src/server.ts
pnpm lint             # eslint src/
pnpm check-types      # tsc --noEmit
pnpm db:generate      # prisma generate
pnpm db:push          # prisma db push
pnpm db:pull          # prisma db pull
```

### Web (`apps/web`)

```bash
pnpm dev              # next dev --port 3000
pnpm check-types      # tsc --noEmit
pnpm lint             # next lint
```

### Shared Types (`packages/types`)

```bash
pnpm dev              # tsup --watch (must run when editing types used by other packages)
pnpm build            # tsup
```

There are no automated tests currently.

## Architecture

### Monorepo Layout

```
apps/api        — Express.js backend
apps/web        — Next.js 15 frontend (App Router)
packages/types  — Shared TypeScript types + Zod schemas
packages/eslint-config, typescript-config, shared
```

### API (`apps/api/src`)

**Request lifecycle:**
`server.ts` → `app.ts` middleware stack → routes → controller → service → repository → Prisma

**Middleware stack (in order):** Helmet, CORS, compression, Morgan, body parser, rate limiter, `preprocessRequest` (adds `req.pagination`, `req.search`, `req.filters`), `formatResponse` (adds `res.success()`, `res.error()`, `res.paginated()`), routes, 404 handler, `handleErrors`.

**Auth middleware** (`src/middleware/auth.ts`): `authenticate` (requires Bearer JWT verified via Supabase), `optionalAuth`, `authorize(roles)`, `authorizeOwnership(param)`.

**Route structure:**

```
GET  /health
/api/v1/profiles
  GET  /me                              (authenticate)
  PUT  /me                              (authenticate)
  POST /                                (authenticate)
  GET  /username/:username/availability (public)
  GET  /:identifier/versions/latest     (public)
  POST /me/versions                     (authenticate, batch block update)
```

**Repository pattern:** `src/repositories/base.repository.ts` provides base CRUD. Block repositories follow a factory pattern in `src/repositories/blocks/`. Services in `src/services/` contain domain logic; controllers in `src/controllers/` handle HTTP only.

**DB:** PostgreSQL via Prisma, multi-schema (`auth` + `public`). Versions are immutable — edits always create a new version via the batch update endpoint. `blocks` table deduplicates by `content_hash`.

### Web (`apps/web`)

**Route groups:**

- `(auth)/` — login, signup (no layout chrome)
- `(marketing)/` — landing page
- `(app)/dashboard/` — authenticated app shell

**API client pattern:** All API calls go through the factory `createXxxApi(client: ApiClient)` in `lib/api/`. Components get a client via `useApiClient()` then call the factory inline:

```ts
const client = useApiClient();
const profileApi = useMemo(() => createProfileApi(client), [client]);
```

`useApiClient()` (`lib/hooks/useApiClient.ts`) calls `createBrowserApiClient()` which injects the Supabase session token automatically. For server components, use `lib/api/server.ts`.

**State management:** Zustand + immer in `lib/stores/profile-editor-store.ts`. The store tracks `DraftBlock[]` with statuses `unchanged | created | modified | deleted`. `getChangeset()` returns the diff for the batch update payload. Key selectors: `useSelectedBlock()`, `useVisibleBlocks()`, `useBlocksByCategory()`, `useHasUnsavedChanges()`.

**Block editor:** `BlockEditor.tsx` uses sidebar category navigation (never expose "block" terminology to users — use category names). `BlockFormFields.tsx` renders the form for each of the 8 block types.

### Shared Types (`packages/types`)

Import paths:

```ts
import type { Profile, DraftBlock, VersionBlockDetail, BlockType } from '@monolenz/types/entities';
import type { ApiResponse } from '@monolenz/types/api';
import { profileSchemas, blockSchemas } from '@monolenz/types/validation';
```

When editing `packages/types`, run `pnpm dev` there (or `pnpm build`) before the consuming apps will see the changes.

**Block system:** 8 block types (`work_experience`, `education`, `skill`, `project`, `certification`, `language`, `volunteer`, `award`). Each has a typed data interface. `TypedBlockData` is a discriminated union keyed on `block_type`.

### Error Handling

- API: `ApiError` (`lib/api/common.ts`) carries `status`, `statusText`, `method`, `path`. Use `err.is404()` / `err.isClientError()` / `err.isServerError()` for conditional handling.
- Backend: `handleErrors` middleware in `apps/api/src/middleware/request-response.ts` normalises Zod errors, Prisma P2002 (unique) / P2025 (not found), and auth errors into consistent `ApiResponse` shape.

## Key Conventions

- **No `del` method** — `ApiClient` uses `delete` (renamed from `del`).
- **Versioning is immutable** — never mutate a version; always create a new one via `POST /api/v1/profiles/me/versions`.
- **Supabase auth** — browser: `utils/supabase/client.ts`; server (RSC/route handlers): `utils/supabase/server.ts`; middleware: `utils/supabase/middleware.ts`.
- **Styling** — Tailwind v4 + shadcn/ui components (`Button`, `Card`, `Input`, `Label`, `Badge` etc. from `@/components/ui/`).
- **Path alias** — `@/` maps to `apps/web/` root.
