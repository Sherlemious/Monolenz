'use client';

/**
 * BlockEditor - Category-based profile content editor
 * Sidebar navigation by content type + item list/edit in main area
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  useProfileEditorStore,
  useVisibleBlocks,
  useSelectedBlock,
  useHasUnsavedChanges,
} from '@/lib/stores/profile-editor-store';
import { BlockType, DraftBlock } from '@monolenz/types/entities';
import { BLOCK_SCHEMAS } from '@monolenz/types/validation';
import { BlockFormFields } from './BlockFormFields';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface BlockEditorProps {
  apiClient: {
    listBlockTypes: () => Promise<BlockType[]>;
    listVersionBlocks: (
      identifier: string,
      versionId: number
    ) => Promise<import('@monolenz/types/entities').VersionBlockDetail[]>;
    applyBatchUpdate: (
      payload: import('@monolenz/types/entities').BatchUpdatePayload
    ) => Promise<{ versionId: number }>;
  };
  profileIdentifier: string;
  initialVersionId?: number;
}

// ============================================================================
// Constants
// ============================================================================

interface CategoryMeta {
  type: string;
  label: string;
  labelPlural: string;
  icon: (props: { className?: string }) => React.ReactNode;
  description: string;
  color: string;
  borderColor: string;
}

const CATEGORIES: CategoryMeta[] = [
  {
    type: 'work_experience',
    label: 'Work Experience',
    labelPlural: 'Work Experiences',
    icon: BriefcaseIcon,
    description: 'Jobs, internships, and professional roles',
    color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    borderColor: 'border-blue-500/30',
  },
  {
    type: 'education',
    label: 'Education',
    labelPlural: 'Education',
    icon: GraduationCapIcon,
    description: 'Degrees, schools, and academic programs',
    color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    borderColor: 'border-purple-500/30',
  },
  {
    type: 'skill',
    label: 'Skill',
    labelPlural: 'Skills',
    icon: ZapIcon,
    description: 'Technical and professional abilities',
    color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    borderColor: 'border-amber-500/30',
  },
  {
    type: 'project',
    label: 'Project',
    labelPlural: 'Projects',
    icon: RocketIcon,
    description: 'Personal and professional projects',
    color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    borderColor: 'border-emerald-500/30',
  },
  {
    type: 'certification',
    label: 'Certification',
    labelPlural: 'Certifications',
    icon: CertificateIcon,
    description: 'Professional certifications and licenses',
    color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
    borderColor: 'border-orange-500/30',
  },
  {
    type: 'language',
    label: 'Language',
    labelPlural: 'Languages',
    icon: GlobeIcon,
    description: 'Spoken and written languages',
    color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
    borderColor: 'border-cyan-500/30',
  },
  {
    type: 'volunteer',
    label: 'Volunteer',
    labelPlural: 'Volunteer Work',
    icon: HeartHandIcon,
    description: 'Volunteering and community service',
    color: 'bg-pink-500/10 text-pink-700 dark:text-pink-400',
    borderColor: 'border-pink-500/30',
  },
  {
    type: 'award',
    label: 'Award',
    labelPlural: 'Awards',
    icon: TrophyIcon,
    description: 'Honors, awards, and recognitions',
    color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    borderColor: 'border-yellow-500/30',
  },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.type, c]));

// ============================================================================
// Data Cleaning & Validation
// ============================================================================

function cleanBlockData(data: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    cleaned[key] = value;
  }
  return cleaned;
}

/** Strip null values from changeset entries (Zod .optional() rejects null) */
function stripNulls<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    if (result[key] === null) {
      delete result[key];
    }
  }
  return result;
}

function validateBlock(block: DraftBlock): Record<string, string> | null {
  const schema = BLOCK_SCHEMAS[block.blockType];
  if (!schema) return null;

  const cleaned = cleanBlockData(block.data);
  const result = schema.safeParse(cleaned);

  if (result.success) return null;

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (path) errors[path] = issue.message;
  }
  return Object.keys(errors).length > 0 ? errors : null;
}

