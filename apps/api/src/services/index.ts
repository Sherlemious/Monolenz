import { prisma } from '../config/prisma';
import { ProfileRepository } from '../repositories/profile/profile';
import { ProfileService } from './domain/profile.service';
import { S3Service } from './infrastructure/s3.service';

// Initialize repositories
const profileRepository = new ProfileRepository(prisma);

// Initialize services
export const profileService = new ProfileService(profileRepository);
export const s3Service = new S3Service();
