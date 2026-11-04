# MONOLENZ

**Write once. Publish everywhere.** One source of truth for your professional identity.

Monolenz is an open-source profile builder: create a structured professional profile, share it at `/{username}`, hide entries you are not ready to show, and export named resume PDFs.

## What works today

- Email signup, login, and password reset (JWT sessions stored in Neon)
- Username onboarding and profile info (bio, links, picture URL, themes)
- Content editor for 8 types: work, education, skills, projects, certifications, languages, volunteer, awards
- Immutable versioned saves (edits create a new snapshot; blocks are deduplicated by content hash)
- Public page at `/{username}` with copy-link and Print / Save as PDF
- Named resume variants with Professional and Jake templates, plus server-side PDF export
- Per-entry public/hidden visibility

## Roadmap (not shipped)

ATS-tailored AI, application tracking, OAuth, billing, and a full version-history UI.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript on Cloudflare Workers via OpenNext (the Worker also serves `/api/v1`)
- **Backend**: Express.js, TypeScript (local development)
- **Database**: Neon PostgreSQL with Prisma ORM
- **Authentication**: Email/password + JWT (own `users` table)
- **Storage**: AWS S3
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Package Manager**: pnpm
- **Monorepo**: Turborepo

## Project Structure

```text
monolenz/
├── apps/
│   ├── web/                    # Next.js frontend application
│   │   ├── app/               # App router pages and layouts
│   │   ├── public/            # Static assets
│   │   └── package.json
│   └── api/                   # Express.js backend API
│       ├── src/
│       │   ├── config/        # Configuration
│       │   ├── controllers/   # HTTP request/response handling
│       │   ├── database/      # Database Schema
│       │   ├── middleware/    # Express middleware
│       │   ├── repositories/  # Data access layer
│       │   ├── routes/        # HTTP route definitions
│       │   ├── services/      # Business logic layer
│       │   │   ├── domain/    # Internal business logic
│       │   │   ├── external/  # Third-party integrations
│       │   │   ├── infrastructure/ # Technical services
│       │   │   └── shared/    # Cross-cutting concerns
│       │   └── types/         # TypeScript type definitions
│       │   ├── utils/         # Helper utilities
│       ├── prisma/
│       │   ├── migrations/    # Database migrations
│       │   └── seed/          # Database seeding
│       ├── tests/             # Test files
│       │   ├── unit/
│       │   ├── integration/
│       │   └── helpers/
│       └── package.json
├── packages/
│   ├── eslint-config/         # Shared ESLint configurations
│   ├── typescript-config/     # Shared TypeScript configurations
│   ├── types/                 # Shared TypeScript types and interfaces
│   ├── shared/                # Shared utilities and configurations
│   └── config/                # Shared configuration files
├── tools/                     # Build tools and scripts
├── docs/                      # Documentation
├── turbo.json                 # Turborepo configuration
├── pnpm-workspace.yaml        # pnpm workspace configuration
└── package.json               # Root package.json
```

## Prerequisites

- **Node.js**: >=18.0.0
- **pnpm**: >=9.0.0
- **PostgreSQL**: >=14.0
- **Git**

## Local setup

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

The database is Neon project `restless-tooth-10203696` (see `.neon` / `neon.ts`). `neon env pull` writes `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct, used by Prisma Migrate) to `.env.local`; copy them into `apps/api/.env` and `apps/web/.env.local`, along with a shared `AUTH_SECRET` (32+ characters). Leave `NEXT_PUBLIC_API_URL` empty to use Next.js `/api/v1` against Neon, or set `http://localhost:4000` to use local Express. Optional: `RESEND_API_KEY` for password-reset emails.

```bash
pnpm --filter api db:generate
pnpm --filter api db:migrate   # prisma migrate deploy (direct URL)
pnpm --filter api db:seed      # link platforms
pnpm --filter @monolenz/types build
pnpm dev
```

