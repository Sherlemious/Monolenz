import { PrismaClient } from '@prisma/client';
import { BaseRepository, RepositoryOptions } from '../base.repository';
import { Profile } from '@athaar/types/entities';

export interface ProfileEntity extends Profile {
  profile_links?: any[];
  versions?: any[];
}

export interface ProfileRepositoryOptions extends RepositoryOptions {
  includeLinks?: boolean;
  includeVersions?: boolean;
  publicOnly?: boolean;
}

export class ProfileRepository extends BaseRepository<ProfileEntity> {
  protected tableName = 'profiles';

  constructor(db: PrismaClient) {
    super(db);
  }

  async findByUsername(username: string, options?: ProfileRepositoryOptions): Promise<ProfileEntity | null> {
    try {
      const include = this.buildIncludeOptions(options);

      const result = await this.prisma.profiles.findUnique({
        where: { username },
        include,
      });

      return result as ProfileEntity;
    } catch (error) {
      throw new Error(`Failed to find profile by username: ${username}`);
    }
  }

  async findByIdentifier(identifier: string, options?: ProfileRepositoryOptions): Promise<ProfileEntity | null> {
    try {
      const include = this.buildIncludeOptions(options);

      // Try to find by UUID first, then by username
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

      const where = isUuid ? { id: identifier } : { username: identifier };

      const result = await this.prisma.profiles.findUnique({
        where,
        include,
      });

      return result as ProfileEntity;
    } catch (error) {
      throw new Error(`Failed to find profile by identifier: ${identifier}`);
    }
  }

  async checkUsernameAvailability(username: string, excludeId?: string): Promise<boolean> {
    try {
      const where = excludeId ? { username, NOT: { id: excludeId } } : { username };

      const count = await this.prisma.profiles.count({ where });
      return count === 0;
    } catch (error) {
      throw new Error(`Failed to check username availability: ${username}`);
    }
  }

  // Override search to implement profile-specific search logic
  protected buildSearchConditions(query: string): Record<string, any>[] {
    return [
      {
        username: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        bio: {
          contains: query,
          mode: 'insensitive',
        },
      },
    ];
  }

  private buildIncludeOptions(options?: ProfileRepositoryOptions) {
    const include: any = {};

    if (options?.includeLinks) {
      include.profile_links = {
        where: options.publicOnly ? { is_public: true } : undefined,
        include: {
          link_platforms: true,
        },
        orderBy: { sort_order: 'asc' },
      };
    }

    if (options?.includeVersions) {
      include.versions = {
        orderBy: { created_at: 'desc' },
        take: 10,
      };
    }

    return Object.keys(include).length > 0 ? include : undefined;
  }

  private buildSelectOptions(options?: ProfileRepositoryOptions) {
    if (options?.publicOnly) {
      return {
        select: {
          username: true,
          bio: true,
          profile_picture_url: true,
          portfolio_url: true,
          created_at: true,
          profile_links: options.includeLinks
            ? {
                where: { is_public: true },
                include: { link_platforms: true },
                orderBy: { sort_order: 'asc' },
              }
            : false,
        },
      };
    }

    return {};
  }
}