// ============================================================================
// Main Component
// ============================================================================

export function BlockEditor({ apiClient, profileIdentifier, initialVersionId }: BlockEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0]!.type);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const store = useProfileEditorStore();
  const {
    catalog,
    versionId,
    isSaving,
    lastSaveError,
    setCatalog,
    setCatalogLoading,
    setCatalogError,
    loadVersion,
    addBlock,
    deleteBlock,
    selectBlock,
    setSaving,
    setSaveError,
    getChangeset,
    markAsSaved,
    setBlockErrors,
    clearBlockErrors,
  } = store;

  const visibleBlocks = useVisibleBlocks();
  const selectedBlock = useSelectedBlock();
  const hasUnsavedChanges = useHasUnsavedChanges();

  // Items in the active category
  const categoryItems = useMemo(
    () => visibleBlocks.filter((b) => (b.blockType as string) === activeCategory),
    [visibleBlocks, activeCategory]
  );

  // Count items per category for sidebar badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const block of visibleBlocks) {
      const type = block.blockType as string;
      counts[type] = (counts[type] ?? 0) + 1;
    }
    return counts;
  }, [visibleBlocks]);

  // Load catalog and initial version
  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      setLoadError(null);
      setCatalogLoading(true);

      try {
        const types = await apiClient.listBlockTypes();
        setCatalog(types);

        if (initialVersionId) {
          const blocks = await apiClient.listVersionBlocks(profileIdentifier, initialVersionId);
          loadVersion(initialVersionId, blocks);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load profile data';
        setLoadError(message);
        setCatalogError(message);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, [apiClient, profileIdentifier, initialVersionId, setCatalog, setCatalogLoading, setCatalogError, loadVersion]);

  // Save handler with validation
  const handleSave = useCallback(async () => {
    if (!hasUnsavedChanges || isSaving) return;

    setSaveSuccess(false);

    // Validate all changed blocks
    const { draftBlocks } = useProfileEditorStore.getState();
    const changedBlocks = draftBlocks.filter((b) => b.status === 'created' || b.status === 'modified');
    let hasValidationErrors = false;

    for (const block of changedBlocks) {
      const errors = validateBlock(block);
      if (errors) {
        setBlockErrors(block.clientId, errors);
        hasValidationErrors = true;
      } else {
        clearBlockErrors(block.clientId);
      }
    }

    if (hasValidationErrors) {
      setSaveError('Please fix validation errors before saving');
      const firstErrorBlock = changedBlocks.find((b) => validateBlock(b) !== null);
      if (firstErrorBlock) {
        setActiveCategory(firstErrorBlock.blockType as string);
        selectBlock(firstErrorBlock.clientId);
      }
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const changeset = getChangeset();

      // Clean data (strip empty strings) and strip null fields (section_name, sort_order)
      // Zod .optional() rejects null — only undefined is allowed
      const cleanedChangeset = {
        ...changeset,
        creations: changeset.creations.map((c) =>
          stripNulls({ ...c, data: cleanBlockData(c.data as unknown as Record<string, unknown>) as unknown as typeof c.data })
        ),
        updates: changeset.updates.map((u) =>
          stripNulls({ ...u, data: cleanBlockData(u.data as unknown as Record<string, unknown>) as unknown as typeof u.data })
        ),
      };

      const result = await apiClient.applyBatchUpdate(cleanedChangeset);
      const newBlocks = await apiClient.listVersionBlocks(profileIdentifier, result.versionId);
      markAsSaved(result.versionId, newBlocks);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save changes';
      setSaveError(message);
    }
  }, [apiClient, profileIdentifier, hasUnsavedChanges, isSaving, setSaving, setSaveError, getChangeset, markAsSaved, setBlockErrors, clearBlockErrors, selectBlock]);

  const handleAddItem = useCallback(() => {
    addBlock(activeCategory as BlockType);
  }, [addBlock, activeCategory]);

  const handleSelectItem = useCallback(
    (clientId: string) => {
      selectBlock(selectedBlock?.clientId === clientId ? null : clientId);
    },
    [selectBlock, selectedBlock]
  );

  const handleBackToList = useCallback(() => {
    selectBlock(null);
  }, [selectBlock]);

  const activeMeta = CATEGORY_MAP[activeCategory]!;

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center h-64 gap-3'>
        <div className='animate-spin rounded-full size-8 border-2 border-muted border-t-primary' />
        <p className='text-sm text-muted-foreground'>Loading content...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className='flex flex-col items-center justify-center h-64 text-center gap-3 p-8'>
        <div className='size-12 rounded-full bg-destructive/10 flex items-center justify-center'>
          <span className='text-destructive text-lg'>!</span>
        </div>
        <p className='text-destructive font-medium'>Failed to load content</p>
        <p className='text-muted-foreground text-sm max-w-sm'>{loadError}</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full'>
      {/* Save bar */}
      <div className='flex justify-between items-center px-5 py-3 border-b bg-card/50 shrink-0'>
        <div className='flex items-center gap-3'>
          {hasUnsavedChanges && (
            <div className='flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-medium'>
              <span className='size-1.5 rounded-full bg-amber-500 animate-pulse' />
              Unsaved changes
            </div>
          )}
          {lastSaveError && (
            <p className='text-xs text-destructive'>{lastSaveError}</p>
          )}
        </div>

        <Button
          size='sm'
          onClick={handleSave}
          disabled={!hasUnsavedChanges || isSaving}
          className={cn(saveSuccess && 'bg-green-600 hover:bg-green-600')}
        >
          {isSaving ? (
            <>
              <div className='animate-spin rounded-full size-3.5 border border-primary-foreground border-t-transparent' />
              Saving...
            </>
          ) : saveSuccess ? (
            <>
              <CheckIcon className='size-3.5' />
              Saved
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>

      {/* Main layout: sidebar + content */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Category sidebar */}
        <nav className='w-56 border-r bg-muted/20 overflow-y-auto shrink-0'>
          <div className='p-2 space-y-0.5'>
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.type] ?? 0;
              const isActive = activeCategory === cat.type;
              const hasErrors = visibleBlocks.some(
                (b) => (b.blockType as string) === cat.type && b.errors && Object.keys(b.errors).length > 0
              );
              const Icon = cat.icon;

              return (
                <button
                  key={cat.type}
                  type='button'
                  onClick={() => {
                    setActiveCategory(cat.type);
                    selectBlock(null);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <Icon className='size-4 shrink-0' />
                  <span className='flex-1 truncate'>{cat.labelPlural}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        'text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                        isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {count}
                    </span>
                  )}
                  {hasErrors && (
                    <span className='size-1.5 rounded-full bg-destructive shrink-0' />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content area */}
        <div className='flex-1 overflow-y-auto'>
          {selectedBlock && (selectedBlock.blockType as string) === activeCategory ? (
            <ItemEditView
              block={selectedBlock}
              meta={activeMeta}
              onBack={handleBackToList}
              onDelete={() => {
                deleteBlock(selectedBlock.clientId);
                selectBlock(null);
              }}
            />
          ) : (
            <CategoryListView
              meta={activeMeta}
              items={categoryItems}
              onAdd={handleAddItem}
              onSelect={handleSelectItem}
              onDelete={(clientId) => deleteBlock(clientId)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Category List View
// ============================================================================

interface CategoryListViewProps {
  meta: CategoryMeta;
  items: DraftBlock[];
  onAdd: () => void;
  onSelect: (clientId: string) => void;
  onDelete: (clientId: string) => void;
}

function CategoryListView({ meta, items, onAdd, onSelect, onDelete }: CategoryListViewProps) {
  const Icon = meta.icon;

  return (
    <div className='p-6 max-w-3xl'>
      {/* Category header */}
      <div className='flex items-start justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <div className={cn('size-10 rounded-xl flex items-center justify-center', meta.color)}>
            <Icon className='size-5' />
          </div>
          <div>
            <h3 className='text-lg font-semibold'>{meta.labelPlural}</h3>
            <p className='text-sm text-muted-foreground'>{meta.description}</p>
          </div>
        </div>
        <Button size='sm' onClick={onAdd}>
          <PlusIcon className='size-3.5' />
          Add {meta.label}
        </Button>
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-16 text-center'>
          <div className={cn('size-16 rounded-2xl flex items-center justify-center mb-4', meta.color)}>
            <Icon className='size-7' />
          </div>
          <p className='font-medium text-sm mb-1'>No {meta.labelPlural.toLowerCase()} yet</p>
          <p className='text-xs text-muted-foreground mb-4 max-w-xs'>
            Add your first entry to start building this section of your profile.
          </p>
          <Button variant='outline' size='sm' onClick={onAdd}>
            <PlusIcon className='size-3.5' />
            Add {meta.label}
          </Button>
        </div>
      ) : (
        <div className='space-y-2'>
          {items.map((item) => (
            <ItemCard
              key={item.clientId}
              item={item}
              meta={meta}
              onClick={() => onSelect(item.clientId)}
              onDelete={() => onDelete(item.clientId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Item Card
// ============================================================================

interface ItemCardProps {
  item: DraftBlock;
  meta: CategoryMeta;
  onClick: () => void;
  onDelete: () => void;
}

function ItemCard({ item, meta, onClick, onDelete }: ItemCardProps) {
  const hasErrors = item.errors && Object.keys(item.errors).length > 0;
  const summary = getItemSummary(item);
  const subtitle = getItemSubtitle(item);

  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'w-full text-left flex items-center gap-4 p-4 rounded-xl border bg-card transition-all group',
        'hover:shadow-sm hover:border-border/80',
        hasErrors && 'border-destructive/40 bg-destructive/5'
      )}
    >
      {/* Color accent */}
      <div className={cn('w-1 self-stretch rounded-full shrink-0', meta.borderColor, 'bg-current opacity-30')} />

      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <p className='font-medium text-sm truncate'>{summary}</p>
          {item.status !== 'unchanged' && (
            <Badge
              variant={item.status === 'created' ? 'default' : 'secondary'}
              className='text-[10px] px-1.5 py-0 h-4 shrink-0'
            >
              {item.status === 'created' ? 'new' : 'edited'}
            </Badge>
          )}
          {hasErrors && (
            <Badge variant='destructive' className='text-[10px] px-1.5 py-0 h-4 shrink-0'>
              needs fix
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className='text-xs text-muted-foreground mt-0.5 truncate'>{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      <div className='flex items-center gap-1 shrink-0'>
        <span className='text-muted-foreground/0 group-hover:text-muted-foreground text-xs transition-colors mr-1'>
          Edit
        </span>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className='p-1.5 text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-destructive rounded-md transition-all'
          title='Delete'
        >
          <TrashIcon className='size-3.5' />
        </button>
        <ChevronRightIcon className='size-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors' />
      </div>
    </button>
  );
}

// ============================================================================
// Item Edit View
// ============================================================================

interface ItemEditViewProps {
  block: DraftBlock;
  meta: CategoryMeta;
  onBack: () => void;
  onDelete: () => void;
}

function ItemEditView({ block, meta, onBack, onDelete }: ItemEditViewProps) {
  const summary = getItemSummary(block);
  const Icon = meta.icon;

  return (
    <div className='p-6 max-w-2xl'>
      {/* Breadcrumb */}
      <div className='flex items-center gap-2 mb-6'>
        <button
          type='button'
          onClick={onBack}
          className='inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          <ArrowLeftIcon className='size-3.5' />
          {meta.labelPlural}
        </button>
        <span className='text-muted-foreground/40'>/</span>
        <span className='text-sm font-medium truncate'>{summary}</span>
      </div>

      {/* Form header */}
      <div className='flex items-center justify-between mb-8'>
        <div className='flex items-center gap-3'>
          <div className={cn('size-10 rounded-xl flex items-center justify-center', meta.color)}>
            <Icon className='size-5' />
          </div>
          <div>
            <h3 className='text-lg font-semibold'>
              {block.status === 'created' ? `New ${meta.label}` : `Edit ${meta.label}`}
            </h3>
            <p className='text-xs text-muted-foreground mt-0.5'>
              {block.status === 'created' ? 'Fill in the details below' : 'Update the details below'}
            </p>
          </div>
        </div>

        <Button
          variant='ghost'
          size='sm'
          onClick={onDelete}
          className='text-muted-foreground hover:text-destructive'
        >
          <TrashIcon className='size-3.5' />
          Delete
        </Button>
      </div>

      {/* Form fields */}
      <BlockFormFields block={block} />
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getItemSummary(block: DraftBlock): string {
  const data = block.data;
  const title =
    data.title ||
    data.name ||
    data.company_name ||
    data.institution_name ||
    data.organization_name ||
    data.language ||
    data.position_title;
  if (title && typeof title === 'string') {
    return title.length > 50 ? title.slice(0, 50) + '...' : title;
  }
  const meta = CATEGORY_MAP[block.blockType as string];
  return `New ${meta?.label ?? 'Item'}`;
}

function getItemSubtitle(block: DraftBlock): string | null {
  const data = block.data;

  switch (block.blockType as string) {
    case 'work_experience': {
      const parts: string[] = [];
      if (data.position_title && data.company_name) parts.push(`${data.position_title} at ${data.company_name}`);
      else if (data.position_title) parts.push(data.position_title as string);
      if (data.location) parts.push(data.location as string);
      return parts.length > 0 ? parts.join(' · ') : null;
    }
    case 'education': {
      const parts: string[] = [];
      if (data.degree_name) parts.push(data.degree_name as string);
      if (data.field_of_study) parts.push(data.field_of_study as string);
      return parts.length > 0 ? parts.join(' - ') : null;
    }
    case 'skill': {
      const parts: string[] = [];
      if (data.category) parts.push(data.category as string);
      if (data.proficiency_level) parts.push(data.proficiency_level as string);
      return parts.length > 0 ? parts.join(' · ') : null;
    }
    case 'project': {
      if (data.description && typeof data.description === 'string') {
        return data.description.length > 80 ? data.description.slice(0, 80) + '...' : data.description;
      }
      return null;
    }
    case 'certification': {
      return (data.issuing_organization as string) ?? null;
    }
    case 'language': {
      return (data.proficiency as string) ?? null;
    }
    case 'volunteer': {
      const parts: string[] = [];
      if (data.role) parts.push(data.role as string);
      if (data.cause) parts.push(data.cause as string);
      return parts.length > 0 ? parts.join(' · ') : null;
    }
    case 'award': {
      return (data.issuer as string) ?? null;
    }
    default:
      return null;
  }
}

// ============================================================================
// Icons
// ============================================================================

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0' />
    </svg>
  );
}

function GraduationCapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5' />
    </svg>
  );
}

function ZapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' />
    </svg>
  );
}

function RocketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z' />
    </svg>
  );
}

function CertificateIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418' />
    </svg>
  );
}

function HeartHandIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0116.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.016 6.016 0 01-2.77.853m0 0c-.467.056-.944.086-1.43.086s-.964-.03-1.43-.086m0 0a6.016 6.016 0 01-2.77-.853' />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M12 4v16m8-8H4' />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0' />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M10 19l-7-7m0 0l7-7m-7 7h18' />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M9 5l7 7-7 7' />
    </svg>
  );
}