- Web: [http://localhost:3000](http://localhost:3000)
- Public demo: [https://monolenz.sherlemious.com](https://monolenz.sherlemious.com)
- API: [http://localhost:4000](http://localhost:4000)

## Deployment (Cloudflare Workers)

`apps/web` is built with [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) and deployed as the `monolenz` Worker (`apps/web/wrangler.jsonc`). Postgres is reached through the `HYPERDRIVE` binding (Cloudflare Hyperdrive in front of Neon) with `pg` + `@prisma/adapter-pg`, and a Prisma client is created per request.

- **CI:** `.github/workflows/deploy-cloudflare.yml` — `main` runs migrations then deploys; `stage` uploads a preview version. Needs repo secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, and vars `NEXT_PUBLIC_*`.
- **Runtime secrets** live on the Worker: `pnpm --filter web exec wrangler secret put AUTH_SECRET` (also `RESEND_API_KEY`, `AUTH_FROM_EMAIL`, `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`).
- **Never put secrets in `.env*` files for a Worker build** — OpenNext embeds every `.env*` file in the bundle. `pnpm build:worker` refuses to run while it finds any; deploy from CI or move local env files aside.
- **Windows:** the build needs symlinks — use `apps/web/scripts/docker-build.sh` (Docker; usage in its header), WSL, or CI.
- Local Worker run: `cp apps/web/.dev.vars.example apps/web/.dev.vars`, set `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE`, then `pnpm --filter web preview`.

Commands from the repo root:

```bash
pnpm lint
pnpm check-types
pnpm format
pnpm build
```

## Architecture

### Block-Based Versioning

Monolenz uses a **block-based versioning system** inspired by Git, where professional information is stored as immutable content blocks. This enables:

- **Complete version history** of profile changes
- **Structural sharing** for storage efficiency
- **Point-in-time reconstruction** of any profile version
- **Content deduplication** across users

### Data Flow

1. **Profile Data** → Immutable blocks in PostgreSQL
2. **Versions** → Snapshots referencing specific blocks
3. **Resumes/Portfolios** → Compositions of versioned blocks
4. **Export** → HTML generation → PDF conversion (resumes) or static site (portfolios)

### Authentication

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                               ARCHITECTURE                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐                    ┌─────────────────┐
│   Next.js App   │     Prisma         │  Neon Postgres  │
│ • Login/Signup  │───────────────────►│ • users         │
│ • Session cookie│                    │ • profiles      │
│ • /api/v1 routes│                    │ • versions      │
│ • Route Guards  │                    │ • blocks        │
└─────────────────┘                    └─────────────────┘

Local optional: set NEXT_PUBLIC_API_URL=http://localhost:4000 to use Express
instead of the Next.js /api/v1 route handlers.
```

## Versioning and Blocks (Profile Pages)

This system models profile content as immutable blocks and versioned snapshots.

- Blocks are immutable content blobs, deduplicated by `content_hash`.
- A `version` is a snapshot of a profile at a point in time.
- The `version_blocks` junction ties blocks to a version and stores lineage plus presentation details.
- Block schemas are managed centrally via `block_types` and `block_properties`.

### Data model overview

```mermaid
classDiagram
  class profiles {
    +string id
    +string username
  }
  class versions {
    +int id
    +string profile_id
    +int parent_version_id
    +string metadata
    +datetime created_at
  }
  class version_blocks {
    +int version_id
    +int block_id
    +int previous_version_id
    +int previous_block_id
    +bool is_visible
    +string section_name
    +int sort_order
    +datetime created_at
  }
  class blocks {
    +int id
    +int block_type_id
    +string data
    +string content_hash
    +datetime created_at
  }
  class block_types {
    +int id
    +string name
    +string display_name
  }
  class block_properties {
    +int id
    +int block_type_id
    +string property_name
    +string property_type
    +bool is_required
  }
  class block_property_values {
    +int block_id
    +int property_id
    +string value
    +bool is_public
  }

  profiles "1" --> "many" versions
  versions "1" --> "many" version_blocks
  blocks "1" --> "many" version_blocks
  block_types "1" --> "many" blocks
  block_types "1" --> "many" block_properties
  blocks "1" --> "many" block_property_values
  block_properties "1" --> "many" block_property_values
```

Key points:

- Blocks are immutable. To change content, create a new block and attach it to a new or target version.
- Lineage is version-scoped: `version_blocks.previous_block_id` links a block to the one it supersedes in that chain.
- Visibility is immutable per version: changing visibility creates a new version with the desired `is_visible` state.
- Property-level privacy is enforced via `block_property_values.is_public` on reads for public users.

### Version update (batch) sequence

```mermaid
sequenceDiagram
  autonumber
  participant C as Client (UI)
  participant API as API Controller
  participant S as ProfileBlockService
  participant Rb as BlocksRepo
  participant Rc as CatalogRepo
  participant Rv as VersionsRepo
  participant Rvb as VersionBlocksRepo

  Note over C: POST /profiles/me/versions/:versionId/update
  C->>API: { creations[], updates[], deletions[] }
  API->>S: applyVersionUpdate(payload)
  S->>Rb: begin transaction
  S->>Rv: getVersionById(currentVersionId)
  S->>Rv: listVersionBlockIds(currentVersionId)
  S->>S: compute sets: unmentioned = current - (updates.parents ∪ deletions)

  loop create blocks for creations
    S->>Rc: load properties for block_type
    S->>S: validate data
    S->>Rb: compute hash, dedupe or create block
  end

  loop create new blocks for updates
    S->>Rc: load properties for target block_type
    S->>S: validate data
    S->>Rb: compute hash, dedupe or create new block
  end

  S->>Rv: createVersion({ parent_version_id: currentVersionId })

  par attach unchanged (unmentioned)
    loop
      S->>Rvb: attachBlockToVersion({ version_id: newVersion.id, block_id })
    end
  and attach creations
    loop
      S->>Rvb: attachBlockToVersion({ version_id: newVersion.id, block_id })
    end
  and attach updates (with lineage)
    loop for each update
      S->>Rvb: attachBlockToVersion({ version_id: newVersion.id, block_id: newId, previous_block_id: parentId })
    end
  end

  S->>Rb: commit transaction
  S->>API: { versionId: newVersion.id }
  API->>C: 200 OK
```

Note: Deletions are part of the batch version update (they are omitted from the new version). There is no separate delete flow endpoint.

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for branch naming, commit conventions, PR workflow, and review expectations.

### Branching and Releases

Monolenz uses a staging-first flow:

- `main` - Production branch
- `stage` - Integration and staging branch
- `feature/*` branches - Short-lived branches merged into `stage` via PR

Release flow:

1. Merge feature branches into `stage`
2. Validate changes in staging
3. Promote `stage` to `main` via PR for production release

CI triggers:

- Quality checks run on `stage` and `main`
- Staging deploy runs on pushes to `stage`
- Production deploy runs on pushes to `main`

## License

MIT. See [LICENSE](./LICENSE).
