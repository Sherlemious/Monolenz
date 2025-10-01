/**
 * ProfileCompleteness Component
 * Shows profile completion percentage and progress bar
 */

import { Progress } from '@/components/ui/progress';
import type { CompletenessResult } from '@/lib/utils/completeness';

interface ProfileCompletenessProps {
  completeness: CompletenessResult;
}

export function ProfileCompleteness({ completeness }: ProfileCompletenessProps) {
  const { percentage, message } = completeness;

  return (
    <div className="space-y-2 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Profile:</span>
        <span className="text-sm font-semibold">{percentage}%</span>
      </div>
      
      <Progress value={percentage} className="h-2" />
      
      <p className="text-xs text-muted-foreground text-center">
        {message}
      </p>
    </div>
  );
}

