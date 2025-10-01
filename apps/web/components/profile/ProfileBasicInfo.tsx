/**
 * ProfileBasicInfo Component
 * Displays username, bio, and social links
 */

import { Linkedin, Github, Globe } from 'lucide-react';
import type { BasicProfile } from '@/lib/types/profile';

interface ProfileBasicInfoProps {
  profile: BasicProfile;
}

export function ProfileBasicInfo({ profile }: ProfileBasicInfoProps) {
  const { username, bio, linkedin_url, github_url, portfolio_url } = profile;

  return (
    <div className="flex-1 space-y-2 text-center md:text-left">
      <h1 className="text-2xl font-bold">@{username}</h1>
      
      {bio ? (
        <p className="text-muted-foreground">{bio}</p>
      ) : (
        <p className="text-muted-foreground italic text-sm">
          No bio yet. Add one to tell others about yourself!
        </p>
      )}

      {/* Social Links */}
      {(linkedin_url || github_url || portfolio_url) && (
        <div className="flex gap-3 justify-center md:justify-start pt-2">
          {linkedin_url && (
            <a
              href={linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <Linkedin className="h-4 w-4" />
              <span>LinkedIn</span>
            </a>
          )}
          {github_url && (
            <a
              href={github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          )}
          {portfolio_url && (
            <a
              href={portfolio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <Globe className="h-4 w-4" />
              <span>Portfolio</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

