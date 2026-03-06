import { Request, Response } from 'express';
import { ProfileService } from '../../services/domain/profile.service';
import { ProfileRepository } from '../../repositories/profile/profile';
import { ProfileLinkRepository, SyncLinkInput } from '../../repositories/profile/profile-link.repository';
import { prisma } from '../../config/prisma';
import { asyncHandler } from '../../utils/async-handler';
import { ServiceContext } from '../../services/base.service';
import { HTTP_STATUS_CODES } from '@monolenz/types/api';
import { ProfileCreateData, ProfileUpdateData } from '@monolenz/types/validation';

const profileRepository = new ProfileRepository(prisma);
const profileService = new ProfileService(profileRepository);
const profileLinkRepository = new ProfileLinkRepository(prisma);

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
    const links: SyncLinkInput[] = req.body ?? [];
    const result = await profileLinkRepository.syncLinks(req.userId!, links);
    return res.success(result, 'Profile links updated successfully');
  });
}

/**
 * Platforms controller (standalone, no class needed)
 */
export const listPlatforms = asyncHandler(async (_req: Request, res: Response) => {
  const platforms = await prisma.link_platforms.findMany({
    where: { is_active: true },
    orderBy: [{ category: 'asc' }, { display_name: 'asc' }],
  });
  return res.success(platforms, 'Platforms retrieved successfully');
});

// Export singleton instance
export const profileController = new ProfileController();
