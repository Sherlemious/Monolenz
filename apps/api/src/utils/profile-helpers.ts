import { Request } from 'express';

/**
 * Check if user can access/modify a profile
 */
export const canAccessProfile = (req: Request, profileId: string): boolean => {
  // User can access their own profile or admin can access any
  return req.userId === profileId || req.userRole === 'admin';
};

/**
 * Check if user can modify a profile
 */
export const canModifyProfile = (req: Request, profileId: string): boolean => {
  // Only the profile owner or admin can modify
  return req.userId === profileId || req.userRole === 'admin';
};

/**
 * Get profile access level for user
 */
export const getProfileAccessLevel = (req: Request, profileId: string): 'owner' | 'admin' | 'public' => {
  if (req.userId === profileId) return 'owner';
  if (req.userRole === 'admin') return 'admin';
  return 'public';
};

/**
 * Build database filters from request search params
 */
export const buildProfileFilters = (req: Request) => {
  const { search, filters } = req.searchParams;
  const dbFilters: any = {};

  // Handle search across multiple fields
  if (search) {
    dbFilters.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { bio: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Handle specific filters
  if (filters.username) {
    dbFilters.username = { contains: filters.username, mode: 'insensitive' };
  }

  if (filters.has_bio !== undefined) {
    dbFilters.bio = filters.has_bio === 'true' ? { not: null } : null;
  }

  if (filters.verified !== undefined) {
    // Assuming you add a verified field later
    dbFilters.verified = filters.verified === 'true';
  }

  return dbFilters;
};

/**
 * Build profile link filters
 */
export const buildProfileLinkFilters = (req: Request) => {
  const { search, filters } = req.searchParams;
  const dbFilters: any = {};

  // Handle search
  if (search) {
    dbFilters.OR = [
      { url: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Handle specific filters
  if (filters.category) {
    dbFilters.category = filters.category;
  }

  if (filters.is_public !== undefined) {
    dbFilters.is_public = filters.is_public === 'true';
  }

  if (filters.platform_id) {
    dbFilters.platform_id = parseInt(filters.platform_id, 10);
  }

  return dbFilters;
};
