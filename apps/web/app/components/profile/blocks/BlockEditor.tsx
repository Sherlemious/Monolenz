'use client';

/**
 * BlockEditor - Category-based profile content editor
 * Sidebar navigation by content type + item list/edit in main area
 */

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
import { toast } from 'sonner';
import { Reorder } from 'framer-motion';
import {
  GripVertical,
  Briefcase,
  GraduationCap,
  Zap,
  Rocket,
  BadgeCheck,
  Globe,
  Heart,
  Trophy,
  Plus,
  Trash2,
  Check,
  ArrowLeft,
  ChevronRight,
  EyeOff,
  Eye,
} from 'lucide-react';

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
    icon: Briefcase,
    description: 'Jobs, internships, and professional roles',
    color: 'bg-secondary text-foreground',
    borderColor: 'border-blue-500/30',
  },
  {
    type: 'education',
    label: 'Education',
    labelPlural: 'Education',
    icon: GraduationCap,
    description: 'Degrees, schools, and academic programs',
    color: 'bg-secondary text-foreground',
    borderColor: 'border-purple-500/30',
  },
  {
    type: 'skill',
    label: 'Skill',
    labelPlural: 'Skills',
    icon: Zap,
    description: 'Technical and professional abilities',
    color: 'bg-secondary text-foreground',
    borderColor: 'border-amber-500/30',
  },
  {
    type: 'project',
    label: 'Project',
    labelPlural: 'Projects',
    icon: Rocket,
    description: 'Personal and professional projects',
    color: 'bg-secondary text-foreground',
    borderColor: 'border-emerald-500/30',
  },
  {
    type: 'certification',
    label: 'Certification',
    labelPlural: 'Certifications',
    icon: BadgeCheck,
    description: 'Professional certifications and licenses',
    color: 'bg-secondary text-foreground',
    borderColor: 'border-orange-500/30',
  },
  {
    type: 'language',
    label: 'Language',
    labelPlural: 'Languages',
    icon: Globe,
    description: 'Spoken and written languages',
    color: 'bg-secondary text-foreground',
    borderColor: 'border-cyan-500/30',
  },
  {
    type: 'volunteer',
    label: 'Volunteer',
    labelPlural: 'Volunteer Work',
    icon: Heart,
    description: 'Volunteering and community service',
    color: 'bg-secondary text-foreground',
    borderColor: 'border-pink-500/30',
  },
  {
    type: 'award',
    label: 'Award',
    labelPlural: 'Awards',
    icon: Trophy,
    description: 'Honors, awards, and recognitions',
    color: 'bg-secondary text-foreground',
    borderColor: 'border-yellow-500/30',
  },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.type, c]));

// ============================================================================
// Data Cleaning & Validation
// ============================================================================

const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

