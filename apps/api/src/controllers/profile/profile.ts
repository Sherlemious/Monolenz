import { Request, Response } from 'express';
import { ProfileService } from '../../services/domain/profile.service';
import { ProfileRepository } from '../../repositories/profile/profile';
import { ProfileLinkRepository, SyncLinkInput } from '../../repositories/profile/profile-link.repository';
import { s3UploadService } from '../../services/domain/s3-upload.service';
import { prisma } from '../../config/prisma';
import { asyncHandler } from '../../utils/async-handler';
import { ServiceContext } from '../../services/base.service';
import { HTTP_STATUS_CODES } from '@monolenz/types/api';
import { ProfileCreateData, ProfileUpdateData } from '@monolenz/types/validation';

const profileRepository = new ProfileRepository(prisma);
const profileService = new ProfileService(profileRepository);
const profileLinkRepository = new ProfileLinkRepository(prisma);
const ALLOWED_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

function hasExplicitProtocol(value: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value);
}

function buildPrimaryPlatformPath(value: string, platformName: string): string {
  const cleaned = value.replace(/^\/+|\/+$/g, '');
  const bare = cleaned.replace(/^@/, '');

  if (!cleaned) {
    return cleaned;
  }

  if (cleaned.includes('/')) {
    return cleaned;
  }

  switch (platformName) {
    case 'linkedin':
      return `in/${bare}`;
    case 'tiktok':
    case 'youtube':
    case 'medium':
      return `@${bare}`;
    default:
      return cleaned;
  }
}

function normalizeLinkInput(rawValue: string, platform?: { name: string; base_url: string | null }): string {
  const value = rawValue.trim();
  if (!value) {
    return value;
  }

  if (hasExplicitProtocol(value)) {
    return value;
  }

  // Email convenience: allow plain address for email links.
  if ((platform?.name === 'email' || !platform?.base_url) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return `mailto:${value}`;
  }

  if (platform?.base_url) {
    const baseUrl = new URL(platform.base_url);
    const candidate = value.startsWith('/')
      ? `${baseUrl.origin}${value}`
      : value.includes('.') || value.startsWith('www.')
        ? `https://${value.replace(/^\/+/, '')}`
        : null;

    if (candidate) {
      try {
        const parsed = new URL(candidate);
        if (parsed.hostname === baseUrl.hostname || parsed.hostname.endsWith(`.${baseUrl.hostname}`)) {
          const path = `${parsed.pathname}${parsed.search}${parsed.hash}`.replace(/^\/+/, '');
          return path ? `${baseUrl.origin}/${path}` : baseUrl.origin;
        }
        return parsed.toString();
      } catch {
        // Fall through to handle-style normalization.
      }
    }

    const normalizedPath = buildPrimaryPlatformPath(value, platform.name);
    return `${baseUrl.origin}/${normalizedPath}`;
  }

  return `https://${value.replace(/^\/+/, '')}`;
}

/**
 * Profile Controller
 * Handles HTTP requests for profile operations
 */
class ProfileController {
  /**
   * Create a new profile
   * POST /api/v1/profiles
   */
  createProfile = asyncHandler(async (req: Request, res: Response) => {
    const context: ServiceContext = {
      userId: req.userId,
      userRole: req.userRole,
      requestId: req.requestId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };

    const profileData: ProfileCreateData = req.validatedBody;

    const profile = await profileService.createProfile(profileData, context);

    return res.success(profile, 'Profile created successfully');
  });

  /**
   * Get current user's profile
   * GET /api/v1/profiles/me
   */
  getMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const context: ServiceContext = {
      userId: req.userId,
      userRole: req.userRole,
      requestId: req.requestId,
    };

    const profile = await profileService.findById(req.userId!, context);

    if (!profile) {
      return res.error('Profile not found', HTTP_STATUS_CODES.NOT_FOUND);
    }

