import { Prisma, PrismaClient } from '@prisma/client';

export interface VersionEntity {
  id: number;
  parent_version_id?: number | null;
  profile_id?: string | null;
  name?: string | null;
  description?: string | null;
  metadata?: any | null;
  created_at?: Date | null;
}

export interface CreateVersionInput {
  profile_id: string;
  parent_version_id?: number | null;
  name?: string | null;
  description?: string | null;
  metadata?: any | null;
}

export class VersionsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createVersion(input: CreateVersionInput, tx?: Prisma.TransactionClient): Promise<VersionEntity> {
    const p = (tx || this.prisma) as any;
    return p.versions.create({
      data: {
        profile_id: input.profile_id,
        parent_version_id: input.parent_version_id ?? null,
        name: input.name ?? null,
        description: input.description ?? null,
        metadata: input.metadata ?? {},
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
