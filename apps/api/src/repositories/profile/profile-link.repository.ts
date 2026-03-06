import { PrismaClient } from '@prisma/client';

export interface ProfileLinkEntity {
  id: number;
  profile_id: string | null;
  platform_id: number | null;
  url: string;
  label: string | null;
  category: string | null;
  is_public: boolean | null;
  sort_order: number | null;
  created_at: Date | null;
  updated_at: Date | null;
  link_platforms?: {
    id: number;
    name: string;
    display_name: string;
    category: string | null;
    icon: string | null;
    base_url: string | null;
    is_active: boolean | null;
  } | null;
}

export interface SyncLinkInput {
  id?: number;
  platform_id?: number | null;
  url: string;
  label?: string | null;
  is_public?: boolean;
  sort_order?: number;
}

const PLATFORM_INCLUDE = {
  link_platforms: {
    select: {
      id: true,
      name: true,
      display_name: true,
      category: true,
      icon: true,
      base_url: true,
      is_active: true,
    },
  },
} as const;

export class ProfileLinkRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByProfileId(profileId: string, publicOnly = false): Promise<ProfileLinkEntity[]> {
    const where: Record<string, unknown> = { profile_id: profileId };
    if (publicOnly) where.is_public = true;

    return this.prisma.profile_links.findMany({
      where,
      include: PLATFORM_INCLUDE,
      orderBy: { sort_order: 'asc' },
    }) as unknown as ProfileLinkEntity[];
  }

  /**
   * Bulk sync: replaces the profile's links with the given list.
   * - Links with an `id` that match an existing link are updated.
   * - Links without an `id` are created.
   * - Existing links not present in the new list are deleted.
   */
  async syncLinks(profileId: string, links: SyncLinkInput[]): Promise<ProfileLinkEntity[]> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.profile_links.findMany({
        where: { profile_id: profileId },
        select: { id: true },
      });
      const existingIds = new Set(existing.map((l) => l.id));
      const incomingIds = new Set(links.filter((l) => l.id != null).map((l) => l.id!));

      // Delete links not in the incoming list
      const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
      if (toDelete.length > 0) {
        await tx.profile_links.deleteMany({ where: { id: { in: toDelete } } });
      }

      // Upsert each link
      for (let i = 0; i < links.length; i++) {
        const link = links[i]!;
        const data = {
          profile_id: profileId,
          platform_id: link.platform_id ?? null,
          url: link.url,
          label: link.label ?? null,
          is_public: link.is_public ?? true,
          sort_order: link.sort_order ?? i,
        };

        if (link.id != null && existingIds.has(link.id)) {
          await tx.profile_links.update({ where: { id: link.id }, data });
        } else {
          await tx.profile_links.create({ data });
        }
      }

      return tx.profile_links.findMany({
        where: { profile_id: profileId },
        include: PLATFORM_INCLUDE,
        orderBy: { sort_order: 'asc' },
      }) as unknown as ProfileLinkEntity[];
    });
  }
}
