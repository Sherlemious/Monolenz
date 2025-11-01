import posthog from 'posthog-js';

export const initPostHog = () => {
  if (typeof window === 'undefined') {
    return;
  }

  // Check if already initialized
  if (posthog.__loaded) {
    return;
  }

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!apiKey || apiKey === 'your_posthog_project_api_key') {
    return;
  }

  try {
    posthog.init(apiKey, {
      api_host: apiHost || 'https://us.i.posthog.com',
      ui_host: 'https://us.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false, // We'll handle this manually in Next.js
      capture_pageleave: true,
      disable_session_recording: true,
      persistence: 'localStorage',
      respect_dnt: true,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          posthog.debug();
        }
      },
    });
  } catch (error) {
    // Silently fail - PostHog is not critical
    if (process.env.NODE_ENV === 'development') {
      console.warn('PostHog initialization failed:', error);
    }
  }
};

// Only export posthog for client-side usage
export const getPostHog = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return posthog;
};

export { posthog };
