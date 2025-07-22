# ATHAAR

**Write once, tailor everywhere. Your one-stop source-of-truth for your professional identity.**

ATHAAR is a streamlined resume and portfolio builder platform designed for students and recent graduates. Create comprehensive professional profiles, generate tailored resumes, build stunning portfolios, and track job applications—all from a single platform.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth
- **Storage**: AWS S3
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Package Manager**: pnpm
- **Monorepo**: Turborepo

## Project Structure

```text
athaar/
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

## Architecture Overview

ATHAAR uses a **block-based versioning system** inspired by Git, where professional information is stored as immutable content blocks. This enables:

- **Complete version history** of profile changes
- **Structural sharing** for storage efficiency
- **Point-in-time reconstruction** of any profile version
- **Content deduplication** across users

### Data Flow

1. **Profile Data** → Immutable blocks in PostgreSQL
2. **Versions** → Snapshots referencing specific blocks
3. **Resumes/Portfolios** → Compositions of versioned blocks
4. **Export** → HTML generation → PDF conversion (resumes) or static site (portfolios)

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed information about:

- Branch naming conventions
- Commit message format
- Pull request workflow
- Code review guidelines

### Branch Naming Format

```text
<component>/<type>/[ticket-id/]<description>

# Examples
frontend/feature/user-dashboard
backend/bugfix/auth-validation
ui/feature/design-system
```

### Commit Message Format

```text
<type>[optional scope]: <description>

# Examples
feat(auth): add OAuth login
fix(api): resolve timeout issue
docs(readme): update setup instructions
```
