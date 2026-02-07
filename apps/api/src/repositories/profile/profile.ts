import { PrismaClient } from '@prisma/client';
import { BaseRepository, RepositoryOptions } from '../base.repository';
import { Profile } from '@monolenz/types/entities';
import { UUID_REGEX } from '../../utils/constants';

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

      const result = await this.prisma.profiles.findFirst({
        where: { username, deleted_at: null },
        include,
      });

      return result as ProfileEntity;
    } catch (_error) {
      throw new Error(`Failed to find profile by username: ${username}`);
    }
  }

  async findByIdentifier(identifier: string, options?: ProfileRepositoryOptions): Promise<ProfileEntity | null> {
    try {
      const include = this.buildIncludeOptions(options);

      // Try to find by UUID first, then by username
      const isUuid = UUID_REGEX.test(identifier);

      const where = isUuid
        ? { id: identifier, deleted_at: null }
        : { username: identifier, deleted_at: null };

      const result = await this.prisma.profiles.findFirst({
        where,
        include,
      });

      return result as ProfileEntity;
    } catch (_error) {
      throw new Error(`Failed to find profile by identifier: ${identifier}`);
    }
  }

  async checkUsernameAvailability(username: string, excludeId?: string): Promise<boolean> {
    try {
      const where: any = { username, deleted_at: null };
      if (excludeId) {
        where.NOT = { id: excludeId };
      }

      const count = await this.prisma.profiles.count({ where });
      return count === 0;
    } catch (_error) {
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
        deleted_at: null,
      },
      {
        bio: {
          contains: query,
          mode: 'insensitive',
        },
        deleted_at: null,
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
}
