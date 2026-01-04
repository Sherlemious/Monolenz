# Monolenz API Documentation

Interactive API documentation for testing endpoints with [Bruno](https://usebruno.com).

## Quick Start

1. **Install Bruno** - Download from [usebruno.com](https://usebruno.com)
2. **Open Collection** - File → Open Collection → Select this `docs` folder
3. **Set Environment** - Click environment dropdown → Select "Local"
4. **Get Token** - Run `auth/Login` request first (auto-saves token!)
5. **Test Endpoints** - Run any request!

## Authentication

The collection includes a **Login** request that auto-saves the JWT token.

### Setup (First Time Only)

1. Open `auth/login.bru`
2. Update the `apikey` header with your Supabase anon key  
   (Find in: Supabase Dashboard → Settings → API → anon/public key)

### Getting a Token

1. Run `auth/Login (Get Token)` request
2. ✅ Token is automatically saved to `testJWT` variable
3. All authenticated requests will use this token

> **Token expires in ~1 hour.** Re-run Login to refresh.

## Environment Variables

| Variable       | Description                                 |
| -------------- | ------------------------------------------- |
| `link`         | Base API URL (`http://localhost:3001/api`)  |
| `v1link`       | V1 API URL (`http://localhost:3001/api/v1`) |
| `supabaseUrl`  | Supabase project URL                        |
| `testEmail`    | Test user email                             |
| `testPassword` | Test user password                          |
| `testJWT`      | Auth token (auto-populated by Login)        |

## API Overview

| Base URL     | `http://localhost:8080/api/v1` |
| ------------ | ------------------------------ |
| Auth         | Supabase JWT Bearer Token      |
| Content-Type | `application/json`             |

### Response Format

```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "uuid",
    "version": "1.0.0"
  }
}
```

## Endpoints

### Auth

- `POST /auth/v1/token` - Login (Supabase)
- `GET /auth` - Info

### Profiles

- `POST /profiles` - Create profile
- `GET /profiles/me` - Get my profile
- `PUT /profiles/me` - Update my profile
- `DELETE /profiles/me` - Delete my profile
- `GET /profiles/:identifier` - Get by ID/username
- `GET /profiles/public/:identifier` - Get public profile
- `GET /profiles/search` - Search profiles
- `GET /profiles/username/:username/availability` - Check username
- See `profiles/profile-links.bru` - Guide for working with profile links

### Blocks

- `GET /profiles/:id/versions/latest` - Get latest version
- `GET /profiles/:id/versions/:versionId/blocks` - List blocks
- `POST /profiles/me/versions` - Batch update blocks
- See `blocks/create-work-experience.bru` - Detailed guide for creating work experience
- See `blocks/create-education.bru` - Detailed guide for creating education entries

## Block Types

| Type              | Description         |
| ----------------- | ------------------- |
| `work_experience` | Employment history  |
| `education`       | Education & degrees |
| `skill`           | Skills              |
| `project`         | Projects            |
| `certification`   | Certifications      |
| `language`        | Languages           |
| `volunteer`       | Volunteer work      |
| `award`           | Awards              |

## Running the API

```bash
cd apps/api
pnpm dev
```
