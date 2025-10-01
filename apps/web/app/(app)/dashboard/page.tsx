"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input, Label } from '@/components/ui/input';

type AppStatus = 'New' | 'In Review' | 'Interview' | 'Offer' | 'Accepted' | 'Rejected';

const STATUS_ORDER: AppStatus[] = ['New', 'In Review', 'Interview', 'Offer', 'Accepted', 'Rejected'];
const NON_TERMINAL: AppStatus[] = ['New', 'In Review', 'Interview', 'Offer'];
const TERMINAL: AppStatus[] = ['Accepted', 'Rejected'];

function nextOf(s: AppStatus): AppStatus | undefined {
  const i = STATUS_ORDER.indexOf(s);
  if (i < 0) return undefined;
  return STATUS_ORDER[i + 1];
}

function prevOf(s: AppStatus): AppStatus | undefined {
  const i = STATUS_ORDER.indexOf(s);
  if (i <= 0) return undefined;
  return STATUS_ORDER[i - 1];
}

function isValidTransition(from: AppStatus, to: AppStatus): boolean {
  if (from === to) return true;
  if (nextOf(from) === to) return true;
  if (NON_TERMINAL.includes(from) && prevOf(from) === to) return true;
  if (TERMINAL.includes(from) && to === 'In Review') return true;
  return false;
}

type OpenKey = 'applications' | 'portfolio' | 'details' | null;

type PortfolioItem = {
  id: string;
  title: string;
  type: string;
  url: string;
  published: boolean;
  createdAt: string;
};

type Details = {
  fullName: string;
  email: string;
  headline: string;
  phone?: string;
  location?: string;
  links?: { github?: string; linkedin?: string };
};

