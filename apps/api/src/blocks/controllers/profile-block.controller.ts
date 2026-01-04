/**
 * ProfileBlockController - HTTP handlers for block operations
 */

import { asyncHandler } from '../../utils/async-handler';
import { Request, Response } from 'express';
import { ProfileBlockService } from '../services/profile-block.service';
import { BlocksRepository } from '../repositories/blocks.repository';
import { VersionsRepository } from '../../repositories/profile/versions.repository';
import { VersionBlocksRepository } from '../../repositories/profile/version-blocks.repository';
import { prisma } from '../../config/prisma';
import { ServiceContext } from '../../services/base.service';
import { BlockType } from '@monolenz/types/entities/blocks';

class ProfileBlockController {
  private blockService: ProfileBlockService;

  constructor() {
    const blocksRepo = new BlocksRepository(prisma);
    const versionsRepo = new VersionsRepository(prisma);
    const versionBlocksRepo = new VersionBlocksRepository(prisma);
    this.blockService = new ProfileBlockService(blocksRepo, versionsRepo, versionBlocksRepo, prisma);
  }

  /**
   * Apply batch version update (creations, updates, deletions)
   */
  applyVersionUpdate = asyncHandler(async (req: Request, res: Response) => {
    const context: ServiceContext = {
      userId: req.userId,
      requestId: req.requestId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    };

    const { creations, updates, deletions } = req.validatedBody;

    const result = await this.blockService.applyVersionUpdate(
      {
        profileId: req.userId!,
        creations: creations.map((c: any) => ({
          blockType: c.block_type,
          data: c.data,
          sectionName: c.section_name,
          sortOrder: c.sort_order,
        })),
        updates: updates.map((u: any) => ({
          parentBlockId: u.parent_block_id,
          blockType: u.block_type,
          data: u.data,
          sectionName: u.section_name,
          sortOrder: u.sort_order,
        })),
        deletions,
      },
      context
    );

    return res.success(result, 'Version updated successfully');
  });

  /**
   * List blocks for a specific version
   */
  listBlocksForVersion = asyncHandler(async (req: Request, res: Response) => {
    const { versionId } = req.validatedParams;
    const { section_name, block_type } = req.validatedQuery || {};

    const blocks = await this.blockService.listBlocksForVersion(versionId, {
      sectionName: section_name,
      blockType: block_type as BlockType | undefined,
    });

    return res.success(blocks, 'Blocks retrieved successfully');
  });

  /**
   * Get latest version for a profile (public or authenticated)
   */
  getLatestVersion = asyncHandler(async (req: Request, res: Response) => {
    const { identifier } = req.validatedParams;

    // TODO: Implement resolveProfileIdentifier to convert username/UUID to profile_id
    // For now, assuming identifier is profile_id
    const profileId = identifier;

    const version = await this.blockService.getLatestVersion(profileId);

    if (!version) {
      return res.error('No versions found for this profile', 404);
    }

    const blocks = await this.blockService.listBlocksForVersion(version.id);

    return res.success({ version, blocks }, 'Latest version retrieved');
  });
}

export const profileBlockController = new ProfileBlockController();
