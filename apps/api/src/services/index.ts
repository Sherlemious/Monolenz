import { prisma } from '../config/prisma';
import { ProfileRepository } from '../repositories/profile/profile';
import { ProfileService } from './domain/profile.service';

// Initialize repositories
const profileRepository = new ProfileRepository(prisma);

// Initialize services
export const profileService = new ProfileService(profileRepository);
