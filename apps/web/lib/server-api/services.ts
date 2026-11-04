import {
  prisma,
  ProfileBlockService,
  ProfileRepository,
  ProfileService,
  ResumeRepository,
  ResumeService,
  BlocksRepository,
  VersionsRepository,
  VersionBlocksRepository,
} from 'api/core';

let profileRepository: ProfileRepository | undefined;
let profileService: ProfileService | undefined;
let blockService: ProfileBlockService | undefined;
let resumeService: ResumeService | undefined;
let versionsRepository: VersionsRepository | undefined;
let versionBlocksRepository: VersionBlocksRepository | undefined;

export function getProfileServices() {
  if (!profileRepository) {
    profileRepository = new ProfileRepository(prisma);
  }
  if (!profileService) {
    profileService = new ProfileService(profileRepository);
  }
  if (!versionsRepository) {
    versionsRepository = new VersionsRepository(prisma);
  }
  if (!versionBlocksRepository) {
    versionBlocksRepository = new VersionBlocksRepository(prisma);
  }
  if (!blockService) {
    blockService = new ProfileBlockService(
      new BlocksRepository(prisma),
      versionsRepository,
      versionBlocksRepository,
      prisma
    );
  }

  return { profileRepository, profileService, blockService };
}

export function getResumeService() {
  const { blockService } = getProfileServices();
  if (!resumeService) {
    resumeService = new ResumeService(
      new ResumeRepository(prisma),
      blockService,
      versionsRepository!,
      versionBlocksRepository!,
      prisma
    );
  }
  return resumeService;
}
