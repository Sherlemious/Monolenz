/**
 * Profile Editor Store
 * Manages block editing state with draft tracking and changeset calculation
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/react/shallow';
import type {
  BlockType,
  BlockProperty,
  DraftBlock,
  VersionBlockDetail,
  BatchUpdatePayload,
  BatchUpdateCreation,
  BatchUpdateUpdate,
} from '@monolenz/types/entities';
import { generateClientId } from '@monolenz/types/entities';

// ============================================================================
// Store State Types
// ============================================================================

interface BlockCatalog {
  types: BlockType[];
  propertiesByTypeId: Map<number, BlockProperty[]>;
  loading: boolean;
  error: string | null;
}

interface EditorState {
  /** Current version ID being edited */
  versionId: number | null;
  /** Blocks as loaded from server (for diff) */
  originalBlocks: VersionBlockDetail[];
  /** Draft blocks being edited */
  draftBlocks: DraftBlock[];
  /** Currently selected block for editing */
  selectedBlockId: string | null;
  /** Block type catalog */
  catalog: BlockCatalog;
  /** Global editor state */
  isSaving: boolean;
  isDirty: boolean;
  lastSaveError: string | null;
}

interface EditorActions {
  // Catalog
  setCatalog: (types: BlockType[], propertiesByTypeId: Map<number, BlockProperty[]>) => void;
  setCatalogLoading: (loading: boolean) => void;
  setCatalogError: (error: string | null) => void;

  // Load/Reset
  loadVersion: (versionId: number, blocks: VersionBlockDetail[]) => void;
  resetToOriginal: () => void;
  clearEditor: () => void;

  // Block Operations
  addBlock: (blockType: BlockType, initialData?: Record<string, unknown>) => string;
  updateBlockData: (clientId: string, data: Record<string, unknown>) => void;
  updateBlockField: (clientId: string, fieldName: string, value: unknown) => void;
  deleteBlock: (clientId: string) => void;
  restoreBlock: (clientId: string) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  setBlockSection: (clientId: string, sectionName: string | null) => void;

  // Selection
  selectBlock: (clientId: string | null) => void;

  // Validation
  setBlockErrors: (clientId: string, errors: Record<string, string>) => void;
  clearBlockErrors: (clientId: string) => void;

  // Save
  setSaving: (isSaving: boolean) => void;
  setSaveError: (error: string | null) => void;
  getChangeset: () => BatchUpdatePayload;
  markAsSaved: (newVersionId: number, newBlocks: VersionBlockDetail[]) => void;
}

type EditorStore = EditorState & EditorActions;

// ============================================================================
// Initial State
// ============================================================================

const initialState: EditorState = {
  versionId: null,
  originalBlocks: [],
  draftBlocks: [],
  selectedBlockId: null,
  catalog: {
    types: [],
    propertiesByTypeId: new Map(),
    loading: false,
    error: null,
  },
  isSaving: false,
  isDirty: false,
  lastSaveError: null,
};

// ============================================================================
// Store Implementation
// ============================================================================

