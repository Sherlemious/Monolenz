/**
 * Username Validation Utilities
 * Centralized validation logic for username field
 */

import { isReservedUsername } from '@monolenz/types/validation';

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 50;
export const USERNAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

/**
 * Validates username format
 * @param username - The username to validate
 * @returns Error message if invalid, null if valid
 */
export function validateUsername(username: string): string | null {
  if (!username || username.length < USERNAME_MIN_LENGTH) {
    return `Username must be at least ${USERNAME_MIN_LENGTH} characters`;
  }
  if (username.length > USERNAME_MAX_LENGTH) {
    return `Username must be less than ${USERNAME_MAX_LENGTH} characters`;
  }
  if (!USERNAME_PATTERN.test(username)) {
    return 'Username can only contain letters, numbers, underscores, and hyphens';
  }
  if (isReservedUsername(username)) {
    return 'This username is reserved';
  }
  return null;
}

/**
 * Checks if username is valid for availability checking
 * @param username - The username to check
 * @returns true if username meets minimum requirements for API check
 */
export function isUsernameValidForChecking(username: string): boolean {
  return username.length >= USERNAME_MIN_LENGTH && USERNAME_PATTERN.test(username) && !isReservedUsername(username);
}

/**
 * Checks if username meets minimum length requirement
 * @param username - The username to check
 * @returns true if username meets minimum length
 */
export function meetsMinimumLength(username: string): boolean {
  return username.length >= USERNAME_MIN_LENGTH;
}
