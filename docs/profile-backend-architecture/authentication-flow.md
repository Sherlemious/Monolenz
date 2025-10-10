# Authentication Flow

## Overview

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

## Authentication Implementation

### Frontend: Token Retrieval

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

### Backend: Token Validation

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

## Route Protection

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

## Environment Variables Required

### Frontend (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_API_URL=http://localhost:4000  # or production API URL
```

### Backend (.env)

```bash
DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here  # For backend validation
PORT=4000
NODE_ENV=development
```

---