function cleanBlockData(data: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    // The API returns dates as full ISO timestamps (2022-03-01T00:00:00.000Z),
    // but the block schemas only accept YYYY-MM-DD.
    if (typeof value === 'string' && ISO_TIMESTAMP.test(value)) {
      cleaned[key] = value.slice(0, 10);
      continue;
    }
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
  const saveSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    restoreBlock,
    reorderBlocksInCategory,
    resetToOriginal,
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveSuccessTimerRef.current) {
        clearTimeout(saveSuccessTimerRef.current);
      }
    };
  }, []);

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
      // Double cast required: TypeScript's discriminated union narrows `data` to a specific
      // block-type shape, but cleanBlockData operates on a generic Record<string, unknown>.
      // We cast to unknown first to bypass the union constraint, then back to the expected type.
      const cleanedChangeset = {
        ...changeset,
        creations: changeset.creations.map((c) =>
          stripNulls({
            ...c,
            data: cleanBlockData(c.data as unknown as Record<string, unknown>) as unknown as typeof c.data,
          })
        ),
        updates: changeset.updates.map((u) =>
          stripNulls({
            ...u,
            data: cleanBlockData(u.data as unknown as Record<string, unknown>) as unknown as typeof u.data,
          })
        ),
      };

      const result = await apiClient.applyBatchUpdate(cleanedChangeset);
      const newBlocks = await apiClient.listVersionBlocks(profileIdentifier, result.versionId);
      markAsSaved(result.versionId, newBlocks);
      setSaveSuccess(true);

      // Clear any existing timer and set new one
      if (saveSuccessTimerRef.current) {
        clearTimeout(saveSuccessTimerRef.current);
      }
      saveSuccessTimerRef.current = setTimeout(() => {
        setSaveSuccess(false);
        saveSuccessTimerRef.current = null;
      }, 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save changes';
      setSaveError(message);
    }
  }, [
    apiClient,
    profileIdentifier,
    hasUnsavedChanges,
    isSaving,
    setSaving,
    setSaveError,
    getChangeset,
    markAsSaved,
    setBlockErrors,
    clearBlockErrors,
    selectBlock,
  ]);

  // Ctrl+S / Cmd+S save shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSave]);

  // Undo-delete handler
  const handleDeleteWithUndo = useCallback(
    (clientId: string) => {
      const block = useProfileEditorStore.getState().draftBlocks.find((b) => b.clientId === clientId);
      const summary = block ? getItemSummary(block) : 'Item';
      deleteBlock(clientId);
      selectBlock(null);
      toast('Deleted', {
        description: summary,
        action: { label: 'Undo', onClick: () => restoreBlock(clientId) },
        duration: 5000,
      });
    },
    [deleteBlock, selectBlock, restoreBlock]
  );

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

  const showSaveBar = hasUnsavedChanges || isSaving || saveSuccess || Boolean(lastSaveError);

  return (
    <div className='relative flex flex-col h-full'>
      {/* Main layout: sidebar + content */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Category sidebar */}
        <nav className='w-52 border-r overflow-y-auto shrink-0' aria-label='Sections'>
          <div className='p-3 space-y-0.5'>
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
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'w-full flex items-center gap-2.5 h-8 px-2.5 rounded-md text-left text-[13px] transition-colors',
                    isActive
                      ? 'bg-secondary text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  )}
                >
                  <Icon className='size-4 shrink-0' />
                  <span className='flex-1 truncate'>{cat.labelPlural}</span>
                  {count > 0 && <span className='text-[12px] tabular-nums text-muted-foreground'>{count}</span>}
                  {hasErrors && <span className='size-1.5 rounded-full bg-destructive shrink-0' />}
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
              onDelete={() => handleDeleteWithUndo(selectedBlock.clientId)}
            />
          ) : (
            <CategoryListView
              meta={activeMeta}
              items={categoryItems}
              onAdd={handleAddItem}
              onSelect={handleSelectItem}
              onDelete={(clientId) => handleDeleteWithUndo(clientId)}
              onReorder={(newOrder) => reorderBlocksInCategory(newOrder.map((b) => b.clientId))}
            />
          )}
        </div>
      </div>

      {/* Floating save bar — only when there is something to save */}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center px-4 transition-all duration-200',
          showSaveBar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        )}
        aria-hidden={!showSaveBar}
      >
        <div
          role='status'
          className='pointer-events-auto flex items-center gap-3 rounded-full border bg-popover pl-4 pr-1.5 py-1.5 shadow-lg'
        >
          <span className='flex items-center gap-2 text-[13px]'>
            {lastSaveError ? (
              <>
                <span className='size-2 rounded-full bg-destructive' aria-hidden />
                <span className='text-destructive max-w-xs truncate'>{lastSaveError}</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className='size-3.5 text-success' />
                Saved. Your public page is up to date.
              </>
            ) : (
              <>
                <span className='size-2 rounded-full bg-warning animate-pulse' aria-hidden />
                Unsaved changes
              </>
            )}
          </span>
          {hasUnsavedChanges && !isSaving && (
            <Button
              variant='ghost'
              size='sm'
              className='rounded-full'
              tabIndex={showSaveBar ? 0 : -1}
              onClick={() => {
                if (window.confirm('Discard all unsaved changes?')) resetToOriginal();
              }}
            >
              Discard
            </Button>
          )}
          {(hasUnsavedChanges || isSaving) && (
            <Button
              size='sm'
              className='rounded-full'
              onClick={handleSave}
              disabled={isSaving}
              tabIndex={showSaveBar ? 0 : -1}
            >
              {isSaving ? (
                <>
                  <div className='animate-spin rounded-full size-3.5 border border-primary-foreground border-t-transparent' />
                  Saving...
                </>
              ) : (
                <>
                  Save changes <kbd className='hidden sm:inline text-[11px] opacity-60 font-sans'>⌘S</kbd>
                </>
              )}
            </Button>
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
  onReorder: (newOrder: DraftBlock[]) => void;
}

function CategoryListView({ meta, items, onAdd, onSelect, onDelete, onReorder }: CategoryListViewProps) {
  const Icon = meta.icon;
  const [localItems, setLocalItems] = useState(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const handleDragEnd = useCallback(() => {
    onReorder(localItems);
  }, [localItems, onReorder]);

  return (
    <div className='px-6 md:px-10 py-8 pb-24 max-w-3xl'>
      {/* Category header */}
      <div className='flex items-start justify-between mb-6'>
        <div>
          <h3 className='text-[19px] font-semibold tracking-tight'>{meta.labelPlural}</h3>
          <p className='text-[13px] text-muted-foreground mt-0.5'>{meta.description}</p>
        </div>
        <Button size='sm' variant='outline' onClick={onAdd}>
          <Plus className='size-3.5' />
          Add {meta.label}
        </Button>
      </div>

      {/* Items */}
      {localItems.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-14 text-center rounded-xl border border-dashed'>
          <div className='size-11 rounded-full bg-secondary flex items-center justify-center mb-4'>
            <Icon className='size-5 text-muted-foreground' />
          </div>
          <p className='font-medium text-sm mb-1'>No {meta.labelPlural.toLowerCase()} yet</p>
          <p className='text-xs text-muted-foreground mb-4 max-w-xs'>
            Add your first entry to start building this section of your profile.
          </p>
          <Button variant='outline' size='sm' onClick={onAdd}>
            <Plus className='size-3.5' />
            Add {meta.label}
          </Button>
        </div>
      ) : (
        <Reorder.Group axis='y' values={localItems} onReorder={setLocalItems} className='space-y-2'>
          {localItems.map((item) => (
            <Reorder.Item key={item.clientId} value={item} className='list-none' onDragEnd={handleDragEnd}>
              <ItemCard
                item={item}
                meta={meta}
                onClick={() => onSelect(item.clientId)}
                onDelete={() => onDelete(item.clientId)}
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
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

function ItemCard({ item, onClick, onDelete }: ItemCardProps) {
  const hasErrors = item.errors && Object.keys(item.errors).length > 0;
  const summary = getItemSummary(item);
  const subtitle = getItemSubtitle(item);

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        'w-full text-left flex items-center gap-3 px-3 py-3.5 rounded-lg border bg-card transition-all group cursor-pointer',
        'hover:border-border-strong focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30',
        hasErrors && 'border-danger-border bg-danger-soft'
      )}
    >
      {/* Drag handle */}
      <GripVertical className='size-4 text-muted-foreground/30 group-hover:text-muted-foreground/70 shrink-0 cursor-grab transition-colors' />

      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <p className='font-medium text-[14px] truncate'>{summary}</p>
          {item.status !== 'unchanged' && (
            <Badge variant={item.status === 'created' ? 'accent' : 'warning'} className='h-[18px] px-1.5 text-[10.5px]'>
              {item.status === 'created' ? 'New' : 'Edited'}
            </Badge>
          )}
          {!item.isVisible && (
            <Badge variant='secondary' className='h-[18px] px-1.5 text-[10.5px] gap-1'>
              <EyeOff className='size-2.5' />
              Hidden
            </Badge>
          )}
          {hasErrors && (
            <Badge variant='destructive' className='h-[18px] px-1.5 text-[10.5px]'>
              Needs a fix
            </Badge>
          )}
        </div>
        {subtitle && <p className='text-[13px] text-muted-foreground mt-0.5 truncate'>{subtitle}</p>}
      </div>

      {/* Actions */}
      <div className='flex items-center gap-1 shrink-0'>
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className='p-1.5 text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-destructive rounded-md transition-all'
          title='Delete'
          aria-label={`Delete ${summary}`}
        >
          <Trash2 className='size-3.5' />
        </button>
        <ChevronRight className='size-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors' />
      </div>
    </div>
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
  const setBlockVisible = useProfileEditorStore((s) => s.setBlockVisible);

  return (
    <div className='px-6 md:px-10 py-8 pb-28 max-w-2xl'>
      {/* Breadcrumb */}
      <div className='flex items-center gap-2 mb-6'>
        <button
          type='button'
          onClick={onBack}
          className='inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          <ArrowLeft className='size-3.5' />
          {meta.labelPlural}
        </button>
        <span className='text-muted-foreground/40'>/</span>
        <span className='text-sm font-medium truncate'>{summary}</span>
      </div>

      {/* Form header */}
      <div className='flex items-start justify-between gap-4 mb-6'>
        <div className='min-w-0'>
          <p className='text-[12px] font-medium text-muted-foreground'>
            {block.status === 'created' ? `New ${meta.label.toLowerCase()}` : meta.label}
          </p>
          <h3 className='text-[22px] font-semibold tracking-tight truncate'>
            {block.status === 'created' && summary === meta.label ? `Untitled ${meta.label.toLowerCase()}` : summary}
          </h3>
        </div>

        <Button variant='ghost' size='sm' onClick={onDelete} className='text-muted-foreground hover:text-destructive'>
          <Trash2 className='size-3.5' />
          Delete
        </Button>
      </div>

      <label className='flex items-center justify-between gap-4 mb-8 rounded-lg border bg-card px-4 py-3 cursor-pointer'>
        <span className='text-sm'>
          <span className='font-medium flex items-center gap-1.5'>
            {block.isVisible ? <Eye className='size-3.5' /> : <EyeOff className='size-3.5' />}
            {block.isVisible ? 'Shown on your public page' : 'Hidden from your public page'}
          </span>
          <span className='block text-[12px] text-muted-foreground mt-0.5'>
            Hidden entries stay here in the editor, but visitors won&apos;t see them.
          </span>
        </span>
        <input
          type='checkbox'
          role='switch'
          className='peer sr-only'
          checked={block.isVisible}
          onChange={(e) => setBlockVisible(block.clientId, e.target.checked)}
        />
        <span
          aria-hidden
          className='relative h-5 w-9 shrink-0 rounded-full bg-border-strong transition-colors peer-checked:bg-foreground peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/30 after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-background after:shadow-sm after:transition-transform peer-checked:after:translate-x-4'
        />
      </label>

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
