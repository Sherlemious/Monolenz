import { Prisma, PrismaClient } from '@prisma/client';

export interface VersionBlockEntity {
  version_id: number;
  block_id: number;
  previous_version_id?: number | null;
  previous_block_id?: number | null;
  is_visible?: boolean | null;
  section_name?: string | null;
  sort_order?: number | null;
  created_at?: Date | null;
}

export interface AttachBlockToVersionInput {
  version_id: number;
  block_id: number;
  previous_version_id?: number | null;
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
        version_id: input.version_id,
        block_id: input.block_id,
        previous_version_id: input.previous_version_id ?? null,
        previous_block_id: input.previous_block_id ?? null,
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
    const whereClauses: string[] = ['vb.version_id = $1'];
    const params: any[] = [versionId];
    if (options?.sectionName) {
      whereClauses.push('vb.section_name = $2');
      params.push(options.sectionName);
    }
    if (options?.publicOnly) {
      whereClauses.push('vb.is_visible = true');
    }
    const sql = `
      SELECT vb.version_id, vb.block_id, vb.section_name, vb.sort_order, vb.is_visible,
             bd.block_type_name, bd.block_type_display_name, bd.block_type_category,
             bd.data, bd.content_hash, bd.created_at as block_created_at,
             vb.created_at as added_to_version_at
      FROM public.version_blocks vb
      JOIN public.block_details bd ON bd.id = vb.block_id
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY vb.section_name NULLS FIRST, vb.sort_order ASC, vb.created_at ASC
    `;
    const result = await (tx || this.prisma).$queryRawUnsafe(sql, ...(params as any[]));
    return result as unknown as any[];
  }

  async getVersionBlock(
    versionId: number,
    blockId: number,
    tx?: Prisma.TransactionClient
  ): Promise<Pick<VersionBlockEntity, 'previous_block_id' | 'previous_version_id'> | null> {
    const p = (tx || this.prisma) as any;
    return p.version_blocks.findUnique({
      where: { version_id_block_id: { version_id: versionId, block_id: blockId } },
      select: { previous_block_id: true, previous_version_id: true },
    });
  }
}
