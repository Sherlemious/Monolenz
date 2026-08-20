import { HTTP_STATUS_CODES } from '@monolenz/types/api';
import { prisma } from '../../config/prisma';
import { ProfileLinkRepository, SyncLinkInput } from '../../repositories/profile/profile-link.repository';
import { ALLOWED_LINK_PROTOCOLS, normalizeLinkInput } from '../../utils/link-normalization';
import { ServiceError } from '../base.service';

const profileLinkRepository = new ProfileLinkRepository(prisma);

export function listActivePlatforms() {
  return profileLinkRepository.listActivePlatforms();
}

export function getLinksForProfile(profileId: string) {
  return profileLinkRepository.findByProfileId(profileId);
}

export async function syncProfileLinks(profileId: string, links: SyncLinkInput[]) {
  const platformIds = [...new Set(links.map((link) => link.platform_id).filter((id): id is number => id != null))];
  const platforms = platformIds.length > 0 ? await profileLinkRepository.getPlatformsByIds(platformIds) : [];
  const platformById = new Map(platforms.map((platform) => [platform.id, platform]));

  const normalizedLinks = links.map((link) => {
    if (link.platform_id == null) {
      return { ...link, url: normalizeLinkInput(link.url, undefined) };
    }

    const platform = platformById.get(link.platform_id);
    return {
      ...link,
      url: normalizeLinkInput(link.url, platform),
    };
  });

  const protocolErrors: string[] = [];
  normalizedLinks.forEach((link, index) => {
    try {
      const protocol = new URL(link.url).protocol;
      if (!ALLOWED_LINK_PROTOCOLS.has(protocol)) {
        protocolErrors.push(`links[${index}].url: URL protocol must be http, https, or mailto`);
      }
    } catch {
      protocolErrors.push(`links[${index}].url: Invalid URL`);
    }
  });

  if (protocolErrors.length > 0) {
    throw new ServiceError('Validation failed', protocolErrors, HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY);
  }

  if (platformIds.length > 0) {
    const validationErrors: string[] = [];

    normalizedLinks.forEach((link, index) => {
      if (link.platform_id == null) {
        return;
      }

      const platform = platformById.get(link.platform_id);
      if (!platform) {
        validationErrors.push(`links[${index}].platform_id: Unknown platform id ${link.platform_id}`);
        return;
      }

      if (!platform.url_pattern) {
        return;
      }

      try {
        const urlRegex = new RegExp(platform.url_pattern, 'i');
        if (!urlRegex.test(link.url)) {
          validationErrors.push(`links[${index}].url: URL does not match ${platform.display_name} expected pattern`);
        }
      } catch {
        validationErrors.push(
          `links[${index}].platform_id: Invalid URL pattern configured for ${platform.display_name}`
        );
      }
    });

    if (validationErrors.length > 0) {
      throw new ServiceError('Validation failed', validationErrors, HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY);
    }
  }

  return profileLinkRepository.syncLinks(profileId, normalizedLinks);
}
