import { Prisma, PrismaClient } from '@prisma/client';

export interface VersionBlockEntity {
  version_id: number;
  block_id: number;
  previous_block_id?: number | null;
  is_visible?: boolean | null;
  section_name?: string | null;
  sort_order?: number | null;
  created_at?: Date | null;
}

export interface AttachBlockToVersionInput {
  version_id: number;
  block_id: number;
  previous_block_id?: number | null;
  is_visible?: boolean;
  section_name?: string | null;
  sort_order?: number | null;
}

export class VersionBlocksRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async attachBlockToVersion(
    input: AttachBlockToVersionInput,
    tx?: Prisma.TransactionClient
  ): Promise<VersionBlockEntity> {
    const p = (tx || this.prisma) as any;
    return p.version_blocks.create({
      data: {
        versions_version_blocks_version_idToversions: {
          connect: { id: input.version_id },
        },
        blocks_version_blocks_block_idToblocks: {
          connect: { id: input.block_id },
        },
        ...(input.previous_block_id && {
          blocks_version_blocks_previous_block_idToblocks: {
            connect: { id: input.previous_block_id },
          },
        }),
        is_visible: input.is_visible ?? true,
        section_name: input.section_name ?? null,
        sort_order: input.sort_order ?? 0,
      },
    });
  }

  async updateVersionBlock(
    versionId: number,
    blockId: number,
    data: Partial<Pick<VersionBlockEntity, 'is_visible' | 'section_name' | 'sort_order'>>,
    tx?: Prisma.TransactionClient
  ): Promise<VersionBlockEntity> {
    const p = (tx || this.prisma) as any;
    return p.version_blocks.update({
      where: { version_id_block_id: { version_id: versionId, block_id: blockId } },
      data: { ...data, updated_at: new Date() },
    });
  }

  async listVersionBlocks(
    versionId: number,
    options?: { sectionName?: string; publicOnly?: boolean },
    tx?: Prisma.TransactionClient
  ): Promise<any[]> {
    const p = (tx || this.prisma) as any;

    const whereClause: any = {
      version_id: versionId,
      ...(options?.sectionName && { section_name: options.sectionName }),
      ...(options?.publicOnly && { is_visible: true }),
    };

    const versionBlocks = await p.version_blocks.findMany({
      where: whereClause,
      include: {
        blocks_version_blocks_block_idToblocks: {
          include: {
            block_awards: true,
            block_certifications: true,
            block_educations: true,
            block_languages: true,
            block_projects: true,
            block_skills: true,
            block_volunteers: true,
            block_work_experiences: true,
          },
        },
      },
      orderBy: [
        { section_name: 'asc' },
        { sort_order: 'asc' },
        { created_at: 'asc' },
      ],
    });

    // Transform nested structure to flat structure expected by service
    return versionBlocks.map((vb: any) => ({
      version_id: vb.version_id,
      block_id: vb.block_id,
      section_name: vb.section_name,
      sort_order: vb.sort_order,
      is_visible: vb.is_visible,
      block_type: vb.blocks_version_blocks_block_idToblocks?.block_type,
      content_hash: vb.blocks_version_blocks_block_idToblocks?.content_hash,
      block_created_at: vb.blocks_version_blocks_block_idToblocks?.created_at,
      added_to_version_at: vb.created_at,
      // Include all block type-specific data
      block_data: vb.blocks_version_blocks_block_idToblocks,
    }));
  }

  async getVersionBlock(
    versionId: number,
    blockId: number,
    tx?: Prisma.TransactionClient
  ): Promise<Pick<VersionBlockEntity, 'previous_block_id'> | null> {
    const p = (tx || this.prisma) as any;
    return p.version_blocks.findUnique({
      where: { version_id_block_id: { version_id: versionId, block_id: blockId } },
      select: { previous_block_id: true },
    });
  }
}
