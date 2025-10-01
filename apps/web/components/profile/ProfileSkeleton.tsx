/**
 * ProfileSkeleton Component
 * Loading state for profile page
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <Card>
        <CardHeader className="pb-6">
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
            {/* Avatar */}
            <Skeleton className="h-20 w-20 rounded-full" />
            
            {/* Info */}
            <div className="flex-1 space-y-2 text-center md:text-left">
              <Skeleton className="h-6 w-32 mx-auto md:mx-0" />
              <Skeleton className="h-4 w-64 mx-auto md:mx-0" />
              <div className="flex gap-2 justify-center md:justify-start">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>

            {/* Completeness */}
            <div className="w-full md:w-auto">
              <Skeleton className="h-20 w-full md:w-48" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Sections Skeleton */}
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

