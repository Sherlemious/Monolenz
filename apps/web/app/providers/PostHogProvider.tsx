'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getPostHog, initPostHog } from '@/lib/analytics/posthog';

export function PostHogPageview(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    const posthog = getPostHog();
    if (pathname && posthog && posthog.__loaded) {
      const url = new URL(pathname, window.origin);
      if (searchParams && searchParams.toString()) {
        url.search = searchParams.toString();
      }

      posthog.capture('$pageview', {
        $current_url: url.toString(),
      });
    }
  }, [pathname, searchParams]);

  return null;
}

interface PostHogProviderProps {
  children: React.ReactNode;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  return (
    <>
      <PostHogPageview />
      {children}
    </>
  );
}
