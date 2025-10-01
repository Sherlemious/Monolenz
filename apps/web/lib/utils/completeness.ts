/**
 * Profile Completeness Calculation
 */

import type { BasicProfile } from '@/lib/types/profile';
import type { Block } from '@/lib/types/block';

export interface CompletenessResult {
  percentage: number;
  message: string;
}

/**
 * Calculate profile completeness percentage
 */
export function calculateCompleteness(
  profile: BasicProfile | null,
  blocks: Block[]
): CompletenessResult {
  if (!profile) {
    return { percentage: 0, message: "Just getting started!" };
  }

  let score = 0;
  const weights = {
    basicProfile: 30,
    work: 30,
    education: 20,
    projects: 20,
    skills: 20,
  };

  // Basic profile fields (30%)
  const basicFields = [
    profile.username,
    profile.bio,
    profile.profile_picture_url,
    profile.linkedin_url,
    profile.github_url,
    profile.portfolio_url,
  ];
  const filledBasicFields = basicFields.filter(Boolean).length;
  score += (filledBasicFields / basicFields.length) * weights.basicProfile;

  // Count blocks by section
  const blocksBySection = blocks.reduce((acc, block) => {
    acc[block.sectionName] = (acc[block.sectionName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Work experience (30%, max 2 blocks)
  const workCount = Math.min(blocksBySection['work'] || 0, 2);
  score += (workCount / 2) * weights.work;

  // Education (20%, max 2 blocks)
  const eduCount = Math.min(blocksBySection['education'] || 0, 2);
  score += (eduCount / 2) * weights.education;

  // Projects (20%, max 2 blocks)
  const projectCount = Math.min(blocksBySection['projects'] || 0, 2);
  score += (projectCount / 2) * weights.projects;

  // Skills (20%, max 4 blocks)
  const skillCount = Math.min(blocksBySection['skills'] || 0, 4);
  score += (skillCount / 4) * weights.skills;

  const percentage = Math.round(score);

  // Message based on percentage
  let message: string;
  if (percentage === 0) message = "Just getting started!";
  else if (percentage < 25) message = "Keep going!";
  else if (percentage < 50) message = "Looking good!";
  else if (percentage < 75) message = "Great progress!";
  else if (percentage < 100) message = "Almost there!";
  else message = "Profile complete! 🎉";

  return { percentage, message };
}

