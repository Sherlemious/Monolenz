'use client';

/**
 * Username-only input for GitHub / LinkedIn with the domain shown as a fixed
 * prefix. Pasting a full profile link is accepted: the username is pulled out.
 */

import { extractSocialHandle, SOCIAL_PROFILES, type SocialKind } from '@monolenz/types/validation';
import { cn } from '@/lib/utils';

/** Clean up raw typing/pasting into the handle we keep in the field. */
export function toHandleInput(raw: string, kind: SocialKind): string {
  const value = raw.trim();
  if (/[/.:]/.test(value)) {
    const handle = extractSocialHandle(value, kind);
    if (handle) return handle;
  }
  return value.replace(/^@/, '').replace(/\s+/g, '');
}

/** Error text for a handle field, or null if blank / valid. */
export function socialHandleError(handle: string, kind: SocialKind): string | null {
  if (!handle.trim()) return null;
  if (extractSocialHandle(handle, kind)) return null;
  return kind === 'github'
    ? 'GitHub usernames use letters, numbers and single hyphens'
    : 'LinkedIn usernames are 3+ letters, numbers or hyphens';
}

interface SocialHandleInputProps {
  id: string;
  kind: SocialKind;
  value: string;
  onChange: (handle: string) => void;
  onBlur?: () => void;
  error?: string | null;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
}

export function SocialHandleInput({
  id,
  kind,
  value,
  onChange,
  onBlur,
  error,
  autoFocus,
  placeholder = 'username',
  className,
}: SocialHandleInputProps) {
  return (
    <div
      className={cn(
        'flex h-10 items-center rounded-md border bg-background shadow-xs transition-all',
        'focus-within:ring-[3px] focus-within:ring-ring/50 focus-within:border-ring',
        error && 'border-destructive focus-within:ring-destructive/20',
        className
      )}
    >
      <span className='pl-3 text-sm text-muted-foreground select-none whitespace-nowrap'>
        {SOCIAL_PROFILES[kind].prefix}
      </span>
      <input
        id={id}
        type='text'
        value={value}
        // Keep keystrokes as typed (minus spaces/@) so typing a full URL isn't cut short;
        // pull the username out on paste and when leaving the field.
        onChange={(e) => onChange(e.target.value.replace(/\s+/g, '').replace(/^@/, ''))}
        onPaste={(e) => {
          const pasted = e.clipboardData.getData('text');
          if (!pasted) return;
          e.preventDefault();
          onChange(toHandleInput(pasted, kind));
        }}
        onBlur={() => {
          const cleaned = toHandleInput(value, kind);
          if (cleaned !== value) onChange(cleaned);
          onBlur?.();
        }}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete='off'
        autoCapitalize='none'
        autoCorrect='off'
        spellCheck={false}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className='h-full min-w-0 flex-1 bg-transparent pr-3 text-sm outline-none placeholder:text-muted-foreground/60'
      />
    </div>
  );
}
