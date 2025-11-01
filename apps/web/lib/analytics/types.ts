// PostHog TypeScript type definitions

export type AuthMethod = 'email' | 'google' | 'github';

export type EventProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface UserTraits extends EventProperties {
  email?: string;
  name?: string;
  plan?: string;
  created_at?: string;
  last_login?: string;
}

export interface ErrorEventProperties extends EventProperties {
  error_name: string;
  error_message?: string;
  error_stack?: string;
  component?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface FeatureEventProperties extends EventProperties {
  feature: string;
  feature_version?: string;
  user_role?: string;
}

export interface FormEventProperties extends EventProperties {
  form_name: string;
  success?: boolean;
  validation_error_count?: number;
}

// Event name constants for consistency
export const ANALYTICS_EVENTS = {
  // Auth
  USER_SIGNED_UP: 'user_signed_up',
  USER_SIGNED_IN: 'user_signed_in',
  USER_SIGNED_OUT: 'user_signed_out',
  
  // Dashboard
  DASHBOARD_VIEWED: 'dashboard_viewed',
  
  // Features
  FEATURE_USED: 'feature_used',
  
  // Forms
  FORM_STARTED: 'form_started',
  FORM_SUBMITTED: 'form_submitted',
  
  // Errors
  ERROR_OCCURRED: 'error_occurred',
  
  // Navigation
  PAGE_VIEW: '$pageview',
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
