# Monolenz API Documentation

Interactive API documentation for testing endpoints with [Bruno](https://usebruno.com).

## Quick Start

1. **Install Bruno** - Download from [usebruno.com](https://usebruno.com)
2. **Open Collection** - File → Open Collection → Select this `docs` folder
3. **Set Environment** - Click environment dropdown → Select "Local"
4. **Get Token** - Run `auth/Login` request first (auto-saves token!)
5. **Test Endpoints** - Run any request!

## Authentication

The collection includes a **Login** request that auto-saves the JWT token from `POST /api/v1/auth/login`.

## Environment Variables

| Variable       | Description                                 |
| -------------- | ------------------------------------------- |
| `link`         | Base API URL (`http://localhost:4000/api`)  |
| `v1link`       | V1 API URL (`http://localhost:4000/api/v1`) |
| `testEmail`    | Test user email                             |
| `testPassword` | Test user password                          |
| `testJWT`      | Auth token (auto-populated by Login)        |

## API Overview

| Base URL     | `http://localhost:4000/api/v1`      |
| ------------ | ----------------------------------- |
| Auth         | JWT Bearer token from `/auth/login` |
| Content-Type | `application/json`                  |

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

### API Info

- `GET /api/` - Root API information (see `api-info.bru`)
- `GET /api/v1/` - V1 API information (see `v1-info.bru`)

### Auth

- `POST /auth/v1/token` - Login (Supabase)
- `GET /api/v1/auth` - Auth info (see `auth/info.bru`)

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

- `GET /profiles/:id/versions/latest` - Get latest version (see `blocks/get-latest-version.bru`)
- `GET /profiles/:id/versions/:versionId/blocks` - List blocks (see `blocks/list-blocks-for-version.bru`)
- `POST /profiles/me/versions` - Batch update blocks (see `blocks/batch-update-blocks.bru`)

## Block Types

All block types are created using the batch update endpoint (`POST /profiles/me/versions`). Each block type has a detailed creation guide:

| Type              | Description         | Creation Guide                      |
| ----------------- | ------------------- | ----------------------------------- |
| `work_experience` | Employment history  | `blocks/create-work-experience.bru` |
| `education`       | Education & degrees | `blocks/create-education.bru`       |
| `skill`           | Skills              | `blocks/create-skill.bru`           |
| `project`         | Projects            | `blocks/create-project.bru`         |
| `certification`   | Certifications      | `blocks/create-certification.bru`   |
| `language`        | Languages           | `blocks/create-language.bru`        |
| `volunteer`       | Volunteer work      | `blocks/create-volunteer.bru`       |
| `award`           | Awards              | `blocks/create-award.bru`           |

## Running the API

```bash
cd apps/api
pnpm dev
```
