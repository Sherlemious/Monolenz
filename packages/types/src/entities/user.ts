export interface User {
  id: string;
  email: string;
  email_confirmed_at?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  role?: UserRole;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
}

export interface Profile {
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

export interface PublicProfile {
  username: string;
  bio?: string;
  portfolio_url?: string;
  // Deliberately excludes private fields like id, email, etc.
}

export type UserRole = 'user' | 'admin' | 'moderator';
