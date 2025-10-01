/**
 * ProfileAvatar Component
 * Displays user avatar with fallback to initials
 */

import Image from 'next/image';

interface ProfileAvatarProps {
  username: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-12 w-12 text-sm',
  md: 'h-16 w-16 text-base md:h-20 md:w-20',
  lg: 'h-24 w-24 text-xl',
};

export function ProfileAvatar({ username, avatarUrl, size = 'md' }: ProfileAvatarProps) {
  // Generate initials from username
  const initials = username
    .split(/[\s_-]/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (avatarUrl) {
    return (
      <div className={`relative rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <Image
          src={avatarUrl}
          alt={`${username}'s avatar`}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  // Fallback to initials
  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full bg-primary/10 flex items-center justify-center
        font-semibold text-primary
      `}
    >
      {initials || username[0]?.toUpperCase() || '?'}
    </div>
  );
}

