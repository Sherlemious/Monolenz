# 4. API Integration Layer

## 4.1 Authentication Flow

**Automatic Token Injection** (Existing - No changes):

```typescript
// lib/api/client.ts (EXISTING)
import { createClient as createSupabaseBrowserClient } from '@/utils/supabase/client';

export function createBrowserApiClient(baseInit?: RequestInit) {
  const supabase = createSupabaseBrowserClient();
  
  return createApiClientWithTokenProvider(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;  // JWT token
  }, baseInit);
}
```

**Process**:
1. Component calls `profileApi.getMyProfile()`
2. `createBrowserApiClient()` retrieves Supabase session
3. Extracts JWT token from session
4. Adds `Authorization: Bearer <token>` header
5. Makes API request
6. Backend validates token via middleware

**No Manual Token Handling Required** ✅

## 4.2 API Client Methods

**Location**: `lib/api/profile.ts`

**Existing Methods** (Keep):
- `getMyProfile()` - GET /api/v1/profiles/me
- `updateProfile(data)` - PUT /api/v1/profiles/me
- `getProfile(identifier)` - GET /api/v1/profiles/:identifier
- `checkUsername(username)` - GET /api/v1/profiles/username/:username/availability

**New Method Required** (Story 1.3):
```typescript
createProfile: async (data: ProfileCreateData): Promise<BasicProfile> => {
  const client = createBrowserApiClient();
  const response = await client.post<ApiResponse<BasicProfile>>(
    '/api/v1/profiles',
    data
  );
  
  if (!response.success) {
    throw new ApiError(response.message, response.errors);
  }
  
  return response.data;
}
```

## 4.3 Error Transformation

**API Error Structure** (from backend):
```typescript
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "username", "message": "Username must be at least 3 characters" }
  ]
}
```

**Frontend Error Handler**:
```typescript
// lib/utils/api-errors.ts (NEW)
export class ApiError extends Error {
  constructor(
    message: string,
    public errors: Array<{ field: string; message: string }> = [],
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): void {
  if (error instanceof ApiError) {
    // Field-specific errors
    if (error.errors.length > 0) {
      error.errors.forEach(err => {
        toast.error(`${err.field}: ${err.message}`);
      });
    } else {
      toast.error(error.message);
    }
  } else if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error('An unexpected error occurred');
  }
}
```

**HTTP Status Code Mapping** (Story 1.7):

| Status | Error Type | Frontend Handling |
|--------|-----------|-------------------|
| **401** | Unauthorized | Redirect to `/login` if "Invalid token"<br>Toast "Confirm your email" if "Email not confirmed" |
| **404** | Not Found | Show empty state with "Create Profile" CTA |
| **409** | Conflict | Show inline error "Username taken", reopen form |
| **422** | Validation | Display field errors inline, keep form open |
| **500** | Server Error | Toast "Something went wrong" with retry button |
| **Network** | Connection | Toast "Check your connection" with retry |

---

