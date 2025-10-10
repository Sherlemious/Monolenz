# API Specifications

## Base Configuration

**API Base URL**: `process.env.NEXT_PUBLIC_API_URL` (default: `http://localhost:4000`)  
**API Version**: v1  
**Authentication**: Bearer token (Supabase JWT)

## Standard Response Format

All API responses follow this structure:

```typescript
{
  "success": boolean,
  "message": string,
  "data": T,                    // Response payload
  "meta": {
    "timestamp": string,        // ISO 8601
    "requestId": string,        // UUID
    "version": string           // API version
  }
}
```

## Error Response Format

```typescript
{
  "success": false,
  "message": string,
  "errors": [
    {
      "field": string,
      "message": string
    }
  ]
}
```

---

## Profile API Endpoints

### 1. Get Current User's Profile

**Endpoint**: `GET /api/v1/profiles/me`  
**Authentication**: Required (Bearer token)  
**Purpose**: Retrieve authenticated user's profile

**Request Headers**:
```
Authorization: Bearer <supabase_jwt_token>
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "5846fa80-579f-40f0-aab7-d7fc4184b822",
    "username": "sherlemious",
    "bio": "medhat saleh is a cool dude ngl",
    "profile_picture_url": "https://www.duenduejdu.com/jdueduu",
    "linkedin_url": "https://www.linkedin.com/sherlemious",
    "github_url": "https://www.github.com/sherlemious",
    "portfolio_url": "https://www.sherlemious.com",
    "created_at": "2025-07-29T19:06:10.993Z",
    "updated_at": "2025-09-04T16:44:08.940Z"
  },
  "meta": {
    "timestamp": "2025-09-04T16:55:02.758Z",
    "requestId": "bf3d0527-01ce-477c-a988-3118d4990e18",
    "version": "1.0.0"
  }
}
```

**Error Response - Not Found** (404):
```json
{
  "success": false,
  "message": "Profile not found",
  "errors": []
}
```

**Error Response - Unauthorized** (401):
```json
{
  "success": false,
  "message": "Authentication required",
  "errors": [
    {
      "field": "authorization",
      "message": "Bearer token required"
    }
  ]
}
```

⚠️ **CRITICAL NOTE**: This endpoint may return 404 if:
- User just signed up and hasn't created a profile yet
- Profile was soft-deleted
- Frontend MUST handle null/404 state gracefully

---

### 2. Update Current User's Profile

**Endpoint**: `PUT /api/v1/profiles/me`  
**Authentication**: Required (Bearer token)  
**Purpose**: Update authenticated user's profile (partial updates supported)

**Request Headers**:
```
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json
```

**Request Body** (all fields optional):
```json
{
  "username": "sherlemious",
  "bio": "medhat saleh is a cool dude ngl",
  "profile_picture_url": "https://www.duenduejdu.com/jdueduu",
  "linkedin_url": "https://www.linkedin.com/sherlemious",
  "github_url": "https://www.github.com/sherlemious",
  "portfolio_url": "https://www.sherlemious.com"
}
```

**Validation Rules**:
- `username`: 3-50 characters, alphanumeric + underscore/hyphen only
- `bio`: Max 500 characters
- `profile_picture_url`: Valid URL format
- `linkedin_url`: Valid URL format
- `github_url`: Valid URL format
- `portfolio_url`: Valid URL format
- Empty strings are converted to `null`

**Success Response** (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "5846fa80-579f-40f0-aab7-d7fc4184b822",
    "username": "sherlemious",
    "bio": "medhat saleh is a cool dude ngl",
    "profile_picture_url": "https://www.duenduejdu.com/jdueduu",
    "linkedin_url": "https://www.linkedin.com/sherlemious",
    "github_url": "https://www.github.com/sherlemious",
    "portfolio_url": "https://www.sherlemious.com",
    "created_at": "2025-07-29T19:06:10.993Z",
    "updated_at": "2025-09-04T16:44:08.940Z"
  },
  "meta": {
    "timestamp": "2025-09-04T16:55:02.758Z",
    "requestId": "bf3d0527-01ce-477c-a988-3118d4990e18",
    "version": "1.0.0"
  }
}
```

**Error Response - Validation** (422):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "username",
      "message": "Username must be at least 3 characters"
    }
  ]
}
```

