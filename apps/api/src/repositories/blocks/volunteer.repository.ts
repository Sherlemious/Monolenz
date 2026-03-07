/**
 * Repository for volunteer blocks
 */

import { PrismaClient } from '@prisma/client';
import { BlockType, VolunteerData } from '@monolenz/types/entities/blocks';
import { BaseTypedBlockRepository } from './base-typed-block.repository';

export class VolunteerRepository extends BaseTypedBlockRepository<VolunteerData> {
  protected readonly tableName = 'block_volunteers';
  protected readonly blockType = BlockType.VOLUNTEER;

  constructor(prisma: PrismaClient) {
    super(prisma);
  }
}
