import { BaseService, ServiceContext, ServiceOptions, ServiceError } from '../base.service';
import { ProfileRepository, ProfileEntity, ProfileRepositoryOptions } from '../../repositories/profile/profile';
import { profileSchemas, ProfileCreateData, ProfileUpdateData } from '@monolenz/types/validation';
import { HTTP_STATUS_CODES, PaginationParams } from '@monolenz/types/api';

export interface ProfileServiceOptions extends ServiceOptions {
  includeLinks?: boolean;
  includeVersions?: boolean;
  publicOnly?: boolean;
}

export class ProfileService extends BaseService<ProfileEntity> {
  constructor(private readonly profileRepository: ProfileRepository) {
    super('ProfileService', profileRepository);
  }

  // Public methods
  async createProfile(data: ProfileCreateData, context: ServiceContext): Promise<ProfileEntity> {
    return this.create(data, context);
  }

  async getProfileByIdentifier(
    identifier: string,
    context?: ServiceContext,
    options?: ProfileServiceOptions
  ): Promise<ProfileEntity | null> {
    const operation = 'getProfileByIdentifier';
    const startTime = Date.now();

    try {
      this.logger.info(`${operation} started`, { identifier, context });
      this.metrics.incrementCounter(`${this.serviceName}.${operation}.attempts`);

      const repositoryOptions: ProfileRepositoryOptions = {
        includeLinks: options?.includeLinks,
        includeVersions: options?.includeVersions,
        publicOnly: options?.publicOnly,
      };

      const result = await this.profileRepository.findByIdentifier(identifier, repositoryOptions);

      if (result) {
        // Apply privacy filters based on context
        const filteredResult = await this.applyPrivacyFilters(result, context);

        this.metrics.recordDuration(`${this.serviceName}.${operation}.duration`, Date.now() - startTime);
        this.metrics.incrementCounter(`${this.serviceName}.${operation}.success`);

        return filteredResult;
      }

      this.logger.info(`${operation} completed - not found`, { identifier });
      return null;
    } catch (error) {
      this.metrics.incrementCounter(`${this.serviceName}.${operation}.errors`);
      this.logger.error(`${operation} failed`, { identifier, error: error as Error });
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(`Failed to get profile by identifier`, error);
    }
  }

  async getProfileByUsername(
    username: string,
    context?: ServiceContext,
    options?: ProfileServiceOptions
  ): Promise<ProfileEntity | null> {
    const operation = 'getProfileByUsername';

    try {
      this.logger.info(`${operation} started`, { username, context });

      const repositoryOptions: ProfileRepositoryOptions = {
        includeLinks: options?.includeLinks,
        includeVersions: options?.includeVersions,
        publicOnly: options?.publicOnly,
      };

      const result = await this.profileRepository.findByUsername(username, repositoryOptions);

      if (result) {
        return await this.applyPrivacyFilters(result, context);
      }

      return null;
    } catch (error) {
      this.logger.error(`${operation} failed`, { username, error: error as Error });
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(`Failed to get profile by username`, error);
    }
  }

  async updateProfile(id: string, data: ProfileUpdateData, context: ServiceContext): Promise<ProfileEntity> {
    // Validate username uniqueness if username is being updated
    if (data.username) {
      const isAvailable = await this.profileRepository.checkUsernameAvailability(data.username, id);
      if (!isAvailable) {
        throw new ServiceError('Username is already taken', null, HTTP_STATUS_CODES.CONFLICT);
      }
    }

    return this.update(id, data, context);
  }

  async checkUsernameAvailability(username: string, excludeId?: string): Promise<boolean> {
    try {
      return await this.profileRepository.checkUsernameAvailability(username, excludeId);
    } catch (error) {
      this.logger.error('Username availability check failed', { username, error: error as Error });
      if (error instanceof ServiceError) throw error;
      throw new ServiceError('Failed to check username availability', error);
    }
  }

  async searchProfiles(
    searchParams: PaginationParams & { query?: string; filters?: Record<string, any> },
    context?: ServiceContext
  ): Promise<{ data: ProfileEntity[]; total: number; meta: any }> {
    // Apply public-only filter for non-authenticated users
    const filters = {
      ...searchParams.filters,
      // Add any global filters here (e.g., only show verified profiles)
    };

    return this.findMany(searchParams, filters, context);
  }

  // Protected methods - implement abstract methods from BaseService
  protected async validateAccess(operation: string, data: any, context?: ServiceContext): Promise<void> {
    // Allow public read operations
    if (operation === 'findById' || operation === 'findMany' || operation === 'getProfileByIdentifier') {
      return;
    }

    // Require authentication for write operations
    if (!context?.userId) {
      throw new ServiceError('Authentication required', null, HTTP_STATUS_CODES.UNAUTHORIZED);
    }

    // For update/delete operations, ensure user owns the profile or is admin
    if ((operation === 'update' || operation === 'delete' || operation === 'getProfileStats') && data.id) {
      if (data.id !== context.userId && context.userRole !== 'admin') {
        throw new ServiceError(
          'Access denied: You can only modify your own profile',
          null,
          HTTP_STATUS_CODES.FORBIDDEN
        );
      }
    }
  }

  protected async validateData(data: Partial<ProfileEntity>, operation: 'create' | 'update'): Promise<void> {
    try {
      if (operation === 'create') {
        profileSchemas.create.parse(data);
      } else {
        profileSchemas.update.parse(data);
      }
    } catch (error) {
      throw new ServiceError('Validation failed', error, HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY);
    }
  }

  protected async applyBusinessRules(
    data: Partial<ProfileEntity>,
    operation: 'create' | 'update',
    context?: ServiceContext,
    _existing?: ProfileEntity
  ): Promise<Partial<ProfileEntity>> {
    const processedData: Partial<ProfileEntity> = { ...data };

    // Normalize username
    if (processedData.username) {
      processedData.username = processedData.username.toLowerCase().trim();
    }

    // Ensure profile ID matches authenticated user for creation
    if (operation === 'create' && context?.userId) {
      processedData.id = context.userId;
    }

    // Clean up empty strings
    (Object.keys(processedData) as (keyof ProfileEntity)[]).forEach((key) => {
      if (typeof processedData[key] === 'string' && processedData[key] === '') {
        (processedData[key] as any) = null;
      }
    });

    return processedData;
  }

  protected async applyServiceFilters(
    filters?: Record<string, unknown>,
    _context?: ServiceContext
  ): Promise<Record<string, unknown>> {
    const serviceFilters = { ...filters };

    // Add global filters here if needed
    // For example, only show verified profiles in production
    if (process.env.NODE_ENV === 'production') {
      // serviceFilters.verified = true;
    }

    return serviceFilters;
  }

  private async applyPrivacyFilters(profile: ProfileEntity, context?: ServiceContext): Promise<ProfileEntity> {
    const isOwner = context?.userId === profile.id;
    const isAdmin = context?.userRole === 'admin';

    // Return full profile for owner and admin
    if (isOwner || isAdmin) {
      return profile;
    }

    // For public access, filter sensitive information
    const publicProfile: ProfileEntity = {
      id: profile.id,
      username: profile.username,
      bio: profile.bio,
      profile_picture_url: profile.profile_picture_url,
      portfolio_url: profile.portfolio_url,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      // Filter out private URLs for public access
      linkedin_url: undefined,
      github_url: undefined,
    };

    // Include only public links if they were requested
    if (profile.profile_links) {
      publicProfile.profile_links = profile.profile_links.filter((link) => link.is_public);
    }

    return publicProfile;
  }
}