export const useProfileEditorStore = create<EditorStore>()(
  immer((set, get) => ({
    ...initialState,

    // ========================================================================
    // Catalog Actions
    // ========================================================================

    setCatalog: (types, propertiesByTypeId) => {
      set((state) => {
        state.catalog.types = types;
        state.catalog.propertiesByTypeId = propertiesByTypeId;
        state.catalog.loading = false;
        state.catalog.error = null;
      });
    },

    setCatalogLoading: (loading) => {
      set((state) => {
        state.catalog.loading = loading;
      });
    },

    setCatalogError: (error) => {
      set((state) => {
        state.catalog.error = error;
        state.catalog.loading = false;
      });
    },

    // ========================================================================
    // Load/Reset Actions
    // ========================================================================

    loadVersion: (versionId, blocks) => {
      set((state) => {
        state.versionId = versionId;
        state.originalBlocks = blocks;
        state.draftBlocks = blocks.map((block) => convertToDraft(block));
        state.selectedBlockId = null;
        state.isDirty = false;
        state.lastSaveError = null;
      });
    },

    resetToOriginal: () => {
      set((state) => {
        state.draftBlocks = state.originalBlocks.map((block) => convertToDraft(block));
        state.selectedBlockId = null;
        state.isDirty = false;
      });
    },

    clearEditor: () => {
      set(() => ({ ...initialState }));
    },

    // ========================================================================
    // Block Operations
    // ========================================================================

    addBlock: (blockType, initialData = {}) => {
      const clientId = generateClientId();

      set((state) => {
        const maxSortOrder = Math.max(0, ...state.draftBlocks.map((b) => b.sortOrder));

        const newBlock: DraftBlock = {
          clientId,
          serverId: undefined,
          blockTypeId: blockType.id,
          blockTypeName: blockType.name,
          blockTypeDisplayName: blockType.display_name,
          blockTypeCategory: blockType.category,
          data: initialData,
          originalData: undefined,
          sectionName: null,
          sortOrder: maxSortOrder + 1,
          status: 'created',
          propertyVisibility: {},
          errors: {},
        };

        state.draftBlocks.push(newBlock);
        state.selectedBlockId = clientId;
        state.isDirty = true;
      });

      return clientId;
    },

    updateBlockData: (clientId, data) => {
      set((state) => {
        const block = state.draftBlocks.find((b) => b.clientId === clientId);
        if (!block) return;

        block.data = data;

        // Update status if this was an existing block
        if (block.serverId && block.status !== 'created') {
          block.status = hasDataChanged(block.originalData, data) ? 'modified' : 'unchanged';
        }

        state.isDirty = calculateIsDirty(state.draftBlocks);
      });
    },

    updateBlockField: (clientId, fieldName, value) => {
      set((state) => {
        const block = state.draftBlocks.find((b) => b.clientId === clientId);
        if (!block) return;

        block.data = { ...block.data, [fieldName]: value };

        // Update status if this was an existing block
        if (block.serverId && block.status !== 'created') {
          block.status = hasDataChanged(block.originalData, block.data) ? 'modified' : 'unchanged';
        }

        state.isDirty = calculateIsDirty(state.draftBlocks);
      });
    },

    deleteBlock: (clientId) => {
      set((state) => {
        const block = state.draftBlocks.find((b) => b.clientId === clientId);
        if (!block) return;

        if (block.status === 'created') {
          // New block - just remove it
          state.draftBlocks = state.draftBlocks.filter((b) => b.clientId !== clientId);
        } else {
          // Existing block - mark as deleted
          block.status = 'deleted';
        }

        if (state.selectedBlockId === clientId) {
          state.selectedBlockId = null;
        }

        state.isDirty = calculateIsDirty(state.draftBlocks);
      });
    },

    restoreBlock: (clientId) => {
      set((state) => {
        const block = state.draftBlocks.find((b) => b.clientId === clientId);
        if (!block || block.status !== 'deleted') return;

        // Restore to modified or unchanged based on data comparison
        block.status = hasDataChanged(block.originalData, block.data) ? 'modified' : 'unchanged';
        state.isDirty = calculateIsDirty(state.draftBlocks);
      });
    },

    reorderBlocks: (fromIndex, toIndex) => {
      set((state) => {
        const blocks = state.draftBlocks.filter((b) => b.status !== 'deleted');
        const [moved] = blocks.splice(fromIndex, 1);
        if (moved) {
          blocks.splice(toIndex, 0, moved);
        }

        // Recalculate sort orders
        blocks.forEach((block, index) => {
          const draft = state.draftBlocks.find((b) => b.clientId === block.clientId);
          if (draft) {
            draft.sortOrder = index;
            if (draft.serverId && draft.status !== 'created') {
              draft.status = 'modified';
            }
          }
        });

        state.isDirty = true;
      });
    },

    setBlockSection: (clientId, sectionName) => {
      set((state) => {
        const block = state.draftBlocks.find((b) => b.clientId === clientId);
        if (!block) return;

        block.sectionName = sectionName;
        if (block.serverId && block.status !== 'created') {
          block.status = 'modified';
        }
        state.isDirty = true;
      });
    },

    // ========================================================================
    // Selection
    // ========================================================================

    selectBlock: (clientId) => {
      set((state) => {
        state.selectedBlockId = clientId;
      });
    },

    // ========================================================================
    // Validation
    // ========================================================================

    setBlockErrors: (clientId, errors) => {
      set((state) => {
        const block = state.draftBlocks.find((b) => b.clientId === clientId);
        if (block) {
          block.errors = errors;
        }
      });
    },

    clearBlockErrors: (clientId) => {
      set((state) => {
        const block = state.draftBlocks.find((b) => b.clientId === clientId);
        if (block) {
          block.errors = {};
        }
      });
    },

    // ========================================================================
    // Save
    // ========================================================================

    setSaving: (isSaving) => {
      set((state) => {
        state.isSaving = isSaving;
      });
    },

    setSaveError: (error) => {
      set((state) => {
        state.lastSaveError = error;
        state.isSaving = false;
      });
    },

    getChangeset: () => {
      const { draftBlocks } = get();

      const creations: BatchUpdateCreation[] = [];
      const updates: BatchUpdateUpdate[] = [];
      const deletions: number[] = [];

      for (const block of draftBlocks) {
        switch (block.status) {
          case 'created':
            creations.push({
              blockTypeName: block.blockTypeName,
              data: block.data,
              sectionName: block.sectionName,
              sortOrder: block.sortOrder,
            });
            break;

          case 'modified':
            if (block.serverId) {
              updates.push({
                parentBlockId: block.serverId,
                blockTypeName: block.blockTypeName,
                data: block.data,
                sectionName: block.sectionName,
                sortOrder: block.sortOrder,
              });
            }
            break;

          case 'deleted':
            if (block.serverId) {
              deletions.push(block.serverId);
            }
            break;
        }
      }

      return { creations, updates, deletions };
    },

    markAsSaved: (newVersionId, newBlocks) => {
      set((state) => {
        state.versionId = newVersionId;
        state.originalBlocks = newBlocks;
        state.draftBlocks = newBlocks.map((block) => convertToDraft(block));
        state.isDirty = false;
        state.isSaving = false;
        state.lastSaveError = null;
      });
    },
  }))
);