**Error Response - Username Conflict** (409):
```json
{
  "success": false,
  "message": "Username is already taken",
  "errors": []
}
```

---

### 3. Create Profile

**Endpoint**: `POST /api/v1/profiles`  
**Authentication**: Required (Bearer token)  
**Purpose**: Create initial profile for authenticated user

**Request Body** (username required, others optional):
```json
{
  "username": "newuser123",
  "bio": "Optional bio",
  "profile_picture_url": "https://example.com/avatar.jpg",
  "linkedin_url": "https://linkedin.com/in/newuser",
  "github_url": "https://github.com/newuser",
  "portfolio_url": "https://newuser.dev"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "id": "5846fa80-579f-40f0-aab7-d7fc4184b822",
    "username": "newuser123",
    "bio": "Optional bio",
    "profile_picture_url": "https://example.com/avatar.jpg",
    "linkedin_url": "https://linkedin.com/in/newuser",
    "github_url": "https://github.com/newuser",
    "portfolio_url": "https://newuser.dev",
    "created_at": "2025-10-07T12:00:00.000Z",
    "updated_at": "2025-10-07T12:00:00.000Z"
  },
  "meta": {
    "timestamp": "2025-10-07T12:00:00.000Z",
    "requestId": "uuid-here",
    "version": "1.0.0"
  }
}
```

---

### 4. Delete Profile

**Endpoint**: `DELETE /api/v1/profiles/me`  
**Authentication**: Required (Bearer token)  
**Purpose**: Soft delete authenticated user's profile

⚠️ **NOTE**: This is a **soft delete** - profile is not physically removed from database

**Success Response** (200):
```json
{
  "success": true,
  "message": "Profile deleted successfully",
  "data": null,
  "meta": {
    "timestamp": "2025-10-07T12:00:00.000Z",
    "requestId": "uuid-here",
    "version": "1.0.0"
  }
}
```

---

### 5. Check Username Availability

**Endpoint**: `GET /api/v1/profiles/username/:username/availability`  
**Authentication**: Optional (better UX if authenticated)  
**Purpose**: Check if username is available before creation/update

**Example**: `GET /api/v1/profiles/username/testuser/availability`

**Success Response** (200):
```json
{
  "success": true,
  "message": "Username is available",
  "data": {
    "username": "testuser",
    "available": true
  },
  "meta": {
    "timestamp": "2025-10-07T12:00:00.000Z",
    "requestId": "uuid-here",
    "version": "1.0.0"
  }
}
```

---

### 6. Get Profile by Identifier

**Endpoint**: `GET /api/v1/profiles/:identifier`  
**Authentication**: Optional (shows limited data if not authenticated)  
**Purpose**: Get any user's profile by username or ID

**Query Parameters**:
- `include_links`: "true" | "false" (default: false)

**Example**: `GET /api/v1/profiles/sherlemious?include_links=true`

**Success Response** (200): Same format as "Get My Profile"

⚠️ **Privacy Filters**: 
- If not authenticated or not owner: Only shows public fields (username, bio, portfolio_url, profile_picture_url)
- linkedin_url and github_url are hidden for non-owners

---

### 7. Search Profiles

**Endpoint**: `GET /api/v1/profiles/search`  
**Authentication**: Optional  
**Purpose**: Search profiles by username or bio

**Query Parameters**:
- `search` or `query`: Search term
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)
- `sort`: Sort field (default: created_at)
- `order`: "asc" | "desc" (default: desc)

**Example**: `GET /api/v1/profiles/search?query=developer&limit=20`

**Success Response** (200):
```json
{
  "success": true,
  "message": "Profiles retrieved successfully",
  "data": [
    { /* profile object */ },
    { /* profile object */ }
  ],
  "meta": {
    "timestamp": "2025-10-07T12:00:00.000Z",
    "requestId": "uuid-here",
    "version": "1.0.0",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42
    }
  }
}
```

---

