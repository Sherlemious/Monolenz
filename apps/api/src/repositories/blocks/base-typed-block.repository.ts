/**
 * Base class for typed block repositories
 * Provides common functionality for all block-specific tables
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { BlockType } from '@monolenz/types/entities/blocks';

export abstract class BaseTypedBlockRepository<TData extends Record<string, any>> {
  protected abstract readonly tableName: string;
  protected abstract readonly blockType: BlockType;

  constructor(protected readonly prisma: PrismaClient) {}

  async create(blockId: number, data: TData, tx?: Prisma.TransactionClient): Promise<TData> {
    const prisma = (tx || this.prisma) as any;
    return prisma[this.tableName].create({
      data: {
        block_id: blockId,
        ...data,
      },
    });
  }

  async findByBlockId(blockId: number, tx?: Prisma.TransactionClient): Promise<TData | null> {
    const prisma = (tx || this.prisma) as any;
    return prisma[this.tableName].findUnique({
      where: { block_id: blockId },
    });
  }

  async findManyByBlockIds(blockIds: number[], tx?: Prisma.TransactionClient): Promise<TData[]> {
    const prisma = (tx || this.prisma) as any;
    return prisma[this.tableName].findMany({
      where: { block_id: { in: blockIds } },
    });
  }
}
