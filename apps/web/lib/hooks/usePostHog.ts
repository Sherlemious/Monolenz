'use client';

import { useEffect, useState } from 'react';
import { getPostHog } from '@/lib/analytics/posthog';

type EventProperties = Record<string, string | number | boolean | null | undefined>;

export function usePostHog() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const posthog = getPostHog();
    if (posthog && posthog.__loaded) {
      setIsReady(true);
    }
  }, []);

  return {
    posthog: isReady ? getPostHog() : null,
    isReady,
  };
}

// Helper functions for common tracking events
export const trackEvent = (eventName: string, properties?: EventProperties) => {
  const posthog = getPostHog();
  if (posthog && posthog.__loaded) {
    posthog.capture(eventName, properties);
  }
};

export const identifyUser = (userId: string, traits?: EventProperties) => {
  const posthog = getPostHog();
  if (posthog && posthog.__loaded) {
    posthog.identify(userId, traits);
  }
};

export const resetUser = () => {
  const posthog = getPostHog();
  if (posthog && posthog.__loaded) {
    posthog.reset();
  }
};

export const setUserProperties = (properties: EventProperties) => {
  const posthog = getPostHog();
  if (posthog && posthog.__loaded) {
    posthog.people.set(properties);
  }
};

export const trackPageView = (pageName?: string) => {
  const posthog = getPostHog();
  if (posthog && posthog.__loaded) {
    posthog.capture('$pageview', {
      page_name: pageName,
    });
  }
};
