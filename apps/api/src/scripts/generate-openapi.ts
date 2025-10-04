import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { profileDataSchema } from '@monolenz/types/validation';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { z } from 'zod';

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

// Create registry
const registry = new OpenAPIRegistry();

// Register security schemes
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Supabase JWT token. Include as "Bearer <token>" in Authorization header',
});

// Define response schema with metadata
const profileResponseSchema = profileDataSchema.extend({
  id: z.string().uuid().openapi({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Profile ID (same as user ID)',
  }),
  created_at: z.string().datetime().openapi({
    example: '2024-01-01T12:00:00Z',
    description: 'Profile creation timestamp',
  }),
  updated_at: z.string().datetime().openapi({
    example: '2024-01-01T12:00:00Z',
    description: 'Profile last update timestamp',
  }),
});

// Create schemas for requests  
const profileCreateSchema = profileDataSchema.required({ username: true });
const profileUpdateSchema = profileDataSchema.partial();

// Register Profile Endpoints

// POST /v1/profiles - Create Profile
registry.registerPath({
  method: 'post',
  path: '/v1/profiles',
  tags: ['Profiles'],
  summary: 'Create Profile',
  description: 'Create a new profile for the authenticated user',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: profileCreateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Profile created successfully',
      content: {
        'application/json': {
          schema: profileResponseSchema,
        },
      },
    },
    400: {
      description: 'Bad request - validation failed',
    },
    401: {
      description: 'Unauthorized - authentication required',
    },
    409: {
      description: 'Conflict - username already exists',
    },
  },
});

// GET /v1/profiles/me - Get My Profile
registry.registerPath({
  method: 'get',
  path: '/v1/profiles/me',
  tags: ['Profiles'],
  summary: 'Get My Profile',
  description: "Get the authenticated user's profile",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Profile retrieved successfully',
      content: {
        'application/json': {
          schema: profileResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized',
    },
    404: {
      description: 'Profile not found',
    },
  },
});

// PUT /v1/profiles/me - Update My Profile
registry.registerPath({
  method: 'put',
  path: '/v1/profiles/me',
  tags: ['Profiles'],
  summary: 'Update My Profile',
  description: "Update the authenticated user's profile",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: profileUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Profile updated successfully',
      content: {
        'application/json': {
          schema: profileResponseSchema,
        },
      },
    },
    400: {
      description: 'Bad request - validation failed',
    },
    401: {
      description: 'Unauthorized',
    },
    404: {
      description: 'Profile not found',
    },
    409: {
      description: 'Conflict - username already exists',
    },
  },
});

// DELETE /v1/profiles/me - Delete My Profile
registry.registerPath({
  method: 'delete',
  path: '/v1/profiles/me',
  tags: ['Profiles'],
  summary: 'Delete My Profile',
  description: "Soft delete the authenticated user's profile",
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Profile deleted successfully',
    },
    401: {
      description: 'Unauthorized',
    },
    404: {
      description: 'Profile not found',
    },
  },
});

// GET /v1/profiles/{identifier} - Get Profile by Identifier
registry.registerPath({
  method: 'get',
  path: '/v1/profiles/{identifier}',
  tags: ['Profiles'],
  summary: 'Get Profile by Identifier',
  description: 'Get a profile by username or ID (authenticated users see more details)',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      identifier: z.string().min(1).describe('Username or user ID'),
    }),
    query: z.object({
      include_links: z.enum(['true', 'false']).optional().describe('Include profile links'),
    }),
  },
  responses: {
    200: {
      description: 'Profile retrieved successfully',
      content: {
        'application/json': {
          schema: profileResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized',
    },
    404: {
      description: 'Profile not found',
    },
  },
});

// GET /v1/profiles/public/{identifier} - Get Public Profile
const publicProfileSchema = profileDataSchema.pick({
  username: true,
  bio: true,
  portfolio_url: true,
  profile_picture_url: true,
});

