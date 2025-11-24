import { Prisma, PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import { BaseEntity, BaseRepository } from '../base.repository';

export interface BlockEntity extends BaseEntity {
  id: number;
  block_type_id: number;
  data: any;
  content_hash: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface BlockPropertyValueEntity {
  block_id: number;
  property_id: number;
  value: any;
  is_active?: boolean | null;
  is_public?: boolean | null;
  created_at?: Date | null;
  updated_at?: Date | null;
}

export class BlocksRepository extends BaseRepository<BlockEntity> {
  protected buildSearchConditions(query: string): Record<string, any>[] {
    throw new Error('Method not implemented.');
  }
  protected tableName = 'blocks';

  constructor(db: PrismaClient) {
    super(db);
  }

  // Transaction helper
  async withTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => fn(tx));
  }

  // Blocks
  async findBlockByHash(contentHash: string, tx?: Prisma.TransactionClient): Promise<BlockEntity | null> {
    const prisma = (tx || this.prisma) as any;
    return prisma.blocks.findUnique({ where: { content_hash: contentHash } });
  }

  async createBlock(
    data: Pick<BlockEntity, 'block_type_id' | 'data' | 'content_hash'>,
    tx?: Prisma.TransactionClient
  ): Promise<BlockEntity> {
    const prisma = (tx || this.prisma) as any;
    return prisma.blocks.create({ data });
  }

  // Property Values
  async upsertBlockPropertyValues(
    blockId: number,
    values: Array<
      Pick<BlockPropertyValueEntity, 'property_id' | 'value'> & { is_public?: boolean; is_active?: boolean }
    >,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    const prisma = (tx || this.prisma) as any;
    for (const v of values) {
      await prisma.block_property_values.upsert({
        where: {
          block_id_property_id: {
            block_id: blockId,
            property_id: v.property_id,
          },
        },
        update: {
          value: v.value,
          is_public: v.is_public ?? true,
          is_active: v.is_active ?? true,
          updated_at: new Date(),
        },
        create: {
          block_id: blockId,
          property_id: v.property_id,
          value: v.value,
          is_public: v.is_public ?? true,
          is_active: v.is_active ?? true,
        },
      });
    }
  }

  // Hashing utility
  computeContentHash(data: unknown): string {
    const stableString = this.stableStringify(data);
    return createHash('sha256').update(stableString).digest('hex');
  }

  private stableStringify(value: unknown): string {
    const seen = new WeakSet();
    const stringify = (val: any): any => {
      if (val === null || typeof val !== 'object') return val;
      if (seen.has(val)) return undefined;
      seen.add(val);
      if (Array.isArray(val)) return val.map((v) => stringify(v));
      const keys = Object.keys(val).sort();
      const out: Record<string, any> = {};
      for (const k of keys) out[k] = stringify(val[k]);
      return out;
    };
    return JSON.stringify(stringify(value));
  }
}
