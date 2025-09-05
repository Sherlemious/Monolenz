import { Prisma, PrismaClient } from '@prisma/client';

export interface BlockTypeEntity {
  id: number;
  name: string;
  display_name: string;
  description?: string | null;
  category?: string | null;
  sort_order?: number | null;
  icon?: string | null;
  is_active?: boolean | null;
  schema_version?: number | null;
  created_at?: Date | null;
  updated_at?: Date | null;
}

export interface BlockPropertyEntity {
  id: number;
  block_type_id: number | null;
  property_name: string;
  property_type: string;
  display_name: string;
  description?: string | null;
  is_required?: boolean | null;
  is_searchable?: boolean | null;
  validation_rules?: any | null;
  default_value?: any | null;
  sort_order?: number | null;
  group_name?: string | null;
  placeholder_text?: string | null;
  help_text?: string | null;
  is_active?: boolean | null;
  created_at?: Date | null;
  updated_at?: Date | null;
}

export class BlockCatalogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listBlockTypes(activeOnly = true, tx?: Prisma.TransactionClient): Promise<BlockTypeEntity[]> {
    const p = (tx || this.prisma) as any;
    return p.block_types.findMany({
      where: activeOnly ? { is_active: true } : undefined,
      orderBy: [{ sort_order: 'asc' }, { display_name: 'asc' }],
    });
  }

  async getBlockTypeById(id: number, tx?: Prisma.TransactionClient): Promise<BlockTypeEntity | null> {
    const p = (tx || this.prisma) as any;
    return p.block_types.findUnique({ where: { id } });
  }

  async getBlockTypeByName(name: string, tx?: Prisma.TransactionClient): Promise<BlockTypeEntity | null> {
    const p = (tx || this.prisma) as any;
    return p.block_types.findUnique({ where: { name } });
  }

  async listBlockProperties(
    blockTypeId: number,
    activeOnly = true,
    tx?: Prisma.TransactionClient
  ): Promise<BlockPropertyEntity[]> {
    const p = (tx || this.prisma) as any;
    return p.block_properties.findMany({
      where: {
        block_type_id: blockTypeId,
        ...(activeOnly ? { is_active: true } : {}),
      },
      orderBy: [{ sort_order: 'asc' }, { id: 'asc' }],
    });
  }
}