registry.registerPath({
  method: 'get',
  path: '/v1/profiles/public/{identifier}',
  tags: ['Profiles'],
  summary: 'Get Public Profile',
  description: "Get a user's public profile by username or ID (no authentication required)",
  request: {
    params: z.object({
      identifier: z.string().min(1).describe('Username or user ID'),
    }),
  },
  responses: {
    200: {
      description: 'Public profile retrieved successfully',
      content: {
        'application/json': {
          schema: publicProfileSchema,
        },
      },
    },
    404: {
      description: 'Profile not found',
    },
  },
});

// GET /v1/profiles/search - Search Profiles
registry.registerPath({
  method: 'get',
  path: '/v1/profiles/search',
  tags: ['Profiles'],
  summary: 'Search Profiles',
  description: 'Search for profiles with optional filters',
  security: [{ bearerAuth: [] }],
  request: {
    query: z.object({
      search: z.string().optional().describe('Search query string'),
      query: z.string().optional().describe('Alternative search query parameter'),
      page: z.string().optional().describe('Page number (1-based)'),
      limit: z.string().optional().describe('Number of items per page'),
      sort: z.string().optional().describe('Field to sort by'),
      order: z.enum(['asc', 'desc']).optional().describe('Sort order'),
    }),
  },
  responses: {
    200: {
      description: 'Profiles retrieved successfully (paginated)',
    },
  },
});

// GET /v1/profiles/username/{username}/availability - Check Username Availability
registry.registerPath({
  method: 'get',
  path: '/v1/profiles/username/{username}/availability',
  tags: ['Profiles'],
  summary: 'Check Username Availability',
  description: 'Check if a username is available for registration',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({
      username: z
        .string()
        .min(3)
        .max(50)
        .regex(/^[a-zA-Z0-9_-]+$/)
        .describe('Username to check'),
    }),
  },
  responses: {
    200: {
      description: 'Username availability checked',
    },
    400: {
      description: 'Bad request - invalid username format',
    },
  },
});

// Generate OpenAPI document
const generator = new OpenApiGeneratorV3(registry.definitions);
const document = generator.generateDocument({
  openapi: '3.0.3',
  info: {
    title: 'Athaar API',
    version: '1.0.0',
    description: `Resume and portfolio management platform API.

## Authentication
This API uses Bearer token authentication via Supabase. Include the token in the Authorization header:
\`\`\`
Authorization: Bearer <your-token>
\`\`\`

## Response Format
All responses follow a standard format:
\`\`\`json
{
  "success": boolean,
  "message": string,
  "data": object | null,
  "errors": array (optional),
  "meta": {
    "timestamp": string,
    "requestId": string,
    "version": string,
    "pagination": object (for paginated responses)
  }
}
\`\`\``,
    contact: {
      name: 'API Support',
      url: 'https://github.com/youssef/athaar',
    },
    license: {
      name: 'MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3001/api',
      description: 'Local development server',
    },
    {
      url: 'https://api.athaar.com/api',
      description: 'Production server',
    },
  ],
  tags: [
    {
      name: 'Profiles',
      description: 'Profile management endpoints',
    },
    {
      name: 'Authentication',
      description: 'Authentication endpoints (handled by Supabase)',
    },
    {
      name: 'System',
      description: 'Health checks and system information',
    },
  ],
});

// Write to file
const outputPath = path.join(__dirname, '../../../../docs/api/openapi.yaml');
const outputDir = path.dirname(outputPath);

// Ensure directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write YAML file
fs.writeFileSync(outputPath, YAML.stringify(document));

console.log('✅ OpenAPI spec generated successfully!');
console.log(`📄 Location: ${outputPath}`);
console.log('');
console.log('Next steps:');
console.log('  1. Review the generated spec at docs/api/openapi.yaml');
console.log('  2. View docs: Upload to https://editor.swagger.io/');
console.log('  3. Or install Swagger UI: pnpm add swagger-ui-express');
