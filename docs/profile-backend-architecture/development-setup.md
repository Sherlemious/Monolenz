# Development Setup

## Prerequisites

- **Node.js**: v20+
- **pnpm**: Latest version
- **PostgreSQL**: Running instance (or Supabase project)
- **Supabase Account**: For authentication

---

## Local Development

### 1. Clone and Install

```bash
cd /home/youssef/projects/athaar/Athaar
pnpm install
```

### 2. Configure Environment Variables

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

### 3. Database Setup

```bash
cd apps/api

# Pull schema from database
pnpm db:pull

# Generate Prisma Client
pnpm db:generate
```

### 4. Start Development Servers

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

### 5. Verify Setup

1. Visit `http://localhost:3000`
2. Sign up / Log in
3. Navigate to `/profile`
4. Should see profile page (or create profile prompt)

---

## Project Scripts

### Frontend (`apps/web`)

```bash
pnpm dev            # Start dev server (port 3000)
pnpm dev:turbo      # Start with Turbo (port 3100)
pnpm build          # Production build
pnpm start          # Start production server
pnpm lint           # ESLint check
pnpm check-types    # TypeScript check
```

### Backend (`apps/api`)

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

## Monorepo Structure

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

