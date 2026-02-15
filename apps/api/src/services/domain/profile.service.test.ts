// @ts-nocheck
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { ProfileService } from './profile.service';

describe('ProfileService Security', () => {
  let service: ProfileService;
  let mockRepository: any;

  beforeEach(() => {
    // Create a manual mock object with all necessary methods
    mockRepository = {
      // BaseRepository methods
      findWithPagination: jest.fn(),
      findById: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),

      // ProfileRepository methods
      findByIdentifier: jest.fn(),
      findByUsername: jest.fn(),
      checkUsernameAvailability: jest.fn(),
    };

    service = new ProfileService(mockRepository);
  });

  it('should filter out private fields in search results', async () => {
    const mockProfiles = [
      {
        id: 'user1',
        username: 'user1',
        linkedin_url: 'https://linkedin.com/in/user1', // Private field
        github_url: 'https://github.com/user1', // Private field
        bio: 'Hello',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    // Mock findWithPagination return value
    mockRepository.findWithPagination.mockResolvedValue({
      data: mockProfiles,
      total: 1,
    });

    // Call searchProfiles
    const result = await service.searchProfiles({ page: 1, limit: 10 }, { userId: 'other-user' });

    expect(result.data).toHaveLength(1);

    // Expect failure initially: private fields are PRESENT
    // We assert they SHOULD be undefined, so if they are present, test fails.
    expect(result.data[0].linkedin_url).toBeUndefined();
    expect(result.data[0].github_url).toBeUndefined();

    expect(result.data[0].username).toBe('user1');
  });
});
