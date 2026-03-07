/**
 * Repository for award blocks
 */

import { PrismaClient } from '@prisma/client';
import { BlockType, AwardData } from '@monolenz/types/entities/blocks';
import { BaseTypedBlockRepository } from './base-typed-block.repository';

export class AwardRepository extends BaseTypedBlockRepository<AwardData> {
  protected readonly tableName = 'block_awards';
  protected readonly blockType = BlockType.AWARD;

  constructor(prisma: PrismaClient) {
    super(prisma);
  }
}
