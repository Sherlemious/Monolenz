import {
  prisma,
  ProfileBlockService,
  ProfileRepository,
  ProfileService,
  BlocksRepository,
  VersionsRepository,
  VersionBlocksRepository,
} from 'api/core';

let profileRepository: ProfileRepository | undefined;
let profileService: ProfileService | undefined;
let blockService: ProfileBlockService | undefined;

export function getProfileServices() {
  if (!profileRepository) {
    profileRepository = new ProfileRepository(prisma);
  }
  if (!profileService) {
    profileService = new ProfileService(profileRepository);
  }
  if (!blockService) {
    blockService = new ProfileBlockService(
      new BlocksRepository(prisma),
      new VersionsRepository(prisma),
      new VersionBlocksRepository(prisma),
      prisma
    );
  }

  return { profileRepository, profileService, blockService };
}
