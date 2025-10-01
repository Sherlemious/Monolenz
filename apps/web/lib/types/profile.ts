/**
 * Profile Types
 */

export interface BasicProfile {
  id: string;
  username: string;
  bio?: string;
  profile_picture_url?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  created_at: string;
  updated_at: string;
}

export interface BasicProfileUpdate {
  username?: string;
  bio?: string;
  profile_picture_url?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
}

export interface UsernameAvailability {
  username: string;
  available: boolean;
}