    return res.success(profile, 'Profile retrieved successfully');
  });

  /**
   * Update current user's profile
   * PUT /api/v1/profiles/me
   */
  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const context: ServiceContext = {
      userId: req.userId,
      userRole: req.userRole,
      requestId: req.requestId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };

    const updateData: ProfileUpdateData = req.validatedBody;

    const profile = await profileService.updateProfile(req.userId!, updateData, context);

    return res.success(profile, 'Profile updated successfully');
  });

  /**
   * Soft-delete current user's profile
   * DELETE /api/v1/profiles/me
   */
  deleteProfile = asyncHandler(async (req: Request, res: Response) => {
    const context: ServiceContext = {
      userId: req.userId,
      userRole: req.userRole,
      requestId: req.requestId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };

    await profileService.delete(req.userId!, context, { soft: true });

    return res.success(null, 'Profile deleted successfully');
  });

  /**
   * Get profile by identifier (ID or username)
   * GET /api/v1/profiles/:identifier
   */
  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const { identifier } = req.validatedParams;
    const includeLinks = req.query.include_links === 'true';

    const context: ServiceContext = {
      userId: req.userId,
      userRole: req.userRole,
      requestId: req.requestId,
    };

    const profile = await profileService.getProfileByIdentifier(identifier, context, {
      includeLinks,
      publicOnly: !req.userId, // Show limited data for non-authenticated users
    });

    if (!profile) {
      return res.error('Profile not found', HTTP_STATUS_CODES.NOT_FOUND);
    }

    return res.success(profile, 'Profile retrieved successfully');
  });

  /**
   * Get public profile by identifier (for public access)
   * GET /api/v1/profiles/public/:identifier
   */
  getPublicProfile = asyncHandler(async (req: Request, res: Response) => {
    const { identifier } = req.validatedParams;

    const context: ServiceContext = {
      userId: req.userId, // May be undefined for public access
      userRole: req.userRole,
      requestId: req.requestId,
    };

    const profile = await profileService.getProfileByIdentifier(identifier, context, {
      includeLinks: true,
      publicOnly: true,
    });

    if (!profile) {
      return res.error('Profile not found', HTTP_STATUS_CODES.NOT_FOUND);
    }

    return res.success(profile, 'Public profile retrieved successfully');
  });

  /**
   * Search profiles
   * GET /api/v1/profiles/search
   */
  searchProfiles = asyncHandler(async (req: Request, res: Response) => {
    const context: ServiceContext = {
      userId: req.userId,
      userRole: req.userRole,
      requestId: req.requestId,
    };

    const searchParams = {
      ...req.pagination,
      query: req.searchParams.search || req.searchParams.query,
      filters: req.searchParams.filters,
    };

    const result = await profileService.searchProfiles(searchParams, context);

    return res.paginated(result.data, result.total, 'Profiles retrieved successfully');
  });

  /**
   * Request a presigned URL for uploading a profile avatar to S3
   * GET /api/v1/profiles/me/avatar/upload-url?contentType=image/jpeg&fileSize=102400
   */
  requestAvatarUploadUrl = asyncHandler(async (req: Request, res: Response) => {
    const context: ServiceContext = {
      userId: req.userId,
      userRole: req.userRole,
      requestId: req.requestId,
    };

    const { contentType, fileSize } = req.validatedQuery as { contentType: string; fileSize: number };

    // Fetch current profile to schedule old avatar deletion
    const currentProfile = await profileService.findById(req.userId!, context);
    const oldS3Key = currentProfile?.profile_picture_url
      ? s3UploadService.extractS3Key(currentProfile.profile_picture_url)
      : null;

    const { uploadUrl, objectUrl } = await s3UploadService.generateAvatarPresignedUrl({
      userId: req.userId!,
      contentType,
      fileSize,
    });

    // Fire-and-forget deletion of the previous avatar
    if (oldS3Key) {
      s3UploadService.deleteObject(oldS3Key).catch(() => {});
    }

    return res.success({ uploadUrl, objectUrl }, 'Upload URL generated');
  });

  /**
   * Check username availability
   * GET /api/v1/profiles/username/:username/availability
   */
  checkUsername = asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.validatedParams;
    const excludeId = req.userId; // Exclude current user when checking

    const isAvailable = await profileService.checkUsernameAvailability(username, excludeId);

    return res.success(
      {
        username,
        available: isAvailable,
      },
      isAvailable ? 'Username is available' : 'Username is not available'
    );
  });

  /**
   * Get current user's profile links
   * GET /api/v1/profiles/me/links
   */
  getMyLinks = asyncHandler(async (req: Request, res: Response) => {
    const links = await profileLinkRepository.findByProfileId(req.userId!);
    return res.success(links, 'Profile links retrieved successfully');
  });

  /**
   * Sync (bulk replace) current user's profile links
   * PUT /api/v1/profiles/me/links
   */
  syncMyLinks = asyncHandler(async (req: Request, res: Response) => {
    const links: SyncLinkInput[] = req.validatedBody ?? [];
    const platformIds = [...new Set(links.map((link) => link.platform_id).filter((id): id is number => id != null))];
    const platforms = platformIds.length > 0 ? await profileLinkRepository.getPlatformsByIds(platformIds) : [];
    const platformById = new Map(platforms.map((platform) => [platform.id, platform]));

    const normalizedLinks = links.map((link) => {
      if (link.platform_id == null) {
        return { ...link, url: normalizeLinkInput(link.url, undefined) };
      }

      const platform = platformById.get(link.platform_id);
      return {
        ...link,
        url: normalizeLinkInput(link.url, platform),
      };
    });

    const protocolErrors: string[] = [];
    normalizedLinks.forEach((link, index) => {
      try {
        const protocol = new URL(link.url).protocol;
        if (!ALLOWED_LINK_PROTOCOLS.has(protocol)) {
          protocolErrors.push(`links[${index}].url: URL protocol must be http, https, or mailto`);
        }
      } catch {
        protocolErrors.push(`links[${index}].url: Invalid URL`);
      }
    });

    if (protocolErrors.length > 0) {
      return res.error('Validation failed', HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY, protocolErrors);
    }

    if (platformIds.length > 0) {
      const validationErrors: string[] = [];

      normalizedLinks.forEach((link, index) => {
        if (link.platform_id == null) {
          return;
        }

        const platform = platformById.get(link.platform_id);
        if (!platform) {
          validationErrors.push(`links[${index}].platform_id: Unknown platform id ${link.platform_id}`);
          return;
        }

        if (!platform.url_pattern) {
          return;
        }

        try {
          const urlRegex = new RegExp(platform.url_pattern, 'i');
          if (!urlRegex.test(link.url)) {
            validationErrors.push(`links[${index}].url: URL does not match ${platform.display_name} expected pattern`);
          }
        } catch {
          validationErrors.push(
            `links[${index}].platform_id: Invalid URL pattern configured for ${platform.display_name}`
          );
        }
      });

      if (validationErrors.length > 0) {
        return res.error('Validation failed', HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY, validationErrors);
      }
    }

    const result = await profileLinkRepository.syncLinks(req.userId!, normalizedLinks);
    return res.success(result, 'Profile links updated successfully');
  });
}

/**
 * Platforms controller (standalone, no class needed)
 */
export const listPlatforms = asyncHandler(async (_req: Request, res: Response) => {
  const platforms = await profileLinkRepository.listActivePlatforms();
  return res.success(platforms, 'Platforms retrieved successfully');
});

// Export singleton instance
export const profileController = new ProfileController();
