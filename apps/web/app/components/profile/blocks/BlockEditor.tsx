'use client';

/**
 * BlockEditor - Main orchestrator for profile block editing
 * Manages loading, displaying, and saving blocks
 */

import { useEffect, useState, useCallback } from 'react';
import {
  useProfileEditorStore,
  useVisibleBlocks,
  useSelectedBlock,
  useHasUnsavedChanges,
} from '@/lib/stores/profile-editor-store';
import { BlockType, DraftBlock } from '@monolenz/types/entities';

// ============================================================================
// Types
// ============================================================================

interface BlockEditorProps {
  /** API client instance */
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
  /** Profile identifier (username or UUID) */
  profileIdentifier: string;
  /** Initial version ID to load */
  initialVersionId?: number;
}

// ============================================================================
// Main Component
// ============================================================================

export function BlockEditor({ apiClient, profileIdentifier, initialVersionId }: BlockEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  // Store state
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
  } = useProfileEditorStore();

  const visibleBlocks = useVisibleBlocks();
  const selectedBlock = useSelectedBlock();
  const hasUnsavedChanges = useHasUnsavedChanges();

  // ========================================================================
  // Load catalog and initial version
  // ========================================================================

  useEffect(() => {
    async function loadInitialData() {
      setIsLoading(true);
      setLoadError(null);
      setCatalogLoading(true);

      try {
        // Load block types
        const types = await apiClient.listBlockTypes();

        // In the new typed system, block types are predefined enums
        // No need to load properties separately
        setCatalog(types);

        // Load version blocks if we have a version
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

  // ========================================================================
  // Save handler
  // ========================================================================

  const handleSave = useCallback(async () => {
    if (!hasUnsavedChanges || isSaving) return;

    setSaving(true);
    setSaveError(null);

    try {
      const changeset = getChangeset();
      const result = await apiClient.applyBatchUpdate(changeset);

      // Reload blocks for new version
      const newBlocks = await apiClient.listVersionBlocks(profileIdentifier, result.versionId);
      markAsSaved(result.versionId, newBlocks);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save changes';
      setSaveError(message);
    }
  }, [apiClient, profileIdentifier, hasUnsavedChanges, isSaving, setSaving, setSaveError, getChangeset, markAsSaved]);

  // ========================================================================
  // Add block handler
  // ========================================================================

  const handleAddBlock = useCallback(
    (blockType: BlockType) => {
      addBlock(blockType);
      setShowTypeSelector(false);
    },
    [addBlock]
  );

  // ========================================================================
  // Render
  // ========================================================================

  if (isLoading) {
    return <LoadingState />;
  }

  if (loadError) {
    return <ErrorState message={loadError} />;
  }

  return (
    <div className='block-editor'>
      {/* Header with actions */}
      <div className='block-editor__header'>
        <div className='block-editor__title'>
          <h2>Profile Blocks</h2>
          {versionId && <span className='block-editor__version'>Version #{versionId}</span>}
        </div>

        <div className='block-editor__actions'>
          <button type='button' onClick={() => setShowTypeSelector(true)} className='btn btn--secondary'>
            <PlusIcon className='w-4 h-4' />
            Add Block
          </button>

          <button
            type='button'
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            className='btn btn--primary'
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Save error */}
      {lastSaveError && <div className='block-editor__error'>{lastSaveError}</div>}

      {/* Unsaved changes indicator */}
      {hasUnsavedChanges && <div className='block-editor__unsaved'>You have unsaved changes</div>}

      {/* Block list and editor layout */}
      <div className='block-editor__layout'>
        {/* Left: Block list */}
        <div className='block-editor__list'>
          {visibleBlocks.length === 0 ? (
            <EmptyState onAddBlock={() => setShowTypeSelector(true)} />
          ) : (
            <div className='block-list'>
              {visibleBlocks.map((block) => (
                <BlockCard
                  key={block.clientId}
                  block={block}
                  isSelected={selectedBlock?.clientId === block.clientId}
                  onClick={() => selectBlock(block.clientId)}
                  onDelete={() => deleteBlock(block.clientId)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Selected block editor */}
        <div className='block-editor__detail'>
          {selectedBlock ? (
            <BlockForm block={selectedBlock} properties={[]} />
          ) : (
            <div className='block-editor__placeholder'>Select a block to edit</div>
          )}
        </div>
      </div>

      {/* Block type selector modal */}
      {showTypeSelector && (
        <BlockTypeSelector types={catalog.types} onSelect={handleAddBlock} onClose={() => setShowTypeSelector(false)} />
      )}

      <style>{`
        .block-editor {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--background);
          color: var(--foreground);
        }

        .block-editor__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .block-editor__title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .block-editor__title h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }

        .block-editor__version {
          font-size: 0.75rem;
          color: var(--secondary-foreground);
          background: var(--secondary);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
        }

        .block-editor__actions {
          display: flex;
          gap: 0.75rem;
        }

        .block-editor__error {
          margin: 1rem 1.5rem 0;
          padding: 0.75rem 1rem;
          background: var(--card);
          border: 1px solid var(--destructive);
          border-radius: 0.5rem;
          color: var(--destructive);
          font-size: 0.875rem;
        }

        .block-editor__unsaved {
          margin: 0.75rem 1.5rem 0;
          padding: 0.5rem 0.75rem;
          background: var(--accent);
          border: 1px solid var(--border);
          border-radius: 0.375rem;
          color: var(--accent-foreground);
          font-size: 0.75rem;
        }

        .block-editor__layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          flex: 1;
          overflow: hidden;
        }

        .block-editor__list {
          border-right: 1px solid var(--border);
          overflow-y: auto;
          padding: 1rem;
        }

        .block-editor__detail {
          overflow-y: auto;
          padding: 1.5rem;
        }

        .block-editor__placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--muted-foreground);
          font-size: 0.875rem;
        }

        .block-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn--primary {
          background: var(--primary);
          color: var(--primary-foreground);
        }

        .btn--primary:hover:not(:disabled) {
          background: var(--primary);
        }

        .btn--secondary {
          background: var(--secondary);
          color: var(--secondary-foreground);
        }

        .btn--secondary:hover:not(:disabled) {
          background: var(--border);
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatBlockType(blockType: string): string {
  return blockType
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ============================================================================
// Sub-components
// ============================================================================

function LoadingState() {
  return (
    <div className='flex items-center justify-center h-64'>
      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className='flex flex-col items-center justify-center h-64 text-center'>
      <p className='text-red-600 mb-2'>Failed to load profile</p>
      <p className='text-gray-500 text-sm'>{message}</p>
    </div>
  );
}

function EmptyState({ onAddBlock }: { onAddBlock: () => void }) {
  return (
    <div className='flex flex-col items-center justify-center h-48 text-center'>
      <p className='text-gray-500 mb-4'>No blocks yet</p>
      <button type='button' onClick={onAddBlock} className='text-blue-600 hover:text-blue-700 font-medium'>
        Add your first block
      </button>
    </div>
  );
}

// ============================================================================
// Block Card
// ============================================================================

interface BlockCardProps {
  block: DraftBlock;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

function BlockCard({ block, isSelected, onClick, onDelete }: BlockCardProps) {
  const statusColors = {
    unchanged: 'bg-gray-100',
    created: 'bg-green-100 border-green-300',
    modified: 'bg-yellow-100 border-yellow-300',
    deleted: 'bg-red-100 border-red-300 opacity-50',
  };

  return (
    <div
      className={`
        p-3 rounded-lg border cursor-pointer transition-all
        ${statusColors[block.status]}
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
      `}
      onClick={onClick}
    >
      <div className='flex justify-between items-start'>
        <div>
          <p className='font-medium text-sm'>{formatBlockType(block.blockType)}</p>
          <p className='text-xs text-gray-500 mt-0.5'>{getBlockSummary(block)}</p>
        </div>

        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className='p-1 text-gray-400 hover:text-red-600 rounded'
          title='Delete block'
        >
          <TrashIcon className='w-4 h-4' />
        </button>
      </div>

      {block.status !== 'unchanged' && (
        <span
          className={`
          inline-block mt-2 px-1.5 py-0.5 text-xs rounded
          ${block.status === 'created' ? 'bg-green-200 text-green-800' : ''}
          ${block.status === 'modified' ? 'bg-yellow-200 text-yellow-800' : ''}
          ${block.status === 'deleted' ? 'bg-red-200 text-red-800' : ''}
        `}
        >
          {block.status}
        </span>
      )}
    </div>
  );
}

function getBlockSummary(block: DraftBlock): string {
  const data = block.data;
  // Try common title fields
  const title = data.title || data.name || data.company || data.institution || data.organization;
  if (title && typeof title === 'string') {
    return title.length > 40 ? title.slice(0, 40) + '...' : title;
  }
  return 'No title';
}

// ============================================================================
// Block Form
// ============================================================================

interface BlockFormProps {
  block: DraftBlock;
  properties: unknown[];
}

function BlockForm({ block }: BlockFormProps) {
  const displayName = formatBlockType(block.blockType);

  return (
    <div className='block-form'>
      <div className='block-form__header'>
        <h3>{displayName}</h3>
      </div>

      {/* TODO: Implement typed field rendering for new block system */}
      <div className='block-form__placeholder'>
        <p>Block editing UI needs to be updated for the new typed block system</p>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
          Data: {JSON.stringify(block.data, null, 2)}
        </p>
      </div>

      <style>{`
        .block-form {
          max-width: 600px;
        }

        .block-form__header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--color-border, #e5e7eb);
        }

        .block-form__header h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0;
        }

        .block-form__category {
          font-size: 0.75rem;
          color: var(--color-text-muted, #6b7280);
          background: var(--color-bg-subtle, #f3f4f6);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
        }

        .block-form__section {
          margin-bottom: 2rem;
        }

        .block-form__section-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-text-muted, #6b7280);
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// Block Type Selector Modal
// ============================================================================

interface BlockTypeSelectorProps {
  types: BlockType[];
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

function BlockTypeSelector({ types, onSelect, onClose }: BlockTypeSelectorProps) {
  // Group block types by category
  const BLOCK_CATEGORIES: Record<string, string> = {
    work_experience: 'Experience',
    education: 'Education',
    skill: 'Skills',
    project: 'Projects',
    certification: 'Certifications',
    language: 'Languages',
    volunteer: 'Volunteer',
    award: 'Awards',
  };

  const byCategory = new Map<string, BlockType[]>();
  for (const type of types) {
    const category = BLOCK_CATEGORIES[type as string] || 'Other';
    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category)!.push(type);
  }

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='modal' onClick={(e) => e.stopPropagation()}>
        <div className='modal__header'>
          <h3>Add Block</h3>
          <button type='button' onClick={onClose} className='modal__close'>
            <CloseIcon className='w-5 h-5' />
          </button>
        </div>

        <div className='modal__content'>
          {Array.from(byCategory.entries()).map(([category, categoryTypes]) => (
            <div key={category} className='type-category'>
              <h4 className='type-category__title'>{category}</h4>

              <div className='type-grid'>
                {categoryTypes.map((type) => (
                  <button key={type} type='button' onClick={() => onSelect(type)} className='type-card'>
                    <span className='type-card__name'>{formatBlockType(type)}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <style>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 50;
          }

          .modal {
            background: var(--card);
            color: var(--foreground);
            border-radius: 0.75rem;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }

          .modal__header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid var(--border);
          }

          .modal__header h3 {
            font-size: 1.125rem;
            font-weight: 600;
            margin: 0;
          }

          .modal__close {
            padding: 0.25rem;
            border: none;
            background: none;
            cursor: pointer;
            color: var(--muted-foreground);
            border-radius: 0.25rem;
          }

          .modal__close:hover {
            color: var(--foreground);
            background: var(--border);
          }

          .modal__content {
            padding: 1.5rem;
            overflow-y: auto;
          }

          .type-category {
            margin-bottom: 1.5rem;
          }

          .type-category:last-child {
            margin-bottom: 0;
          }

          .type-category__title {
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--muted-foreground);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.75rem;
          }

          .type-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }

          .type-card {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 0.75rem 1rem;
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            background: var(--background);
            cursor: pointer;
            transition: all 0.15s ease;
            text-align: left;
          }

          .type-card:hover {
            border-color: var(--primary);
            background: var(--accent);
          }

          .type-card__name {
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--foreground);
          }

          .type-card__desc {
            font-size: 0.75rem;
            color: #6b7280;
            margin-top: 0.25rem;
          }
        `}</style>
      </div>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M12 4v16m8-8H4' />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
      />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
    </svg>
  );
}
