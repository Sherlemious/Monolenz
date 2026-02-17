/* eslint-disable @typescript-eslint/no-explicit-any */
/* global describe, it, expect, beforeEach, jest */

import { ProfileBlockService } from './profile-block.service';
import { BlocksRepository } from '../../repositories/blocks/blocks.repository';
import { VersionsRepository } from '../../repositories/profile/versions.repository';
import { VersionBlocksRepository } from '../../repositories/profile/version-blocks.repository';
import { PrismaClient } from '@prisma/client';
import { ServiceError } from '../base.service';
import { BlockType } from '@monolenz/types/entities/blocks';

// Mock dependencies
jest.mock('../../repositories/blocks/blocks.repository');
jest.mock('../../repositories/profile/versions.repository');
jest.mock('../../repositories/profile/version-blocks.repository');
jest.mock('../../repositories/blocks/repository-factory', () => {
  return {
    TypedBlockRepositoryFactory: jest.fn().mockImplementation(() => ({
      getRepository: jest.fn().mockReturnValue({
        findManyByBlockIds: jest.fn().mockResolvedValue([]),
        create: jest.fn(),
      }),
    })),
  };
});
jest.mock('@prisma/client');

describe('ProfileBlockService', () => {
  let service: ProfileBlockService;
  let mockBlocksRepo: jest.Mocked<BlocksRepository>;
  let mockVersionsRepo: jest.Mocked<VersionsRepository>;
  let mockVersionBlocksRepo: jest.Mocked<VersionBlocksRepository>;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    mockBlocksRepo = new BlocksRepository(mockPrisma) as jest.Mocked<BlocksRepository>;
    mockVersionsRepo = new VersionsRepository(mockPrisma) as jest.Mocked<VersionsRepository>;
    mockVersionBlocksRepo = new VersionBlocksRepository(mockPrisma) as jest.Mocked<VersionBlocksRepository>;

    // Mock withTransaction to execute callback immediately
    mockBlocksRepo.withTransaction.mockImplementation(async (callback) => {
      return callback(mockPrisma as any);
    });

    service = new ProfileBlockService(
      mockBlocksRepo,
      mockVersionsRepo,
      mockVersionBlocksRepo,
      mockPrisma
    );
  });

  describe('listBlocksForVersion', () => {
    const versionId = 123;
    const profileId = 'user-123';

    it('should list blocks when profileId is not provided (legacy behavior)', async () => {
      mockVersionBlocksRepo.listVersionBlocks.mockResolvedValue([]);

      await service.listBlocksForVersion(versionId);

      expect(mockVersionBlocksRepo.listVersionBlocks).toHaveBeenCalledWith(versionId, undefined, expect.any(Object));
    });

    it('should throw error when profileId is provided but version belongs to another user', async () => {
        const otherProfileId = 'user-456';

        // Mock getVersionById to return version belonging to other user
        mockVersionsRepo.getVersionById.mockResolvedValue({
            id: versionId,
            profile_id: otherProfileId
        } as any);

        await expect(service.listBlocksForVersion(versionId, { profileId: profileId }))
            .rejects
            .toThrow(ServiceError);

        try {
            await service.listBlocksForVersion(versionId, { profileId: profileId });
        } catch (error: any) {
            expect(error.message).toBe('Version not found for this profile');
            expect(error.statusCode).toBe(404);
        }
    });

    it('should throw error when profileId is provided but version does not exist', async () => {
        // Mock getVersionById to return null
        mockVersionsRepo.getVersionById.mockResolvedValue(null);

        await expect(service.listBlocksForVersion(versionId, { profileId: profileId }))
            .rejects
            .toThrow(ServiceError);
    });

    it('should list blocks when profileId matches version owner', async () => {
        // Mock getVersionById to return version belonging to user
        mockVersionsRepo.getVersionById.mockResolvedValue({
            id: versionId,
            profile_id: profileId
        } as any);

        mockVersionBlocksRepo.listVersionBlocks.mockResolvedValue([]);

        await service.listBlocksForVersion(versionId, { profileId: profileId });

        expect(mockVersionsRepo.getVersionById).toHaveBeenCalledWith(versionId, expect.any(Object));
        expect(mockVersionBlocksRepo.listVersionBlocks).toHaveBeenCalled();
    });
  });
});
