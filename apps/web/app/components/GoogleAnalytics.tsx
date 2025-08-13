'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, unknown>) => void;
  }
}

export function GoogleAnalytics({ ga_id }: { ga_id: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      const url = pathname + searchParams.toString();
      window.gtag('config', ga_id, {
        page_path: url,
      });
    }
  }, [pathname, searchParams, ga_id]);

  return null;
}
