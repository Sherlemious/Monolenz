# 7. Error Handling Architecture

## 7.1 Error Classification

**Type 1: Client-Side Validation Errors**
- **When**: Before API call, during form interaction
- **Display**: Inline below field (red text)
- **Example**: "Username must be at least 3 characters"

**Type 2: API Validation Errors (422)**
- **When**: Server rejects data after submission
- **Display**: Inline field errors + toast summary
- **Example**: Backend validates URL format differently

**Type 3: Business Logic Errors (409)**
- **When**: Constraint violation (username taken)
- **Display**: Inline error + toast notification
- **Action**: Reopen form, focus affected field

**Type 4: Authentication Errors (401)**
- **When**: Token expired/invalid or email unconfirmed
- **Display**: Toast message
- **Action**: Redirect to login OR show "Confirm email" message

**Type 5: Server/Network Errors (500, Network)**
- **When**: Server error or connection failure
- **Display**: Toast with retry button
- **Action**: Maintain form state, allow retry

## 7.2 Error Handling Implementation

**Central Error Handler**:
```typescript
// lib/utils/error-handler.ts (NEW)
export function handleProfileError(
  error: unknown,
  context: 'create' | 'update' | 'fetch'
): {
  type: 'inline' | 'toast' | 'redirect';
  message: string;
  fieldErrors?: Record<string, string>;
  action?: () => void;
} {
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 401:
        if (error.message.includes('Email not confirmed')) {
          return {
            type: 'toast',
            message: 'Please confirm your email address to continue',
          };
        }
        return {
          type: 'redirect',
          message: 'Session expired. Please log in again.',
          action: () => router.push('/login'),
        };
      
      case 404:
        return {
          type: 'inline',
          message: 'Profile not found',
        };
      
      case 409:
        return {
          type: 'inline',
          message: 'Username is already taken',
          fieldErrors: { username: 'This username is not available' },
        };
      
      case 422:
        const fieldErrors = error.errors.reduce((acc, err) => {
          acc[err.field] = err.message;
          return acc;
        }, {} as Record<string, string>);
        
        return {
          type: 'inline',
          message: 'Please correct the errors and try again',
          fieldErrors,
        };
      
      case 500:
      default:
        return {
          type: 'toast',
          message: 'Something went wrong. Please try again.',
          action: () => window.location.reload(),
        };
    }
  }
  
  // Network error
  return {
    type: 'toast',
    message: 'Network error. Please check your connection.',
    action: () => window.location.reload(),
  };
}
```

**Usage in Components**:
```typescript
try {
  await profileApi.createProfile(data);
} catch (error) {
  const handled = handleProfileError(error, 'create');
  
  if (handled.type === 'inline') {
    setErrors(handled.fieldErrors || {});
    toast.error(handled.message);
  } else if (handled.type === 'toast') {
    toast.error(handled.message, {
      action: handled.action ? {
        label: 'Retry',
        onClick: handled.action,
      } : undefined,
    });
  } else if (handled.type === 'redirect') {
    toast.error(handled.message);
    handled.action?.();
  }
}
```

---