export default function DashboardPage() {
  const [appStatus, setAppStatus] = useState<AppStatus>('New');
  const [appStatusDraft, setAppStatusDraft] = useState<AppStatus>('New');
  const [appError, setAppError] = useState<string | null>(null);

  const [counters, setCounters] = useState<{ new: number; inReview: number; interview: number; offer: number }>({
    new: 1,
    inReview: 0,
    interview: 0,
    offer: 0,
  });

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([
    {
      id: '1',
      title: 'Personal Site',
      type: 'project',
      url: 'https://example.com',
      published: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
  ]);
  const [newItem, setNewItem] = useState<Pick<PortfolioItem, 'title' | 'type' | 'url'>>({ title: '', type: 'project', url: '' });
  const [portfolioError, setPortfolioError] = useState<string | null>(null);

  const [details, setDetails] = useState<Details>({
    fullName: 'Your Name',
    email: 'you@example.com',
    headline: 'Product engineer focused on delightful UX',
  });
  const [detailsDraft, setDetailsDraft] = useState(details);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [open, setOpen] = useState<OpenKey>(null);
  const appFormRef = useRef<HTMLDivElement | null>(null);
  const portFormRef = useRef<HTMLDivElement | null>(null);
  const detFormRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function applyFromHash(h: string) {
      const key = (h?.replace(/^#/, '') || '') as OpenKey;
      if (key === 'applications' || key === 'portfolio' || key === 'details') {
        setOpen(key);
      } else {
        setOpen(null);
      }
    }
    applyFromHash(window.location.hash);
    const onHash = () => applyFromHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const map: Record<Exclude<OpenKey, null>, React.RefObject<HTMLDivElement | null>> = {
      applications: appFormRef,
      portfolio: portFormRef,
      details: detFormRef,
    };
    if (!open) return;
    const ref = map[open];
    const node = ref?.current;
    if (node) {
      const firstInput = node.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      firstInput?.focus();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(null);
        history.replaceState(null, '', window.location.pathname);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function openKey(key: Exclude<OpenKey, null>) {
    setOpen(key);
    if (window.location.hash !== `#${key}`) {
      history.replaceState(null, '', `#${key}`);
    }
  }
  function closeOpen() {
    setOpen(null);
    history.replaceState(null, '', window.location.pathname);
  }

  const summary = useMemo(() => {
    const active = counters.inReview + counters.interview + counters.offer;
    const awaiting = counters.new;
    const interviews = counters.interview;
    const firstItem = portfolio[0];
    const lastPortfolioUpdated = firstItem ? new Date(firstItem.createdAt) : null;
    function relative(t?: Date | null) {
      if (!t) return '—';
      const diff = Date.now() - t.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days <= 0) return 'today';
      if (days === 1) return '1 day ago';
      return `${days} days ago`;
    }
    const completeness = computeCompleteness(details);
    return {
      applications: { active, awaiting, interviews },
      portfolio: { items: portfolio.length, lastUpdated: relative(lastPortfolioUpdated) },
      details: { completeness, lastEdit: 'just now' },
    };
  }, [counters, portfolio, details]);

  function saveAppStatus() {
    setAppError(null);
    if (!isValidTransition(appStatus, appStatusDraft)) {
      setAppError('Invalid status transition based on business rules.');
      return;
    }
    setCounters((c) => {
      const mapKey = (s: AppStatus) => (s === 'New' ? 'new' : s === 'In Review' ? 'inReview' : s === 'Interview' ? 'interview' : s === 'Offer' ? 'offer' : null);
      const fromKey = mapKey(appStatus);
      const toKey = mapKey(appStatusDraft);
      const next = { ...c } as any;
      if (fromKey && next[fromKey] > 0) next[fromKey] -= 1;
      if (toKey) next[toKey] += 1;
      return next;
    });
    setAppStatus(appStatusDraft);
    closeOpen();
  }

  function addPortfolioItem() {
    setPortfolioError(null);
    if (!newItem.title || !newItem.type || !newItem.url) {
      setPortfolioError('Title, type, and URL are required.');
      return;
    }
    const item: PortfolioItem = {
      id: String(Date.now()),
      title: newItem.title.trim(),
      type: newItem.type,
      url: newItem.url.trim(),
      published: false,
      createdAt: new Date().toISOString(),
    };
    setPortfolio((p) => [item, ...p].slice(0, 10));
    setNewItem({ title: '', type: 'project', url: '' });
  }

  function saveDetails() {
    setDetailsError(null);
    if (!detailsDraft.fullName.trim() || !detailsDraft.email.trim() || !detailsDraft.headline.trim()) {
      setDetailsError('Full name, email, and headline are required.');
      return;
    }
    setDetails(detailsDraft);
    closeOpen();
  }

  return (
    <div className='p-8'>
      <h1 className='text-3xl font-bold mb-6'>Dashboard</h1>

      <div className='mb-6 grid grid-cols-1 gap-3 text-sm text-muted-foreground md:grid-cols-3'>
        <div className='flex items-center justify-between rounded-lg border bg-card/50 px-4 py-3'>
          <div className='font-medium text-foreground'>Applications</div>
          <div className='flex items-center gap-3'>
            <span>Active {summary.applications.active}</span>
            <span>Awaiting {summary.applications.awaiting}</span>
            <span>Interviews {summary.applications.interviews}</span>
          </div>
        </div>
        <div className='flex items-center justify-between rounded-lg border bg-card/50 px-4 py-3'>
          <div className='font-medium text-foreground'>Portfolio</div>
          <div className='flex items-center gap-3'>
            <span>Items {summary.portfolio.items}</span>
            <span>Last updated {summary.portfolio.lastUpdated}</span>
          </div>
        </div>
        <div className='flex items-center justify-between rounded-lg border bg-card/50 px-4 py-3'>
          <div className='font-medium text-foreground'>Details</div>
          <div className='flex items-center gap-3'>
            <span>Completeness {summary.details.completeness}%</span>
            <span>Last edit {summary.details.lastEdit}</span>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader className='border-b'>
            <CardTitle className='text-xl'>Applications</CardTitle>
            <CardDescription>Track progress</CardDescription>
            <CardAction>
              <Button onClick={() => (open === 'applications' ? closeOpen() : openKey('applications'))} aria-expanded={open === 'applications'} aria-controls='expander-applications'>
                Update Status
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className='py-6'>
            <div className='mb-4 flex flex-wrap gap-2'>
              <Badge variant='outline'>New {counters.new}</Badge>
              <Badge variant='outline'>In Review {counters.inReview}</Badge>
              <Badge variant='outline'>Interview {counters.interview}</Badge>
              <Badge variant='outline'>Offer {counters.offer}</Badge>
              <Badge variant='secondary'>{appStatus}</Badge>
            </div>
            <div id='expander-applications' role='region' aria-label='Update application status' className={`overflow-hidden rounded-lg border transition-[grid-template-rows,opacity] ${open === 'applications' ? 'grid grid-rows-[1fr] opacity-100' : 'grid grid-rows-[0fr] opacity-0'}`}>
              <div ref={appFormRef} className='min-h-0 px-4 py-4 sm:px-5'>
                {appError && (
                  <div role='alert' className='mb-3 rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive'>
                    {appError}
                  </div>
                )}
                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='grid gap-2'>
                    <Label htmlFor='status'>Current status</Label>
                    <Input id='status' value={appStatus} readOnly />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='new-status'>Change to</Label>
                    <select id='new-status' className='h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50' value={appStatusDraft} onChange={(e) => setAppStatusDraft(e.target.value as AppStatus)}>
                      {STATUS_ORDER.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className='mt-4 flex items-center gap-2'>
                  <Button onClick={saveAppStatus}>Save</Button>
                  <Button variant='outline' onClick={closeOpen}>Cancel</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='border-b'>
            <CardTitle className='text-xl'>Portfolio</CardTitle>
            <CardDescription>Showcase your best</CardDescription>
            <CardAction>
              <Button onClick={() => (open === 'portfolio' ? closeOpen() : openKey('portfolio'))} aria-expanded={open === 'portfolio'} aria-controls='expander-portfolio'>
                Manage Portfolio
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className='py-6'>
            <div className='mb-4 grid gap-3'>
              {portfolio.slice(0, 3).map((item) => (
                <div key={item.id} className='flex items-center justify-between rounded-md border px-3 py-2'>
                  <div>
                    <div className='font-medium'>{item.title}</div>
                    <div className='text-xs text-muted-foreground'>
                      {item.type} · {item.url}
                    </div>
                  </div>
                  <Badge variant={item.published ? 'default' : 'outline'}>{item.published ? 'Published' : 'Private'}</Badge>
                </div>
              ))}
              {portfolio.length === 0 && (
                <div className='rounded-md border border-dashed px-3 py-6 text-center text-sm text-muted-foreground'>No items yet — add your first piece.</div>
              )}
            </div>
            <div id='expander-portfolio' role='region' aria-label='Manage portfolio' className={`overflow-hidden rounded-lg border transition-[grid-template-rows,opacity] ${open === 'portfolio' ? 'grid grid-rows-[1fr] opacity-100' : 'grid grid-rows-[0fr] opacity-0'}`}>
              <div ref={portFormRef} className='min-h-0 px-4 py-4 sm:px-5'>
                {portfolioError && (
                  <div role='alert' className='mb-3 rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive'>
                    {portfolioError}
                  </div>
                )}
                <div className='grid gap-4 sm:grid-cols-3'>
                  <div className='grid gap-2 sm:col-span-1'>
                    <Label htmlFor='p-title'>Title</Label>
                    <Input id='p-title' value={newItem.title} onChange={(e) => setNewItem((n) => ({ ...n, title: e.target.value }))} placeholder='e.g., Case Study' />
                  </div>
                  <div className='grid gap-2 sm:col-span-1'>
                    <Label htmlFor='p-type'>Type</Label>
                    <select id='p-type' className='h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50' value={newItem.type} onChange={(e) => setNewItem((n) => ({ ...n, type: e.target.value }))}>
                      <option value='project'>project</option>
                      <option value='repo'>repo</option>
                      <option value='article'>article</option>
                    </select>
                  </div>
                  <div className='grid gap-2 sm:col-span-1'>
                    <Label htmlFor='p-url'>URL</Label>
                    <Input id='p-url' value={newItem.url} onChange={(e) => setNewItem((n) => ({ ...n, url: e.target.value }))} placeholder='https://…' />
                  </div>
                </div>
                <div className='mt-4 flex items-center gap-2'>
                  <Button onClick={addPortfolioItem}>Add Item</Button>
                  <Button variant='outline' onClick={closeOpen}>Close</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='border-b'>
            <CardTitle className='text-xl'>Details / Account</CardTitle>
            <CardDescription>Key info at a glance</CardDescription>
            <CardAction>
              <Button onClick={() => (open === 'details' ? closeOpen() : openKey('details'))} aria-expanded={open === 'details'} aria-controls='expander-details'>
                Update Info
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className='py-6'>
            <div className='grid gap-2'>
              <div className='font-medium'>{details.headline}</div>
              <div className='text-sm text-muted-foreground'>
                {details.fullName} · {details.email}
              </div>
            </div>
            <div id='expander-details' role='region' aria-label='Update account details' className={`overflow-hidden rounded-lg border transition-[grid-template-rows,opacity] ${open === 'details' ? 'grid grid-rows-[1fr] opacity-100' : 'grid grid-rows-[0fr] opacity-0'}`}>
              <div ref={detFormRef} className='min-h-0 px-4 py-4 sm:px-5'>
                {detailsError && (
                  <div role='alert' className='mb-3 rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive'>
                    {detailsError}
                  </div>
                )}
                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='grid gap-2'>
                    <Label htmlFor='d-name'>Full name</Label>
                    <Input id='d-name' value={detailsDraft.fullName} onChange={(e) => setDetailsDraft((d) => ({ ...d, fullName: e.target.value }))} placeholder='Your Name' />
                  </div>
                  <div className='grid gap-2'>
                    <Label htmlFor='d-email'>Email</Label>
                    <Input id='d-email' type='email' value={detailsDraft.email} onChange={(e) => setDetailsDraft((d) => ({ ...d, email: e.target.value }))} placeholder='you@example.com' />
                  </div>
                  <div className='grid gap-2 sm:col-span-2'>
                    <Label htmlFor='d-headline'>Headline</Label>
                    <Input id='d-headline' value={detailsDraft.headline} onChange={(e) => setDetailsDraft((d) => ({ ...d, headline: e.target.value }))} placeholder='What do you do?' />
                  </div>
                </div>
                <div className='mt-4 flex items-center gap-2'>
                  <Button onClick={saveDetails}>Save</Button>
                  <Button variant='outline' onClick={closeOpen}>Cancel</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='mt-6 hidden lg:block'>
        <div className='rounded-xl border bg-card px-6 py-5'>
          <div className='mb-3 text-sm font-medium text-muted-foreground'>Applications preview</div>
          <div className='grid grid-cols-3 gap-4'>
            <div className='rounded-lg border px-4 py-3'>
              <div className='text-xs text-muted-foreground mb-1'>In Review</div>
              <div className='text-2xl font-semibold'>{counters.inReview}</div>
            </div>
            <div className='rounded-lg border px-4 py-3'>
              <div className='text-xs text-muted-foreground mb-1'>Interview</div>
              <div className='text-2xl font-semibold'>{counters.interview}</div>
            </div>
            <div className='rounded-lg border px-4 py-3'>
              <div className='text-xs text-muted-foreground mb-1'>Offer</div>
              <div className='text-2xl font-semibold'>{counters.offer}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function computeCompleteness(d: Details): number {
  const required = ['fullName', 'email', 'headline'] as const;
  const total = required.length + 3;
  let score = 0;
  for (const k of required) if (String(d[k]).trim().length > 0) score += 1;
  if (d.phone && d.phone.trim()) score += 1;
  if (d.location && d.location.trim()) score += 1;
  const hasLink = Boolean(d.links?.github || d.links?.linkedin);
  if (hasLink) score += 1;
  return Math.round((score / total) * 100);
}