// ============================================================================
// Helper Functions
// ============================================================================

function convertToDraft(block: VersionBlockDetail): DraftBlock {
  return {
    clientId: `server-${block.block_id}`,
    serverId: block.block_id,
    blockTypeId: 0, // We'd need to look this up from catalog
    blockTypeName: block.block_type_name,
    blockTypeDisplayName: block.block_type_display_name,
    blockTypeCategory: block.block_type_category,
    data: block.data,
    originalData: { ...block.data },
    sectionName: block.section_name,
    sortOrder: block.sort_order ?? 0,
    status: 'unchanged',
    propertyVisibility: {},
    errors: {},
  };
}

function hasDataChanged(original: Record<string, unknown> | undefined, current: Record<string, unknown>): boolean {
  if (!original) return true;
  return JSON.stringify(original) !== JSON.stringify(current);
}

function calculateIsDirty(blocks: DraftBlock[]): boolean {
  return blocks.some((b) => b.status !== 'unchanged');
}

// ============================================================================
// Selector Hooks
// ============================================================================

export const useSelectedBlock = () =>
  useProfileEditorStore((state) => {
    if (!state.selectedBlockId) return null;
    return state.draftBlocks.find((b) => b.clientId === state.selectedBlockId) ?? null;
  });

export const useVisibleBlocks = () =>
  useProfileEditorStore(
    useShallow((state) =>
      state.draftBlocks
        .filter((b) => b.status !== 'deleted')
        .sort((a, b) => a.sortOrder - b.sortOrder)
    )
  );

export const useBlocksByCategory = () =>
  useProfileEditorStore(
    useShallow((state) => {
      const visible = state.draftBlocks.filter((b) => b.status !== 'deleted');
      const byCategory = new Map<string, DraftBlock[]>();

      for (const block of visible) {
        const category = block.blockTypeCategory ?? 'other';
        if (!byCategory.has(category)) {
          byCategory.set(category, []);
        }
        byCategory.get(category)!.push(block);
      }

      return byCategory;
    })
  );

export const useBlockTypeProperties = (blockTypeId: number) =>
  useProfileEditorStore(
    useShallow((state) => state.catalog.propertiesByTypeId.get(blockTypeId) ?? [])
  );

export const useHasUnsavedChanges = () => useProfileEditorStore((state) => state.isDirty);
