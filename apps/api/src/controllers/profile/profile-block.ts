import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { ServiceContext, ServiceError } from '../../services/base.service';
import { prisma } from '../../config/prisma';
import { BlocksRepository } from '../../repositories/profile/blocks.repository';
import { BlockCatalogRepository } from '../../repositories/profile/block-catalog.repository';
import { VersionsRepository } from '../../repositories/profile/versions.repository';
import { VersionBlocksRepository } from '../../repositories/profile/version-blocks.repository';
import { ProfileBlockService } from '../../services/domain/profile-block.service';

const blocksRepository = new BlocksRepository(prisma);
const catalogRepository = new BlockCatalogRepository(prisma);
const versionsRepository = new VersionsRepository(prisma);
const versionBlocksRepository = new VersionBlocksRepository(prisma);
const blockService = new ProfileBlockService(
  blocksRepository,
  catalogRepository,
  versionsRepository,
  versionBlocksRepository
);

class ProfileBlockController {
  listBlockTypes = asyncHandler(async (_req: Request, res: Response) => {
    const types = await blockService.listBlockTypes();
    return res.success(types, 'Block types retrieved');
  });

  listBlockProperties = asyncHandler(async (req: Request, res: Response) => {
    const id = req.validatedParams.id as number;
    const props = await blockService.listBlockProperties(id);
    return res.success(props, 'Block properties retrieved');
  });

  createAndAttachBlock = asyncHandler(async (req: Request, res: Response) => {
    const context: ServiceContext = {
      userId: req.userId,
      userRole: req.userRole,
      requestId: req.requestId,
    };

    const versionId = req.validatedParams.versionId as number;
    const result = await blockService.createAndAttachBlock(
      {
        profileId: req.userId!,
        versionId,
        blockTypeId: (req.validatedBody as any).blockTypeId,
        blockTypeName: (req.validatedBody as any).blockTypeName,
        previousBlockId: (req.validatedBody as any).previousBlockId,
        data: (req.validatedBody as any).data,
        sectionName: (req.validatedBody as any).sectionName,
        sortOrder: (req.validatedBody as any).sortOrder,
        propertyVisibility: (req.validatedBody as any).propertyVisibility,
      },
      context
    );

    return res.success(result, 'Block created and attached');
  });

  applyVersionUpdate = asyncHandler(async (req: Request, res: Response) => {
    const context: ServiceContext = {
      userId: req.userId,
      userRole: req.userRole,
      requestId: req.requestId,
    };

    try {
      const result = await blockService.applyVersionUpdate(
        {
          profileId: req.userId!,
          creations: (req.validatedBody as any).creations,
          updates: (req.validatedBody as any).updates,
          deletions: (req.validatedBody as any).deletions,
        },
        context
      );
      return res.success(result, 'Version updated');
    } catch (err) {
      const e = err as ServiceError & { statusCode?: number; cause?: any };
      if (e.statusCode === 422 && e.cause?.errors) {
        return res.status(422).json({ success: false, message: 'Validation failed', errors: e.cause.errors });
      }
      throw err;
    }
  });

  listBlocksForVersion = asyncHandler(async (req: Request, res: Response) => {
    const versionId = req.validatedParams.versionId as number;
    const list = await blockService.listBlocksForVersion(
      versionId,
      { sectionName: (req.validatedQuery as any).section as string, publicOnly: !req.userId },
      {
        userId: req.userId,
        userRole: req.userRole,
        requestId: req.requestId,
      }
    );
    return res.success(list, 'Blocks retrieved');
  });
}

export const profileBlockController = new ProfileBlockController();
