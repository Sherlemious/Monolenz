'use client';

import { ErrorState } from '@/app/components/ErrorState';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang='en'>
      <body>
        <ErrorState
          title='Something went wrong'
          description='An unexpected error occurred. You can retry or go home.'
          showRetry
          onRetry={reset}
        />
      </body>
    </html>
  );
}
