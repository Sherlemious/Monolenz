import { Request, Response } from 'express';
import { ProfileBlockController } from './profile-block.controller';
import { ProfileBlockService } from '../../services/domain/profile-block.service';
import { ProfileRepository } from '../../repositories/profile/profile';
import { HTTP_STATUS_CODES } from '@monolenz/types/api';

// Mock Prisma to prevent connection attempts
jest.mock('../../config/prisma', () => ({
  prisma: {},
}));

// Mock asyncHandler to await the promise in tests
jest.mock('../../utils/async-handler', () => ({
  asyncHandler: (fn: any) => fn,
}));

describe('ProfileBlockController', () => {
  let controller: ProfileBlockController;
  let mockBlockService: jest.Mocked<ProfileBlockService>;
  let mockProfileRepository: jest.Mocked<ProfileRepository>;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockBlockService = {
      listBlocksForVersion: jest.fn(),
      getLatestVersion: jest.fn(),
      applyVersionUpdate: jest.fn(),
    } as unknown as jest.Mocked<ProfileBlockService>;

    mockProfileRepository = {
      findByIdentifier: jest.fn(),
    } as unknown as jest.Mocked<ProfileRepository>;

    controller = new ProfileBlockController(mockBlockService, mockProfileRepository);

    mockReq = {
      validatedParams: {},
      validatedQuery: {},
      validatedBody: {},
      userId: 'user-123',
      requestId: 'req-123',
      ip: '127.0.0.1',
      headers: { 'user-agent': 'jest' },
    };

    mockRes = {
      success: jest.fn(),
      error: jest.fn(),
      paginated: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('listBlocksForVersion', () => {
    it('should return blocks when profile found and service succeeds', async () => {
      // Setup
      mockReq.validatedParams = {
        identifier: 'valid-user',
        versionId: 100,
      };

      const mockProfile = { id: 'profile-123' };
      mockProfileRepository.findByIdentifier.mockResolvedValue(mockProfile as any);

      const mockBlocks = [{ id: 1 }] as any;
      mockBlockService.listBlocksForVersion.mockResolvedValue(mockBlocks);

      // Act
      await controller.listBlocksForVersion(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockProfileRepository.findByIdentifier).toHaveBeenCalledWith('valid-user');
      expect(mockBlockService.listBlocksForVersion).toHaveBeenCalledWith(100, 'profile-123', expect.anything());
      expect(mockRes.success).toHaveBeenCalledWith(mockBlocks, expect.any(String));
    });

    it('should return 404 when profile identifier not found', async () => {
      // Setup
      mockReq.validatedParams = {
        identifier: 'non-existent-user',
        versionId: 100,
      };

      mockProfileRepository.findByIdentifier.mockResolvedValue(null);

      // Act
      await controller.listBlocksForVersion(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.error).toHaveBeenCalledWith('Profile not found', HTTP_STATUS_CODES.NOT_FOUND);
      expect(mockBlockService.listBlocksForVersion).not.toHaveBeenCalled();
    });
  });
});
