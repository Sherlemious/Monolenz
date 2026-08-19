'use client';

import { ErrorState } from '@/app/components/ErrorState';

export default function ErrorRoutePage() {
  return (
    <ErrorState
      title='Something went wrong'
      description='The link may have expired, or the request could not be completed.'
    />
  );
}
