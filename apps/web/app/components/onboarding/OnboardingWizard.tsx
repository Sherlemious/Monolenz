'use client';

/**
 * First-run onboarding: claim a username, write a short intro, add links.
 * A live preview shows exactly what the public page header will look like.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy, Loader2, X } from 'lucide-react';
import type { Profile } from '@monolenz/types/entities';
import { isSocialKind, isValidProfileUrl, normalizeProfileUrl, type ProfileUrlKind } from '@monolenz/types/validation';
import type { ProfileApi } from '@/lib/api/profile';
import { ApiError, describeApiError } from '@/lib/api/common';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { isUsernameValidForChecking, validateUsername } from '@/lib/validation/username';
import { ProfileHeader } from '@/app/components/profile/ProfileDocument';
import { PlatformIcon } from '@/app/components/profile/PlatformIcon';
import { SocialHandleInput, socialHandleError } from '@/app/components/profile/SocialHandleInput';

// ============================================================================
// Config
// ============================================================================

const STEPS = [
  { id: 'handle', label: 'Your URL' },
  { id: 'about', label: 'About you' },
  { id: 'links', label: 'Links' },
] as const;

type LinkField = 'linkedin_url' | 'github_url' | 'portfolio_url';
type Field = 'username' | 'bio' | LinkField;

const LINK_FIELDS: { key: LinkField; kind: ProfileUrlKind; label: string; icon: string; placeholder: string }[] = [
  { key: 'linkedin_url', kind: 'linkedin', label: 'LinkedIn', icon: 'linkedin', placeholder: 'your-name' },
  { key: 'github_url', kind: 'github', label: 'GitHub', icon: 'github', placeholder: 'username' },
  { key: 'portfolio_url', kind: 'portfolio', label: 'Website', icon: 'website', placeholder: 'yourname.com' },
];

const FIELD_STEP: Record<Field, number> = {
  username: 0,
  bio: 1,
  linkedin_url: 2,
  github_url: 2,
  portfolio_url: 2,
};

const BIO_MAX = 500;

function linkError(key: LinkField, raw: string): string | null {
  if (!raw.trim()) return null;
  const field = LINK_FIELDS.find((f) => f.key === key)!;
  if (isSocialKind(field.kind)) return socialHandleError(raw, field.kind);
  return isValidProfileUrl(normalizeProfileUrl(raw, field.kind)) ? null : "That doesn't look like a valid link";
}

// ============================================================================
// Component
// ============================================================================

interface OnboardingWizardProps {
  api: ProfileApi;
  onCreated: (profile: Profile) => void;
}

export function OnboardingWizard({ api, onCreated }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<Field, string>>({
    username: '',
    bio: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
  });
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [created, setCreated] = useState<Profile | null>(null);
  const [origin, setOrigin] = useState('');

  useEffect(() => setOrigin(window.location.host), []);

  // ---- Username availability ----------------------------------------------
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef('');

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const checkUsername = useCallback(
    (username: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      latestRef.current = username;
      if (!isUsernameValidForChecking(username)) {
        setUsernameStatus('idle');
        return;
      }
      setUsernameStatus('checking');
      timerRef.current = setTimeout(async () => {
        try {
          const result = await api.checkUsernameAvailability(username);
          if (latestRef.current === username) setUsernameStatus(result.available ? 'available' : 'taken');
        } catch {
          if (latestRef.current === username) setUsernameStatus('idle');
        }
      }, 400);
    },
    [api]
  );

  // ---- Derived state --------------------------------------------------------
  const usernameFormatError = values.username ? validateUsername(values.username) : null;
  const usernameError =
    serverErrors.username ??
    (usernameFormatError && touched.username ? usernameFormatError : null) ??
    (usernameStatus === 'taken' ? 'That username is taken. Try another.' : null);

  const linkErrors = useMemo(() => {
    const out: Partial<Record<LinkField, string>> = {};
    for (const f of LINK_FIELDS) {
      const e = serverErrors[f.key] ?? (touched[f.key] ? linkError(f.key, values[f.key]) : null);
      if (e) out[f.key] = e;
    }
    return out;
  }, [serverErrors, touched, values]);

  const canContinue = (() => {
    if (step === 0) {
      return (
        !!values.username &&
        !usernameFormatError &&
        !serverErrors.username &&
        usernameStatus !== 'taken' &&
        usernameStatus !== 'checking'
      );
    }
    if (step === 1) return values.bio.length <= BIO_MAX;
    return true;
  })();

  const previewProfile = useMemo<Profile>(() => {
    const link = (f: (typeof LINK_FIELDS)[number]) => {
      const v = normalizeProfileUrl(values[f.key], f.kind);
      return v && isValidProfileUrl(v, f.kind) ? v : undefined;
    };
    return {
      id: 'preview',
      username: values.username.trim() || 'yourname',
      bio: values.bio.trim() || undefined,
      linkedin_url: link(LINK_FIELDS[0]!),
      github_url: link(LINK_FIELDS[1]!),
      portfolio_url: link(LINK_FIELDS[2]!),
      created_at: new Date(),
      updated_at: new Date(),
    };
  }, [values]);

  // ---- Handlers -------------------------------------------------------------
  function setField(key: Field, raw: string) {
    const value = key === 'username' ? raw.toLowerCase().replace(/\s+/g, '-') : raw;
    setValues((prev) => ({ ...prev, [key]: value }));
    setServerErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setFormError(null);
    if (key === 'username') checkUsername(value);
  }

  function blur(key: Field) {
    setTouched((prev) => ({ ...prev, [key]: true }));
    const f = LINK_FIELDS.find((l) => l.key === key);
    if (f && !isSocialKind(f.kind)) {
      // Show the cleaned-up URL once they leave the field
      const normalized = normalizeProfileUrl(values[key], f.kind);
      if (normalized && isValidProfileUrl(normalized, f.kind)) setValues((prev) => ({ ...prev, [key]: normalized }));
    }
  }

  function goTo(next: number) {
    setFormError(null);
    setStep(next);
  }

  async function submit() {
    // Validate everything client-side first
    const localLinkErrors: Partial<Record<Field, string>> = {};
    for (const f of LINK_FIELDS) {
      const e = linkError(f.key, values[f.key]);
      if (e) localLinkErrors[f.key] = e;
    }
    if (Object.keys(localLinkErrors).length > 0) {
      setTouched((prev) => ({ ...prev, linkedin_url: true, github_url: true, portfolio_url: true }));
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      const payload: Parameters<ProfileApi['createProfile']>[0] = { username: values.username.trim() };
      const bio = values.bio.trim();
      if (bio) payload.bio = bio;
      for (const f of LINK_FIELDS) {
        const v = normalizeProfileUrl(values[f.key], f.kind);
        if (v) payload[f.key] = v;
      }
      const profile = await api.createProfile(payload);
      setCreated(profile);
    } catch (err) {
      const { message, fieldErrors } = describeApiError(err, 'We couldn’t create your profile. Please try again.');
      const mapped: Partial<Record<Field, string>> = {};
      for (const [k, v] of Object.entries(fieldErrors)) {
        if (k in FIELD_STEP) mapped[k as Field] = v;
      }
      if (err instanceof ApiError && err.status === 409) {
        mapped.username = 'Someone just claimed that username. Try another.';
      }
      const fields = Object.keys(mapped) as Field[];
      if (fields.length > 0) {
        setServerErrors(mapped);
        setStep(Math.min(...fields.map((f) => FIELD_STEP[f])));
      } else {
        setFormError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleContinue(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canContinue || isSubmitting) {
      if (step === 0) setTouched((prev) => ({ ...prev, username: true }));
      return;
    }
    if (step < STEPS.length - 1) goTo(step + 1);
    else void submit();
  }

  // ---- Success --------------------------------------------------------------
  if (created) {
    return <SuccessScreen profile={created} host={origin} onDone={() => onCreated(created)} />;
  }

  // ---- Wizard ---------------------------------------------------------------
  const isLast = step === STEPS.length - 1;
  const linksFilled = LINK_FIELDS.some((f) => values[f.key].trim());
  const primaryLabel = isLast ? 'Create my page' : step === 1 && !values.bio.trim() ? 'Skip for now' : 'Continue';

  return (
    <div className='min-h-full flex items-start lg:items-center justify-center px-4 sm:px-6 py-10 lg:py-16'>
      <div className='w-full max-w-5xl grid gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-14 items-start'>
        {/* ---------------- Form column ---------------- */}
        <div className='w-full max-w-md mx-auto lg:mx-0'>
          <p className='text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground'>
            Welcome to Monolenz
          </p>

          {/* Stepper */}
          <ol className='mt-5 grid grid-cols-3 gap-2' aria-label='Progress'>
            {STEPS.map((s, i) => {
              const done = i < step;
              const current = i === step;
              return (
                <li key={s.id}>
                  <button
                    type='button'
                    disabled={!done}
                    onClick={() => goTo(i)}
                    aria-current={current ? 'step' : undefined}
                    className='group w-full text-left disabled:cursor-default'
                  >
                    <span
                      className={cn(
                        'block h-1 rounded-full transition-colors duration-300',
                        done || current ? 'bg-foreground' : 'bg-border'
                      )}
                    />
                    <span
                      className={cn(
                        'mt-2 block text-[12px] transition-colors',
                        current ? 'text-foreground font-medium' : 'text-muted-foreground',
                        done && 'group-hover:text-foreground'
                      )}
                    >
                      {s.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <form
            key={step}
            noValidate
            onSubmit={handleContinue}
            className='mt-8 animate-in fade-in slide-in-from-bottom-2 duration-300'
          >
            {step === 0 && (
              <>
                <h1 className='font-serif text-[34px] sm:text-[40px] leading-[1.05] tracking-[-0.01em]'>
                  Claim your page
                </h1>
                <p className='mt-2 text-sm text-muted-foreground'>
                  Pick a username. It becomes your public address and you can change it later.
                </p>

                <div className='mt-7 space-y-2'>
                  <Label htmlFor='ob-username'>Username</Label>
                  <div
                    className={cn(
                      'flex h-11 items-center rounded-md border bg-background shadow-xs transition-all',
                      'focus-within:ring-[3px] focus-within:ring-ring/50 focus-within:border-ring',
                      usernameError && 'border-destructive focus-within:ring-destructive/20'
                    )}
                  >
                    <span className='pl-3 text-sm text-muted-foreground select-none whitespace-nowrap'>
                      {origin || 'monolenz'}/
                    </span>
                    <input
                      id='ob-username'
                      value={values.username}
                      onChange={(e) => setField('username', e.target.value)}
                      onBlur={() => blur('username')}
                      placeholder='yourname'
                      autoFocus
                      autoComplete='username'
                      autoCapitalize='none'
                      autoCorrect='off'
                      spellCheck={false}
                      maxLength={50}
                      aria-invalid={!!usernameError}
                      aria-describedby='ob-username-status'
                      className='h-full min-w-0 flex-1 bg-transparent pr-2 text-sm outline-none placeholder:text-muted-foreground/60'
                    />
                    <span className='pr-3 flex items-center' aria-hidden>
                      {usernameStatus === 'checking' && (
                        <Loader2 className='size-4 animate-spin text-muted-foreground' />
                      )}
                      {usernameStatus === 'available' && !usernameError && (
                        <Check className='size-4 text-emerald-600' strokeWidth={2.5} />
                      )}
                      {usernameStatus === 'taken' && <X className='size-4 text-destructive' strokeWidth={2.5} />}
                    </span>
                  </div>
                  <p
                    id='ob-username-status'
                    aria-live='polite'
                    className={cn(
                      'min-h-[18px] text-[12px]',
                      usernameError ? 'text-destructive' : 'text-muted-foreground'
                    )}
                  >
                    {usernameError ??
                      (usernameStatus === 'checking'
                        ? 'Checking availability…'
                        : usernameStatus === 'available'
                          ? 'Nice — it’s yours if you want it.'
                          : 'Letters, numbers, hyphens and underscores. At least 3 characters.')}
                  </p>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <h1 className='font-serif text-[34px] sm:text-[40px] leading-[1.05] tracking-[-0.01em]'>
                  Introduce yourself
                </h1>
                <p className='mt-2 text-sm text-muted-foreground'>
                  A sentence or two at the top of your page. What you do and what you care about.
                </p>

                <div className='mt-7 space-y-2'>
                  <Label htmlFor='ob-bio'>Short bio</Label>
                  <Textarea
                    id='ob-bio'
                    value={values.bio}
                    onChange={(e) => setField('bio', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleContinue();
                    }}
                    placeholder='Product engineer in Cairo. I build fast, quiet software and write about it.'
                    autoFocus
                    rows={4}
                    maxLength={BIO_MAX}
                    aria-invalid={!!serverErrors.bio}
                    className='min-h-[120px] text-sm md:text-sm'
                  />
                  <div className='flex justify-between text-[12px]'>
                    <span className='text-destructive'>{serverErrors.bio}</span>
                    <span
                      className={cn(
                        'tabular-nums',
                        values.bio.length > BIO_MAX * 0.9 ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {values.bio.length}/{BIO_MAX}
                    </span>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className='font-serif text-[34px] sm:text-[40px] leading-[1.05] tracking-[-0.01em]'>
                  Where can people find you?
                </h1>
                <p className='mt-2 text-sm text-muted-foreground'>
                  All optional. Just your username for GitHub and LinkedIn.
                </p>

                <div className='mt-7 space-y-4'>
                  {LINK_FIELDS.map((f, i) => {
                    const err = linkErrors[f.key];
                    return (
                      <div key={f.key} className='space-y-1.5'>
                        <Label htmlFor={`ob-${f.key}`} className='flex items-center gap-2'>
                          <PlatformIcon name={f.icon} className='size-3.5 text-muted-foreground' />
                          {f.label}
                        </Label>
                        {isSocialKind(f.kind) ? (
                          <SocialHandleInput
                            id={`ob-${f.key}`}
                            kind={f.kind}
                            value={values[f.key]}
                            onChange={(v) => setField(f.key, v)}
                            onBlur={() => blur(f.key)}
                            placeholder={f.placeholder}
                            error={err}
                            autoFocus={i === 0}
                          />
                        ) : (
                          <Input
                            id={`ob-${f.key}`}
                            type='text'
                            inputMode='url'
                            autoComplete='url'
                            autoCapitalize='none'
                            autoCorrect='off'
                            spellCheck={false}
                            autoFocus={i === 0}
                            value={values[f.key]}
                            onChange={(e) => setField(f.key, e.target.value)}
                            onBlur={() => blur(f.key)}
                            placeholder={f.placeholder}
                            aria-invalid={!!err}
                            aria-describedby={err ? `ob-${f.key}-err` : undefined}
                            className='h-10'
                          />
                        )}
                        {err && (
                          <p id={`ob-${f.key}-err`} className='text-[12px] text-destructive'>
                            {err}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {formError && (
              <div
                role='alert'
                className='mt-6 rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive'
              >
                {formError}
              </div>
            )}

            {/* Actions */}
            <div className='mt-8 flex items-center gap-2'>
              {step > 0 && (
                <Button type='button' variant='ghost' onClick={() => goTo(step - 1)} disabled={isSubmitting}>
                  <ArrowLeft className='size-4' />
                  Back
                </Button>
              )}
              <div className='ml-auto flex items-center gap-2'>
                {isLast && !linksFilled && !isSubmitting && (
                  <span className='hidden sm:inline text-[12px] text-muted-foreground mr-1'>
                    You can add these later
                  </span>
                )}
                <Button
                  type='submit'
                  size='lg'
                  disabled={!canContinue || isSubmitting}
                  variant={step === 1 && !values.bio.trim() ? 'outline' : 'default'}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className='size-4 animate-spin' />
                      Creating…
                    </>
                  ) : (
                    <>
                      {primaryLabel}
                      {!isLast && <ArrowRight className='size-4' />}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* ---------------- Preview column ---------------- */}
        <aside className='hidden lg:block' aria-label='Live preview'>
          <div className='sticky top-10'>
            <div className='flex items-center justify-between mb-3'>
              <p className='text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground'>Preview</p>
              <p className='text-[12px] text-muted-foreground truncate max-w-[60%]'>
                {origin || 'monolenz'}/{values.username || 'yourname'}
              </p>
            </div>
            <div className='rounded-xl border bg-card shadow-[0_1px_2px_rgb(0_0_0/0.03)] overflow-hidden'>
              <div className='flex items-center gap-1.5 border-b px-4 py-2.5 bg-secondary/50' aria-hidden>
                <span className='size-2.5 rounded-full bg-border-strong/60' />
                <span className='size-2.5 rounded-full bg-border-strong/60' />
                <span className='size-2.5 rounded-full bg-border-strong/60' />
              </div>
              <div className='px-8 py-10'>
                <ProfileHeader profile={previewProfile} />
                <div className='mt-10 space-y-3' aria-hidden>
                  <div className='h-2.5 w-24 rounded-full bg-secondary' />
                  <div className='h-2 w-full rounded-full bg-secondary/70' />
                  <div className='h-2 w-5/6 rounded-full bg-secondary/70' />
                  <div className='h-2 w-2/3 rounded-full bg-secondary/70' />
                </div>
                <p className='mt-6 text-[12px] text-muted-foreground'>
                  Experience, skills and projects go here. You&apos;ll add them next.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ============================================================================
// Success
// ============================================================================

function SuccessScreen({ profile, host, onDone }: { profile: Profile; host: string; onDone: () => void }) {
  const [copied, setCopied] = useState(false);
  const path = `/${profile.username}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the URL is visible anyway */
    }
  }

  return (
    <div className='min-h-full flex items-center justify-center px-4 sm:px-6 py-16'>
      <div className='w-full max-w-md text-center animate-in fade-in zoom-in-95 duration-300'>
        <div className='mx-auto size-14 rounded-full bg-brand/20 flex items-center justify-center'>
          <Check className='size-7 text-brand-ink' strokeWidth={2.5} />
        </div>
        <h1 className='mt-6 font-serif text-[40px] leading-tight'>Your page is live.</h1>
        <p className='mt-2 text-sm text-muted-foreground'>
          Now add your experience, skills and projects. They show up on your page and in every résumé you print.
        </p>

        <div className='mt-7 flex items-center gap-2 rounded-lg border bg-secondary/40 pl-3.5 pr-1.5 py-1.5 text-left'>
          <span className='flex-1 truncate text-sm'>
            <span className='text-muted-foreground'>{host}</span>
            {path}
          </span>
          <Button type='button' variant='ghost' size='sm' onClick={copy}>
            {copied ? <Check className='size-3.5' /> : <Copy className='size-3.5' />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button variant='ghost' size='sm' asChild>
            <a href={path} target='_blank' rel='noopener noreferrer' aria-label='Open your public page'>
              <ArrowUpRight className='size-3.5' />
            </a>
          </Button>
        </div>

        <div className='mt-8 flex flex-col gap-2'>
          <Button asChild size='lg'>
            <Link href='/dashboard/profile/edit'>
              Add your experience <ArrowRight className='size-4' />
            </Link>
          </Button>
          <Button variant='ghost' onClick={onDone}>
            I&apos;ll do this later
          </Button>
        </div>
      </div>
    </div>
  );
}
