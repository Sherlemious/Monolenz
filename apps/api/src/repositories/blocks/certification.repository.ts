/**
 * Repository for certification blocks
 */

import { PrismaClient } from '@prisma/client';
import { BlockType, CertificationData } from '@monolenz/types/entities/blocks';
import { BaseTypedBlockRepository } from './base-typed-block.repository';

export class CertificationRepository extends BaseTypedBlockRepository<CertificationData> {
  protected readonly tableName = 'block_certifications';
  protected readonly blockType = BlockType.CERTIFICATION;

  constructor(prisma: PrismaClient) {
    super(prisma);
  }
}
