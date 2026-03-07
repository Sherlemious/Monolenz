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

export interface LinkPlatform {
  id: number;
  name: string;
  display_name: string;
  category?: string | null;
  icon?: string | null;
  base_url?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ProfileLink {
  id: number;
  profile_id: string;
  platform_id?: number | null;
  url: string;
  label?: string | null;
  category?: string | null;
  is_public?: boolean | null;
  sort_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  link_platforms?: LinkPlatform | null;
}

export interface Profile {
  id: string;
  username: string;
  bio?: string;
  profile_picture_url?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
  profile_links?: ProfileLink[];
}

export interface PublicProfile {
  username: string;
  bio?: string;
  portfolio_url?: string;
  profile_picture_url?: string;
}

export type UserRole = 'user' | 'admin' | 'moderator';
