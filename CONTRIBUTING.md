# Contributing

## Branch Naming

### Branch Naming Format

```text
<component>/<type>/[ticket-id/]<description>
```

### Branch Naming Components

- `frontend` - Next.js pages, components, styles, client-side logic
- `backend` - API routes, server-side logic, database operations
- `mobile` - Mobile app (if using React Native or PWA)
- `web` - Web-specific features, PWA functionality
- `api` - External API integrations, third-party services
- `auth` - Authentication and authorization features
- `admin` - Admin panel, dashboard functionality
- `payments` - Payment processing, billing features
- `email` - Email templates, notification system
- `database` - Database migrations, schema changes
- `analytics` - Analytics, tracking, metrics
- `seo` - SEO optimizations, meta tags, sitemap
- `ui` - Design system, shared UI components
- `utils` - Utility functions, helpers, shared logic
- `tests` - Testing setup, test utilities
- `docs` - Documentation updates
- `config` - Configuration, deployment, CI/CD, environment setup
- `deps` - Dependency updates, package management

### Branch Naming Types

- `feat` - New functionality
- `bugfix` - Bug fixes
- `hotfix` - Critical production fixes
- `docs` - Documentation changes
- `config` - Configuration changes
- `experimental` - Proof of concepts, research, and experimental features
- `refactor` - Restructuring/Improving existing code without changing functionality
- `chore` - Miscellaneous

### Branch Naming Examples

```bash
# Frontend features
frontend/feature/123/user-dashboard
frontend/feature/shopping-cart
frontend/bugfix/responsive-layout
ui/feature/design-system

# Backend & API
backend/feature/456/user-authentication
api/feature/stripe-integration
auth/bugfix/jwt-validation
payments/feature/subscription-billing

# Database & Analytics
database/feature/user-analytics-table
analytics/feature/conversion-tracking
seo/feature/dynamic-meta-tags

# Configuration & Infrastructure
config/feature/789/docker-setup
config/bugfix/env-variables
deps/chore/update-nextjs
tests/feature/integration-tests

# Mobile & PWA
mobile/feature/push-notifications
web/feature/offline-support
web/bugfix/pwa-manifest

# Admin & Email
admin/feature/user-management
email/feature/welcome-template
utils/refactor/api-helpers

# Documentation
docs/feature/api-documentation
docs/bugfix/installation-steps
```

### Main Branches

- `main` - Production ready code
- `stage` - Staging environment for testing

### Branching Flow

Use a staging-first flow:

1. Create a short-lived feature branch from `stage`
2. Open a PR into `stage` for integration and verification
3. Promote tested changes from `stage` to `main` via PR

`dev` is being phased out and should not be used as a long-lived integration branch.

## Component Guidelines

### When to use each component

**Frontend/UI Components:**

- `frontend` - Pages, layouts, client-side components
- `ui` - Reusable design system components, shared UI elements
- `mobile` - Mobile-specific features, React Native code
- `web` - PWA features, web-specific functionality

**Backend/API Components:**

- `backend` - Server-side logic, middleware, internal APIs
- `api` - External API integrations (Stripe, SendGrid, etc.)
- `auth` - Authentication, authorization, security features
- `database` - Schema changes, migrations, database utilities

**Feature-Specific Components:**

- `payments` - Billing, subscriptions, payment processing
- `email` - Email templates, notification systems
- `admin` - Admin dashboard, management interfaces
- `analytics` - Tracking, metrics, data analysis
- `seo` - SEO optimizations, meta tags, sitemap generation

**Development Components:**

- `tests` - Test files, testing utilities, test configuration
- `utils` - Helper functions, shared utilities, common logic
- `config` - Environment setup, deployment, CI/CD pipelines
- `deps` - Package updates, dependency management
- `docs` - Documentation, README updates, guides

## Commit Messages

### Commit Messages Format

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Messages Types

- `feat` - New feature for the user
- `fix` - Bug fix for the user
- `docs` - Documentation changes
- `style` - Code formatting, missing semicolons, etc (no code change)
- `refactor` - Code refactoring (no functionality change)
- `perf` - Performance improvements
- `test` - Adding tests or correcting existing tests
- `build` - Changes to build system or external dependencies
- `ci` - Changes to CI configuration files and scripts
- `chore` - Other changes that don't modify src or test files
- `revert` - Reverts a previous commit

### Scopes (Optional)

Use scopes to specify which part of the codebase was changed:

```text
feat(auth): add OAuth login
fix(payment): resolve charge calculation
docs(api): update endpoint documentation
style(frontend): fix ESLint warnings
test(auth): add login unit tests
perf(database): optimize user queries
build(deps): update Next.js to 14.0
ci(github): add automated testing workflow
```

### Rules

- Use **lowercase** for type and description
- Use **present tense** ("add feature" not "added feature")
- Use **imperative mood** ("change" not "changes")
- **First line max 50 characters**
- **Capitalize first letter** of description
- **No period** at end of description
- Separate subject from body with **blank line**
- **Wrap body at 72 characters**
- Use body to explain **what and why**, not only how

### Commit Messages Examples

#### Simple commits

