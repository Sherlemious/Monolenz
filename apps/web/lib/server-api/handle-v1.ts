import { HTTP_STATUS_CODES } from '@monolenz/types/api';
import { profileSchemas, usernameSchema } from '@monolenz/types/validation';
import { batchVersionUpdateSchema, listBlocksQuerySchema } from '@monolenz/types/validation/block-schemas';
import { z } from 'zod';
import { authService, profileLinkService } from 'api/core';
import { jsonError, jsonFromError, jsonSuccess } from './http';
import { getRequestUser, requireUser, serviceContext } from './auth';
import { getProfileServices } from './services';

const linkInputSchema = z.string().trim().min(1, 'URL is required').max(500, 'URL is too long');
const syncLinksSchema = z.array(
  z.object({
    id: z.number().int().positive().optional(),
    platform_id: z.number().int().positive().nullable().optional(),
    url: linkInputSchema,
    label: z.string().max(100).nullable().optional(),
    is_public: z.boolean().optional(),
    sort_order: z.number().int().min(0).optional(),
  })
);

class UnauthorizedError extends Error {
  statusCode = HTTP_STATUS_CODES.UNAUTHORIZED;
  constructor() {
    super('Authentication required');
    this.name = 'UnauthorizedError';
  }
}

function requiredSegment(segments: string[], index: number) {
  const value = segments[index];
  if (!value) {
    throw new Error('Missing path segment');
  }
  return value;
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function siteUrl(request: Request) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.PUBLIC_SITE_URL ||
    request.headers.get('origin') ||
    'http://localhost:3000'
  );
}

async function requireAuth(request: Request) {
  try {
    return await requireUser(request);
  } catch {
    throw new UnauthorizedError();
  }
}

export async function handleV1Request(request: Request, path: string[]) {
  try {
    const segments = path.filter(Boolean);
    const method = request.method.toUpperCase();

    if (segments[0] === 'auth') {
      return await handleAuth(request, method, segments.slice(1));
    }
    if (segments[0] === 'profiles') {
      return await handleProfiles(request, method, segments.slice(1));
    }

    return jsonError('Not found', HTTP_STATUS_CODES.NOT_FOUND);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonError(error.message, error.statusCode);
    }
    return jsonFromError(error);
  }
}

async function handleAuth(request: Request, method: string, segments: string[]) {
  const route = segments.join('/');

  if (method === 'POST' && route === 'register') {
    const body = (await readJson(request)) as { email?: string; password?: string };
    const result = await authService.register(String(body.email || ''), String(body.password || ''));
    return jsonSuccess(result, 'Account created', HTTP_STATUS_CODES.CREATED);
  }

  if (method === 'POST' && route === 'login') {
    const body = (await readJson(request)) as { email?: string; password?: string };
    const result = await authService.login(String(body.email || ''), String(body.password || ''));
    return jsonSuccess(result, 'Logged in');
  }

  if (method === 'GET' && route === 'me') {
    const user = await requireAuth(request);
    return jsonSuccess({ user }, 'Authenticated');
  }

  if (method === 'POST' && route === 'forgot-password') {
    const body = (await readJson(request)) as { email?: string };
    const result = await authService.requestPasswordReset(String(body.email || ''), siteUrl(request));
    return jsonSuccess(result, 'If that email exists, a reset link was sent.');
  }

  if (method === 'POST' && route === 'reset-password') {
    const body = (await readJson(request)) as { token?: string; password?: string };
    await authService.resetPassword(String(body.token || ''), String(body.password || ''));
    return jsonSuccess(null, 'Password updated');
  }

  return jsonError('Not found', HTTP_STATUS_CODES.NOT_FOUND);
}

