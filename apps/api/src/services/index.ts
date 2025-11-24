import { prisma } from '../config/prisma';
import { ProfileRepository } from '../repositories/profile/profile';
import { ProfileService } from './domain/profile.service';
import { Logger } from '../utils/logger';
import { MetricsCollector } from '../utils/metrics';

// Initialize shared dependencies
const logger = new Logger('ServiceContainer');
const metrics = new MetricsCollector();
// const cache = new CacheManager();

// Initialize repositories
const profileRepository = new ProfileRepository(prisma);

// Initialize services
export const profileService = new ProfileService(profileRepository);
