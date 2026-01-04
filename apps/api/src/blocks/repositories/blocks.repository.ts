/**
 * Base repository for immutable blocks with content hashing
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { createHash } from 'crypto';
import { BaseRepository } from '../../repositories/base.repository';
import { BlockEntity, BlockType } from '@monolenz/types/entities/blocks';

export class BlocksRepository extends BaseRepository<BlockEntity> {
  protected tableName = 'blocks';

  constructor(protected readonly db: PrismaClient) {
    super(db);
  }

  protected buildSearchConditions(_query: string): Record<string, unknown>[] {
    // Blocks are not searched directly - they're accessed via versions
    return [];
  }

  async withTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }

  async findBlockByHash(contentHash: string, tx?: Prisma.TransactionClient): Promise<BlockEntity | null> {
    const prisma = (tx || this.prisma) as any;
    return prisma.blocks.findUnique({ where: { content_hash: contentHash } });
  }

  async createBaseBlock(
    data: { block_type: BlockType; content_hash: string },
    tx?: Prisma.TransactionClient
  ): Promise<BlockEntity> {
    const prisma = (tx || this.prisma) as any;
    return prisma.blocks.create({
      data: {
        block_type: data.block_type,
        content_hash: data.content_hash,
      },
    });
  }

  computeContentHash(blockType: BlockType, data: unknown): string {
    const payload = { block_type: blockType, ...data };
    const stableString = this.stableStringify(payload);
    return createHash('sha256').update(stableString).digest('hex');
  }

  private stableStringify(value: unknown): string {
    const seen = new WeakSet();

    const stringify = (val: any): string => {
      if (val === null || val === undefined) {
        return String(val);
      }

      const type = typeof val;

      if (type === 'number' || type === 'boolean') {
        return String(val);
      }

      if (type === 'string') {
        return JSON.stringify(val);
      }

      if (type === 'bigint') {
        return val.toString();
      }

      if (val instanceof Date) {
        return JSON.stringify(val.toISOString());
      }

      if (val instanceof Array) {
        if (seen.has(val)) {
          return 'null';
        }
        seen.add(val);
        const items = val.map(stringify).join(',');
        return `[${items}]`;
      }

      if (type === 'object') {
        if (seen.has(val)) {
          return 'null';
        }
        seen.add(val);

        const keys = Object.keys(val).sort();
        const pairs = keys.map((key) => `"${key}":${stringify(val[key])}`).join(',');
        return `{${pairs}}`;
      }

      return 'null';
    };

    return stringify(value);
  }
}