async function handleProfiles(request: Request, method: string, segments: string[]) {
  const { profileService, profileRepository, blockService } = getProfileServices();
  const url = new URL(request.url);

  if (method === 'GET' && segments.length === 1 && segments[0] === 'platforms') {
    const platforms = await profileLinkService.listActivePlatforms();
    return jsonSuccess(platforms, 'Platforms retrieved successfully');
  }

  if (method === 'GET' && segments.length === 2 && segments[0] === 'public') {
    const identifier = requiredSegment(segments, 1);
    const user = await getRequestUser(request);
    const profile = await profileService.getProfileByIdentifier(identifier, serviceContext(user, request), {
      includeLinks: true,
      publicOnly: true,
    });
    if (!profile) return jsonError('Profile not found', HTTP_STATUS_CODES.NOT_FOUND);
    return jsonSuccess(profile, 'Public profile retrieved successfully');
  }

  if (method === 'GET' && segments.length === 1 && segments[0] === 'search') {
    const user = await getRequestUser(request);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '10', 10) || 10));
    const result = await profileService.searchProfiles(
      {
        page,
        limit,
        sort: url.searchParams.get('sort') || '',
        order: url.searchParams.get('order') === 'desc' ? 'desc' : 'asc',
        query: url.searchParams.get('search') || url.searchParams.get('query') || undefined,
      },
      serviceContext(user, request)
    );
    return jsonSuccess(result.data, 'Profiles retrieved successfully');
  }

  if (method === 'GET' && segments.length === 3 && segments[0] === 'username' && segments[2] === 'availability') {
    const username = usernameSchema.parse(requiredSegment(segments, 1));
    const user = await getRequestUser(request);
    const available = await profileService.checkUsernameAvailability(username, user?.id);
    return jsonSuccess({ username, available }, available ? 'Username is available' : 'Username is not available');
  }

  if (method === 'GET' && segments.length === 3 && segments[2] === 'latest' && segments[1] === 'versions') {
    const identifier = requiredSegment(segments, 0);
    const user = await getRequestUser(request);
    const profileId = identifier === 'me' ? user?.id : (await profileRepository.findByIdentifier(identifier))?.id;
    if (!profileId) return jsonError('Profile not found', HTTP_STATUS_CODES.NOT_FOUND);
    const version = await blockService.getLatestVersion(profileId);
    if (!version) return jsonError('No versions found for this profile', HTTP_STATUS_CODES.NOT_FOUND);
    const isOwner = Boolean(user?.id && user.id === profileId);
    const blocks = await blockService.listBlocksForVersion(version.id, { publicOnly: !isOwner });
    return jsonSuccess({ version, blocks }, 'Latest version retrieved');
  }

  if (method === 'GET' && segments.length === 4 && segments[1] === 'versions' && segments[3] === 'blocks') {
    const identifier = requiredSegment(segments, 0);
    const versionId = z.coerce.number().int().positive().parse(segments[2]);
    const query = listBlocksQuerySchema.parse({
      section_name: url.searchParams.get('section_name') || url.searchParams.get('section') || undefined,
      block_type: url.searchParams.get('block_type') || undefined,
    });
    const user = await getRequestUser(request);
    const profileId = identifier === 'me' ? user?.id : (await profileRepository.findByIdentifier(identifier))?.id;
    if (!profileId) return jsonError('Profile not found', HTTP_STATUS_CODES.NOT_FOUND);
    await blockService.assertVersionBelongsToProfile(versionId, profileId);
    const isOwner = Boolean(user?.id && user.id === profileId);
    const blocks = await blockService.listBlocksForVersion(versionId, {
      sectionName: query.section_name,
      blockType: query.block_type,
      publicOnly: !isOwner,
    });
    return jsonSuccess(blocks, 'Blocks retrieved successfully');
  }

  if (method === 'POST' && segments.length === 0) {
    const user = await requireAuth(request);
    const profileData = profileSchemas.create.parse(await readJson(request));
    const profile = await profileService.createProfile(profileData, serviceContext(user, request));
    return jsonSuccess(profile, 'Profile created successfully', HTTP_STATUS_CODES.CREATED);
  }

  if (segments[0] === 'me') {
    const user = await requireAuth(request);
    const context = serviceContext(user, request);

    if (method === 'GET' && segments.length === 1) {
      const profile = await profileService.findById(user.id, context);
      if (!profile) return jsonError('Profile not found', HTTP_STATUS_CODES.NOT_FOUND);
      return jsonSuccess(profile, 'Profile retrieved successfully');
    }

    if (method === 'PUT' && segments.length === 1) {
      const updateData = profileSchemas.update.parse(await readJson(request));
      const profile = await profileService.updateProfile(user.id, updateData, context);
      return jsonSuccess(profile, 'Profile updated successfully');
    }

    if (method === 'DELETE' && segments.length === 1) {
      await profileService.delete(user.id, context, { soft: true });
      return jsonSuccess(null, 'Profile deleted successfully');
    }

    if (method === 'GET' && segments.length === 2 && segments[1] === 'links') {
      const links = await profileLinkService.getLinksForProfile(user.id);
      return jsonSuccess(links, 'Profile links retrieved successfully');
    }

    if (method === 'PUT' && segments.length === 2 && segments[1] === 'links') {
      const links = syncLinksSchema.parse(await readJson(request));
      const result = await profileLinkService.syncProfileLinks(user.id, links);
      return jsonSuccess(result, 'Profile links updated successfully');
    }

    if (method === 'POST' && segments.length === 2 && segments[1] === 'versions') {
      const { creations, updates, deletions } = batchVersionUpdateSchema.parse(await readJson(request));
      const result = await blockService.applyVersionUpdate(
        {
          profileId: user.id,
          creations: creations.map((c) => ({
            blockType: c.block_type,
            data: c.data,
            sectionName: c.section_name,
            sortOrder: c.sort_order,
            isVisible: c.is_visible,
          })),
          updates: updates.map((u) => ({
            parentBlockId: u.parent_block_id,
            blockType: u.block_type,
            data: u.data,
            sectionName: u.section_name,
            sortOrder: u.sort_order,
            isVisible: u.is_visible,
          })),
          deletions,
        },
        context
      );
      return jsonSuccess(result, 'Version updated successfully');
    }
  }

  if (method === 'GET' && segments.length === 1) {
    const user = await requireAuth(request);
    const identifier = requiredSegment(segments, 0);
    const includeLinks = url.searchParams.get('include_links') === 'true';
    const profile = await profileService.getProfileByIdentifier(identifier, serviceContext(user, request), {
      includeLinks,
      publicOnly: !user.id,
    });
    if (!profile) return jsonError('Profile not found', HTTP_STATUS_CODES.NOT_FOUND);
    return jsonSuccess(profile, 'Profile retrieved successfully');
  }

  return jsonError('Not found', HTTP_STATUS_CODES.NOT_FOUND);
}
