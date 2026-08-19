'use client';

import { ErrorState } from '@/app/components/ErrorState';

export default function ErrorPage() {
  return <ErrorState showRetry description='An unexpected error occurred while loading this page.' />;
}
