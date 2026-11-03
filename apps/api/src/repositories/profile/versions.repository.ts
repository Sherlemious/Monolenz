import { Prisma, PrismaClient } from '@prisma/client';

export interface VersionEntity {
  id: number;
  parent_version_id?: number | null;
  profile_id?: string | null;
  name?: string | null;
  description?: string | null;
  created_at?: Date | null;
}

export interface VersionSummaryEntity extends VersionEntity {
  block_count: number;
}

export interface CreateVersionInput {
  profile_id: string;
  parent_version_id?: number | null;
  name?: string | null;
  description?: string | null;
}

export class VersionsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createVersion(input: CreateVersionInput, tx?: Prisma.TransactionClient): Promise<VersionEntity> {
    const p = (tx || this.prisma) as any;
    return p.versions.create({
      data: {
        profiles: {
          connect: { id: input.profile_id },
        },
        ...(input.parent_version_id && {
          versions: {
            connect: { id: input.parent_version_id },
          },
        }),
        name: input.name ?? null,
        description: input.description ?? null,
      },
    });
  }

  async getLatestVersionForProfile(profileId: string, tx?: Prisma.TransactionClient): Promise<VersionEntity | null> {
    const p = (tx || this.prisma) as any;
    return p.versions.findFirst({ where: { profile_id: profileId }, orderBy: { created_at: 'desc' } });
  }

  async getVersionById(versionId: number, tx?: Prisma.TransactionClient): Promise<VersionEntity | null> {
    const p = (tx || this.prisma) as any;
    return p.versions.findUnique({ where: { id: versionId } });
  }

  async listVersionsForProfile(
    profileId: string,
    options: { limit: number; offset: number },
    tx?: Prisma.TransactionClient
  ): Promise<VersionSummaryEntity[]> {
    const p = (tx || this.prisma) as any;
    const rows = await p.versions.findMany({
      where: { profile_id: profileId },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      take: options.limit,
      skip: options.offset,
      include: {
        _count: { select: { version_blocks_version_blocks_version_idToversions: true } },
      },
    });
    return rows.map(({ _count, ...version }: any) => ({
      ...version,
      block_count: _count?.version_blocks_version_blocks_version_idToversions ?? 0,
    }));
  }

  async countVersionsForProfile(profileId: string, tx?: Prisma.TransactionClient): Promise<number> {
    const p = (tx || this.prisma) as any;
    return p.versions.count({ where: { profile_id: profileId } });
  }

  async listVersionBlockIds(versionId: number, tx?: Prisma.TransactionClient): Promise<number[]> {
    const p = (tx || this.prisma) as any;
    const rows = await p.version_blocks.findMany({
      where: { version_id: versionId },
      select: { block_id: true },
      orderBy: { sort_order: 'asc' },
    });
    return rows.map((r: { block_id: number }) => r.block_id);
  }

  async profileExists(profileId: string, tx?: Prisma.TransactionClient): Promise<boolean> {
    const p = (tx || this.prisma) as any;
    const count = await p.profiles.count({ where: { id: profileId } });
    return count > 0;
  }
}
