/**
 * Block system type definitions
 * Shared between frontend and backend
 */

// ============================================================================
// Block Type Catalog
// ============================================================================

export interface BlockType {
  id: number;
  name: string;
  display_name: string;
  description?: string | null;
  category?: string | null;
  sort_order?: number | null;
  icon?: string | null;
  is_active?: boolean | null;
  schema_version?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface BlockProperty {
  id: number;
  block_type_id: number | null;
  property_name: string;
  property_type: PropertyType;
  display_name: string;
  description?: string | null;
  is_required?: boolean | null;
  is_searchable?: boolean | null;
  validation_rules?: ValidationRules | null;
  default_value?: unknown | null;
  sort_order?: number | null;
  group_name?: string | null;
  placeholder_text?: string | null;
  help_text?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type PropertyType = 'string' | 'text' | 'integer' | 'decimal' | 'date' | 'boolean' | 'array' | 'object';

export interface ValidationRules {
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  format?: 'uri' | 'email' | 'date';
  enum?: string[];
  items?: { type: string };
}

// ============================================================================
// Blocks & Versions
// ============================================================================

export interface Block {
  id: number;
  block_type_id: number;
  data: Record<string, unknown>;
  content_hash: string;
  created_at?: string | null;
}

export interface Version {
  id: number;
  parent_version_id?: number | null;
  profile_id?: string | null;
  name?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
}

export interface VersionBlock {
  version_id: number;
  block_id: number;
  previous_version_id?: number | null;
  previous_block_id?: number | null;
  is_visible?: boolean | null;
  section_name?: string | null;
  sort_order?: number | null;
  created_at?: string | null;
}

// ============================================================================
// API Response Types (what frontend receives from list endpoints)
// ============================================================================

export interface VersionBlockDetail {
  version_id: number;
  block_id: number;
  section_name?: string | null;
  sort_order?: number | null;
  is_visible?: boolean | null;
  block_type_name: string;
  block_type_display_name: string;
  block_type_category?: string | null;
  data: Record<string, unknown>;
  content_hash: string;
  block_created_at?: string | null;
  added_to_version_at?: string | null;
}

// ============================================================================
// Editor State Types (for frontend state management)
// ============================================================================

export type DraftBlockStatus = 'unchanged' | 'created' | 'modified' | 'deleted';

export interface DraftBlock {
  /** Temporary client-side ID for new blocks, or server block_id for existing */
  clientId: string;
  /** Server block_id if this is an existing block, undefined for new */
  serverId?: number;
  /** Block type identifier */
  blockTypeId: number;
  blockTypeName: string;
  blockTypeDisplayName: string;
  blockTypeCategory?: string | null;
  /** Current form data */
  data: Record<string, unknown>;
  /** Original data from server (for diff calculation) */
  originalData?: Record<string, unknown>;
  /** Display/grouping */
  sectionName?: string | null;
  sortOrder: number;
  /** Track what changed */
  status: DraftBlockStatus;
  /** Property-level visibility */
  propertyVisibility?: Record<string, boolean>;
  /** Validation errors keyed by property_name */
  errors?: Record<string, string>;
}

// ============================================================================
// Batch Update Payload (what frontend sends to save)
// ============================================================================

export interface BatchUpdateCreation {
  blockTypeId?: number;
  blockTypeName?: string;
  data: Record<string, unknown>;
  sectionName?: string | null;
  sortOrder?: number | null;
}

export interface BatchUpdateUpdate {
  parentBlockId: number;
  blockTypeId?: number;
  blockTypeName?: string;
  data: Record<string, unknown>;
  sectionName?: string | null;
  sortOrder?: number | null;
}

export interface BatchUpdatePayload {
  creations: BatchUpdateCreation[];
  updates: BatchUpdateUpdate[];
  deletions: number[];
}

export interface BatchUpdateResponse {
  versionId: number;
}

// ============================================================================
// Grouped Properties (for form rendering)
// ============================================================================

export interface PropertyGroup {
  name: string;
  displayName: string;
  properties: BlockProperty[];
}

// ============================================================================
// Block Type Categories
// ============================================================================

export const BLOCK_TYPE_CATEGORIES = {
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  credentials: 'Credentials',
  research: 'Research',
  achievements: 'Achievements',
  networking: 'Networking',
  personal: 'Personal',
} as const;

export type BlockTypeCategory = keyof typeof BLOCK_TYPE_CATEGORIES;

// ============================================================================
// Helpers
// ============================================================================

export function groupPropertiesByGroup(properties: BlockProperty[]): PropertyGroup[] {
  const groups = new Map<string, BlockProperty[]>();

  // Sort by sort_order first
  const sorted = [...properties].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  for (const prop of sorted) {
    const groupName = prop.group_name ?? 'general';
    if (!groups.has(groupName)) {
      groups.set(groupName, []);
    }
    groups.get(groupName)!.push(prop);
  }

  // Convert to array and format display names
  return Array.from(groups.entries()).map(([name, props]) => ({
    name,
    displayName: formatGroupName(name),
    properties: props,
  }));
}

export function formatGroupName(name: string): string {
  return name
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function generateClientId(): string {
  return `draft-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
