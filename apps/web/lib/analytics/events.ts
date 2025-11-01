'use client';

import { trackEvent, identifyUser, resetUser } from '@/lib/hooks/usePostHog';

type EventProperties = Record<string, string | number | boolean | null | undefined>;

export const analytics = {
  // Auth events
  trackSignUp: (method: 'email' | 'google' | 'github') => {
    trackEvent('user_signed_up', {
      method,
      timestamp: new Date().toISOString(),
    });
  },

  trackSignIn: (method: 'email' | 'google' | 'github') => {
    trackEvent('user_signed_in', {
      method,
      timestamp: new Date().toISOString(),
    });
  },

  trackSignOut: () => {
    trackEvent('user_signed_out', {
      timestamp: new Date().toISOString(),
    });
    resetUser();
  },

  // User identification
  identifyUser: (userId: string, email?: string, additionalProps?: EventProperties) => {
    identifyUser(userId, {
      email,
      ...additionalProps,
    });
  },

  // Dashboard events
  trackDashboardView: () => {
    trackEvent('dashboard_viewed');
  },

  trackFeatureUsed: (featureName: string, metadata?: EventProperties) => {
    trackEvent('feature_used', {
      feature: featureName,
      ...metadata,
    });
  },

  // Error tracking
  trackError: (errorName: string, errorMessage?: string, metadata?: EventProperties) => {
    trackEvent('error_occurred', {
      error_name: errorName,
      error_message: errorMessage,
      ...metadata,
    });
  },

  // Form events
  trackFormStarted: (formName: string) => {
    trackEvent('form_started', {
      form_name: formName,
    });
  },

  trackFormSubmitted: (formName: string, success: boolean) => {
    trackEvent('form_submitted', {
      form_name: formName,
      success,
    });
  },

  // Custom events
  trackCustomEvent: (eventName: string, properties?: EventProperties) => {
    trackEvent(eventName, properties);
  },
};
