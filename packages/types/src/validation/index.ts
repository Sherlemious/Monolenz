import { z } from 'zod';
import { profileLinkSchemas } from './profile-link-schemas';
import { profileSchemas } from './profile-schemas';
import { profileBlockSchemas } from './profile-block-schemas';
export * from './common';
export * from './base-schemas';
export * from './profile-schemas';
export * from './profile-link-schemas';
export * from './auth-schemas';
export * from './profile-block-schemas';
export * from './block-schemas';

// Type helpers for extracting types from schemas
export type ProfileCreateData = z.infer<typeof profileSchemas.create>;
export type ProfileUpdateData = z.infer<typeof profileSchemas.update>;
export type ProfileResponse = z.infer<typeof profileSchemas.response>;
export type ProfileLinkCreateData = z.infer<typeof profileLinkSchemas.create>;
export type ProfileLinkResponse = z.infer<typeof profileLinkSchemas.response>;
export { profileBlockSchemas };