```bash
feat: Add user profile page
fix: Resolve login redirect issue
docs: Update README installation steps
style: Fix indentation in components
refactor: Simplify authentication logic
perf: Optimize image loading performance
test: Add unit tests for user service
chore: Update dependencies to latest versions
```

#### With scopes

```bash
feat(auth): Add social login with Google
fix(api): Handle null values in user endpoint
docs(readme): Add deployment instructions
style(components): Fix TypeScript warnings
refactor(utils): Extract validation helpers
perf(frontend): Implement lazy loading for images
test(payments): Add Stripe integration tests
build(docker): Optimize production image size
```

#### With body and footer

```bash
feat(payments): Add subscription billing system

Implement monthly and yearly subscription plans with Stripe integration.
Includes automatic invoice generation and payment failure handling.

- Add subscription model and database schema
- Integrate Stripe webhook handlers
- Create billing dashboard for users
- Add email notifications for payment events

Closes #123
Refs #124, #125
```

#### Breaking changes

```bash
feat!: Remove legacy authentication API

BREAKING CHANGE: The /api/auth/legacy endpoint has been removed.
Use /api/auth/v2 instead. See migration guide in docs/MIGRATION.md
```

#### Bug fixes with details

```bash
fix(database): Prevent duplicate user registrations

The registration endpoint was allowing duplicate emails due to a race
condition in the validation logic. Added unique constraint and proper
error handling.

Fixes #456
```

#### Multiple changes

```bash
feat(admin): Add user management dashboard

- Implement user list with pagination and search
- Add user edit form with role assignment
- Create user deletion with confirmation modal
- Add audit log for user actions

The dashboard allows admins to manage users efficiently with
proper permission checks and activity tracking.

Closes #789
```

### Bad Examples

```bash
Fixed stuff                           # Too vague
Add new feature for users            # Not specific enough
FEAT: Add authentication             # Wrong case
feat: Added authentication           # Wrong tense
feat: add authentication.            # Unnecessary period
This is a really long commit message that goes way over the 50 character limit and becomes hard to read in git log
```

### Linking Issues/Tickets

```bash
# GitHub Issues
feat: Add dark mode toggle
Closes #123

fix: Resolve API timeout
Fixes #456

# Jira tickets
feat(PROJ-123): Add user dashboard
fix(PROJ-456): Resolve payment issue

# Multiple references
feat: Add notification system
Closes #123, #124
Refs #125
```

## Workflow

### Creating Branches

```bash
# Create from stage branch
git checkout stage
git pull origin stage
git checkout -b frontend/feature/user-profile

# Work and commit
git add .
git commit -m "feat(profile): Add user profile page"
git push -u origin frontend/feature/user-profile
```

### Pull Request Flow

1. **Create branch** from `stage`
2. **Make changes** and commit following conventions
3. **Push branch** and open PR to `stage`
4. **Request review** from team members
5. **Address feedback** and update commits if needed
6. **After approval**, merge and delete branch
7. **Release flow**: `stage` → `main`

### Branch Cleanup

```bash
# After PR is merged
git checkout stage
git pull origin stage
git branch -d frontend/feature/user-profile

# Remove remote tracking branch
git remote prune origin
```

### Hotfix Workflow

```bash
# For critical production fixes
git checkout main
git pull origin main
git checkout -b frontend/hotfix/critical-security-patch

# Make fix and commit
git commit -m "fix!: Patch critical security vulnerability"

# Push and create PR to main
git push -u origin frontend/hotfix/critical-security-patch
# If needed, sync hotfix changes back into stage
```

### Working with Large Features

```bash
# For big features, create a feature branch from stage
git checkout -b frontend/feature/user-management

# Create smaller branches from the feature branch
git checkout -b frontend/feature/user-list
# Work on user list, merge back to user-management

git checkout frontend/feature/user-management
git checkout -b frontend/feature/user-edit
# Work on user edit, merge back to user-management

# Finally merge user-management to stage
```

## Rules & Best Practices

### Branch Rules

- **Never push directly** to `main` or `stage`
- **Always use Pull Requests** for code review
- **Delete branches** after merging
- **Keep branches focused** - one feature/fix per branch
- **Use descriptive names** - avoid generic terms like "fix", "update"
- **Branch from `stage`** for features, from `main` for hotfixes

### Commit Rules

- **Make atomic commits** - one logical change per commit
- **Commit frequently** - don't wait until feature is complete
- **Write meaningful messages** - explain what and why, not how
- **Test before committing** - ensure code works and passes lints
- **Use conventional format** - follow the type(scope): description pattern

### Code Review Guidelines

- **Review within 24 hours** when possible
- **Check for convention compliance** in branch names and commits
- **Test the changes** locally if needed
- **Provide constructive feedback** with specific suggestions
- **Approve only when confident** in the changes

### Emergency Procedures

```bash
# Revert a problematic commit on main
git revert <commit-hash>
git commit -m "revert: Remove problematic feature X"

# Quick hotfix for production
git checkout main
git checkout -b backend/hotfix/urgent-api-fix
# Make minimal fix
git commit -m "fix(api): Resolve production timeout issue"
# Fast-track PR and deploy
```
