# CI/CD Pipeline File Mapping Guide

This document maps each component from the [CI/CD Pipeline Flow Diagrams](./cicd-pipeline-flow.md) to actual files in your codebase. Use this as a reference to understand where everything is configured.

---

## 📋 Table of Contents

1. [GitHub Actions Workflows](#github-actions-workflows)
2. [Docker Configuration](#docker-configuration)
3. [Build & Test Scripts](#build--test-scripts)
4. [Health Check Endpoints](#health-check-endpoints)
5. [Deployment Scripts](#deployment-scripts)
6. [Configuration Files](#configuration-files)

---

## 🔄 GitHub Actions Workflows

All workflow files are located in `.github/workflows/`. These are the "recipes" that GitHub Actions follows when triggered.

### 1. **CI Workflow (Build & Test)**
**File:** `.github/workflows/build-test.yml`

**What it does:** Runs on every push to `dev` branch and PRs to `dev`/`main`. Validates code quality before merging.

**Key Sections:**
- **Lines 7-12:** Triggers (push to dev, PRs)
- **Lines 62-93:** Linting job (`pnpm lint`)
- **Lines 95-126:** Type checking job (`pnpm check-types`)
- **Lines 128-180:** Build job (builds both API and Web in parallel)
- **Lines 181-220:** Test job (⚠️ Currently skipped - no test scripts)
- **Lines 222-269:** Docker build job (tests that Docker images build correctly)

**Maps to:** "CI Workflow (Build & Test)" diagram in flow document

---

### 2. **Staging Deployment**
**File:** `.github/workflows/deploy-staging.yml`

**What it does:** Deploys to staging environment when code is pushed to `stage` branch.

**Key Sections:**
- **Lines 3-6:** Trigger (push to `stage` branch)
- **Lines 15-37:** Path filtering (detects if web/api changed)
- **Lines 39-92:** Build and test before deployment
- **Lines 94-235:** Web deployment (Blue/Green)
  - **Lines 110-120:** Build Docker image with staging build args
  - **Lines 150-166:** Deploy with `--no-traffic` (Blue/Green)
  - **Lines 189-207:** Health check (`curl /health`)
  - **Lines 209-215:** Switch traffic to new revision
  - **Lines 217-235:** Clean up old revisions
- **Lines 237-377:** API deployment (same Blue/Green pattern)

**Maps to:** "Staging Deployment (Blue/Green)" diagram

---

### 3. **Production Deployment**
**File:** `.github/workflows/deploy-production.yml`

**What it does:** Deploys to production when code is pushed to `main` branch.

**Key Sections:**
- **Lines 3-6:** Trigger (push to `main` branch)
- **Lines 14-36:** Path filtering
- **Lines 87-228:** Web deployment (Blue/Green)
  - **Lines 103-113:** Build Docker image with production build args
  - **Lines 143-159:** Deploy with `--no-traffic` (Blue/Green)
  - **Lines 182-200:** Health check (`curl /health`)
  - **Lines 202-208:** Switch traffic to new revision
- **Lines 230-370:** API deployment (same pattern)

**Maps to:** "Production Deployment (Blue/Green)" diagram

---

### 4. **Rollback Workflow**
**File:** `.github/workflows/rollback.yml`

**What it does:** Manual workflow to rollback to a previous revision or tag.

**Key Sections:**
- **Lines 3-33:** Manual trigger with inputs (service, rollback strategy, tag)
- **Lines 57-83:** Determine rollback target (previous revision or specific tag)
- **Lines 115-132:** Perform rollback (switch traffic)
- **Lines 134-158:** Verify rollback (health check)
- **Lines 168-188:** Cleanup old revisions

**Maps to:** "Rollback Process" diagram

---

### 5. **Security Audit**
**File:** `.github/workflows/audit-packages.yml`

**What it does:** Runs daily at 2 AM UTC to check for security vulnerabilities.

**Key Sections:**
- **Lines 4-6:** Schedule trigger (`0 2 * * *` = daily at 2 AM)
- **Line 25:** Runs `pnpm audit --prod --audit-level=high` (fails on high severity)

**Maps to:** "Scheduled Jobs" diagram

---

### 6. **Code Formatting**
**File:** `.github/workflows/auto-format.yml`

**What it does:** Checks code formatting on all pushes/PRs.

**Key Sections:**
- **Lines 4-7:** Triggers (all pushes/PRs to main branches)
- **Lines 54-74:** Runs `pnpm format:check` (Prettier)

**Maps to:** "Overall Pipeline Overview" → Formatting

---

## 🐳 Docker Configuration

### API Dockerfile
**File:** `Dockerfile.api` (root directory)

**What it does:** Defines how to build the API Docker image.

**Key Sections:**
- **Lines 1-11:** Base image and dependency installation
- **Lines 13-27:** Build stage (compiles TypeScript)
- **Lines 29-72:** Runtime stage (production image)
  - **Lines 65-67:** Health check definition (`/health` endpoint)
  - **Line 72:** Start command (`node dist/server.js`)

**Used by:** 
- `.github/workflows/build-test.yml` (line 230)
- `.github/workflows/deploy-staging.yml` (line 117)
- `.github/workflows/deploy-production.yml` (line 250)

---

### Web Dockerfile
**File:** `Dockerfile.web` (root directory)

**What it does:** Defines how to build the Web Docker image.

**Key Sections:**
- **Lines 1-11:** Base image and dependency installation
- **Lines 13-31:** Build stage (Next.js build with build args)
  - **Lines 18-20:** Build args for environment variables
  - **Lines 23-25:** Environment variables set for build
- **Lines 33-59:** Runtime stage (production image)
  - **Lines 55-56:** Health check definition (`/health` endpoint)
  - **Line 59:** Start command (`node server.js`)

**Used by:**
- `.github/workflows/build-test.yml` (line 232)
- `.github/workflows/deploy-staging.yml` (line 117)
- `.github/workflows/deploy-production.yml` (line 110)

---

## 🔨 Build & Test Scripts

### Root Package.json
**File:** `package.json` (root directory)

**Scripts:**
- **Line 5:** `build` → Runs `turbo run build` (builds all apps)
- **Line 6:** `build:without-db` → Builds without database (for CI)
- **Line 8:** `lint` → Runs `turbo run lint` (lints all apps)
- **Line 11:** `check-types` → Runs `turbo run check-types` (type checks all apps)
- **Line 9:** `format` → Formats code with Prettier
- **Line 10:** `format:check` → Checks formatting without fixing

**Used by:** All GitHub Actions workflows

---

### API Package.json
**File:** `apps/api/package.json`

**Scripts:**
- **Line 8:** `build` → Full build with database
- **Line 9:** `build:without-db` → Build without database (used in CI)
- **Line 12:** `type-check` → TypeScript type checking
- **Line 13:** `lint` → ESLint
- **⚠️ Missing:** `test` script (mentioned in workflows but doesn't exist)

**Used by:** 
- `.github/workflows/build-test.yml` (lines 167, 214)
- `.github/workflows/deploy-staging.yml` (line 82)
- `.github/workflows/deploy-production.yml` (line 77)

---

### Web Package.json
**File:** `apps/web/package.json`

**Scripts:**
- **Line 9:** `build` → Next.js build
- **Line 11:** `lint` → Next.js linting
- **Line 12:** `check-types` → TypeScript type checking
- **⚠️ Missing:** `test` script (mentioned in workflows but doesn't exist)

**Used by:**
- `.github/workflows/build-test.yml` (lines 169, 214)
- `.github/workflows/deploy-staging.yml` (line 84)
- `.github/workflows/deploy-production.yml` (line 77)

---

### Turbo Configuration
**File:** `turbo.json` (root directory)

**What it does:** Defines build pipeline and caching for TurboRepo.

**Key Sections:**
- **Lines 5-10:** `build` task configuration
- **Lines 11-15:** `build:without-db` task (for CI)
- **Lines 16-18:** `lint` task
- **Lines 19-21:** `check-types` task

**Used by:** All `pnpm` commands that use Turbo (build, lint, check-types)

---

## 🏥 Health Check Endpoints

### Web Health Check
**File:** `apps/web/app/health/route.ts`

**What it does:** Returns health status for the web application.

**Key Sections:**
- **Lines 4-18:** GET handler that returns health status
- **Line 18:** Returns 200 OK with health info
- **Lines 19-27:** Error handling (returns 503 on error)

**Endpoint:** `GET /health`

**Used by:**
- Dockerfile.web health check (line 56)
- `.github/workflows/deploy-staging.yml` (line 199)
- `.github/workflows/deploy-production.yml` (line 192)

---

### API Health Check
**File:** `apps/api/src/app.ts` (lines 74-81)

**What it does:** Simple health check endpoint for the API.

**Key Sections:**
- **Line 74:** Route definition (`app.get('/health', ...)`)
- **Lines 75-80:** Returns JSON with status, timestamp, uptime, environment

**Also see:** `apps/api/src/middleware/observability.ts` (lines 78-127) for advanced health check with database/cache checks.

**Endpoint:** `GET /health`

**Used by:**
- Dockerfile.api health check (line 67)
- `.github/workflows/deploy-staging.yml` (line 341)
- `.github/workflows/deploy-production.yml` (line 334)

---

## 🚀 Deployment Scripts

### Setup Deployment Script
**File:** `scripts/gcp/setup-deployment.sh`

**What it does:** Interactive script to set up Google Cloud resources for deployment.

**Key Sections:**
- **Lines 40-84:** Prompts for GCP project configuration
- **Lines 90-98:** Enables required GCP APIs
- **Lines 100-109:** Creates Artifact Registry repository
- **Lines 115-137:** Creates service account and grants permissions
- **Lines 139-145:** Creates service account key
- **Lines 155-170:** Sets up GitHub secrets (if gh CLI available)

**When to use:** First-time setup of deployment infrastructure

---

### Setup Artifact Registry Script
**File:** `scripts/gcp/setup-artifact-registry.sh`

**What it does:** Sets up Docker image registry in Google Cloud.

**Key Sections:**
- **Lines 16-19:** Prompts for project ID and region
- **Lines 25-26:** Enables Artifact Registry API
- **Lines 29-33:** Creates Docker repository
- **Lines 36-37:** Configures Docker authentication

**When to use:** If you need to set up the registry separately

---

### Check Allowed Regions Script
**File:** `scripts/gcp/check-allowed-regions.sh`

**What it does:** Checks which regions are allowed for Artifact Registry in your GCP project.

**When to use:** If you're getting region restriction errors

---

## ⚙️ Configuration Files

### ESLint Configuration (API)
**File:** `apps/api/eslint.config.js`

**Used by:** `pnpm lint` command in API

---

### ESLint Configuration (Web)
**File:** `apps/web/eslint.config.js`

**Used by:** `pnpm lint` command in Web

---

### TypeScript Configuration (API)
**File:** `apps/api/tsconfig.json`

**Used by:** `pnpm check-types` command in API

---

### TypeScript Configuration (Web)
**File:** `apps/web/tsconfig.json`

**Used by:** `pnpm check-types` command in Web

---

## 🔐 Secrets & Environment Variables

### GitHub Secrets (Set in GitHub UI)
These are referenced in workflows but stored in GitHub Secrets:

**From `.github/workflows/deploy-staging.yml`:**
- `GCP_PROJECT_ID` (line 9)
- `GCP_SA_KEY` (line 105) - Service account JSON key
- `GCP_SERVICE_SUFFIX` (line 115) - Unique service suffix
- `GCP_SERVICE_ACCOUNT_EMAIL` (line 147)
- `NEXT_PUBLIC_SUPABASE_URL_STAGING` (line 113)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING` (line 114)

**From `.github/workflows/deploy-production.yml`:**
- `GCP_PROJECT_ID` (line 9)
- `GCP_SA_KEY` (line 98)
- `GCP_SERVICE_SUFFIX` (line 108)
- `GCP_SERVICE_ACCOUNT_EMAIL` (line 140)
- `NEXT_PUBLIC_SUPABASE_URL` (line 106)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (line 107)

**Google Cloud Secret Manager Secrets:**
- `DATABASE_URL_STAGING` (referenced in deploy-staging.yml line 289)
- `DATABASE_URL_PROD` (referenced in deploy-production.yml line 282)
- `SUPABASE_SERVICE_ROLE_KEY_STAGING` (line 289)
- `SUPABASE_SERVICE_ROLE_KEY_PROD` (line 282)
- `NEW_RELIC_LICENSE_KEY` (lines 289, 282)

---

## 📊 Quick Reference: What Happens When...

### You push to `dev` branch:
1. `.github/workflows/build-test.yml` runs
2. `.github/workflows/auto-format.yml` runs
3. Code is linted, type-checked, built, and Docker images are tested
4. ✅ If all pass → Ready to merge

### You push to `stage` branch:
1. `.github/workflows/deploy-staging.yml` runs
2. Code is built and tested
3. Docker images are built with staging build args
4. Images are pushed to Artifact Registry
5. New revision deployed with `--no-traffic`
6. Health check runs (`curl /health`)
7. If health check passes → Traffic switched to new revision
8. Old revisions cleaned up

### You push to `main` branch:
1. `.github/workflows/deploy-production.yml` runs
2. Same process as staging, but:
   - Uses production build args
   - Deploys to production Cloud Run services
   - More conservative (keeps 3 revisions vs 2)

### Daily at 2 AM UTC:
1. `.github/workflows/audit-packages.yml` runs
2. Checks for security vulnerabilities
3. Fails if high severity issues found

### Manual rollback:
1. Go to GitHub Actions → "Emergency Rollback" workflow
2. Click "Run workflow"
3. Select service, rollback strategy, and environment
4. `.github/workflows/rollback.yml` runs
5. Traffic switched back to previous revision

---

## 🎯 Key Files Summary

| Component | File Location | Purpose |
|-----------|--------------|---------|
| **CI Pipeline** | `.github/workflows/build-test.yml` | Validates code before merge |
| **Staging Deploy** | `.github/workflows/deploy-staging.yml` | Deploys to staging |
| **Production Deploy** | `.github/workflows/deploy-production.yml` | Deploys to production |
| **Rollback** | `.github/workflows/rollback.yml` | Manual rollback workflow |
| **Security Audit** | `.github/workflows/audit-packages.yml` | Daily security checks |
| **Formatting** | `.github/workflows/auto-format.yml` | Code formatting checks |
| **API Dockerfile** | `Dockerfile.api` | API container definition |
| **Web Dockerfile** | `Dockerfile.web` | Web container definition |
| **Build Config** | `turbo.json` | TurboRepo build pipeline |
| **Web Health** | `apps/web/app/health/route.ts` | Web health endpoint |
| **API Health** | `apps/api/src/app.ts` (line 74) | API health endpoint |
| **Setup Script** | `scripts/gcp/setup-deployment.sh` | Initial GCP setup |

---

## ⚠️ Known Issues / Missing Components

1. **Missing Test Scripts:**
   - `apps/api/package.json` - No `test` script
   - `apps/web/package.json` - No `test` script
   - Workflows try to run tests but they're skipped (see `build-test.yml` line 216)

2. **Path Filtering:**
   - Currently builds everything in CI (`build-test.yml` line 19 comment)
   - Could be optimized to only build changed apps

3. **Notification System:**
   - No Slack/Email notifications configured
   - Only GitHub Actions UI shows failures

---

*Last Updated: Based on current codebase analysis*
