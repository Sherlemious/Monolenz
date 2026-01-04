/**
 * Repository for project blocks
 */

import { PrismaClient } from '@prisma/client';
import { BlockType, ProjectData } from '@monolenz/types/entities/blocks';
import { BaseTypedBlockRepository } from './base-typed-block.repository';

export class ProjectRepository extends BaseTypedBlockRepository<ProjectData> {
  protected readonly tableName = 'block_projects';
  protected readonly blockType = BlockType.PROJECT;

  constructor(prisma: PrismaClient) {
    super(prisma);
  }
}
