/**
 * Block system type definitions
 * Typed, immutable block architecture
 */

// ============================================================================
// Block Type Enum
// ============================================================================

export enum BlockType {
  WORK_EXPERIENCE = 'work_experience',
  EDUCATION = 'education',
  SKILL = 'skill',
  PROJECT = 'project',
  CERTIFICATION = 'certification',
  LANGUAGE = 'language',
  VOLUNTEER = 'volunteer',
  AWARD = 'award',
}

// ============================================================================
// Typed Data Interfaces (8 block types)
// ============================================================================

export interface WorkExperienceData {
  company_name: string;
  company_url?: string | null;
  company_logo_url?: string | null;
  position_title: string;
  employment_type?: string | null;
  location?: string | null;
  location_type?: string | null;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  description?: string | null;
  achievements: string[];
  technologies: string[];
}

export interface EducationData {
  institution_name: string;
  institution_url?: string | null;
  degree_type?: string | null;
  degree_name?: string | null;
  field_of_study?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_current: boolean;
  gpa?: number | null;
  gpa_scale?: number;
  honors: string[];
  relevant_coursework: string[];
  location?: string | null;
}

export interface SkillData {
  name: string;
  category: string;
  proficiency_level?: string | null;
  years_experience?: number | null;
}

export interface ProjectData {
  name: string;
  description?: string | null;
  url?: string | null;
  repository_url?: string | null;
  image_url?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_ongoing: boolean;
  technologies: string[];
  highlights: string[];
}

export interface CertificationData {
  name: string;
  issuing_organization: string;
  organization_url?: string | null;
  credential_id?: string | null;
  credential_url?: string | null;
  issue_date?: string | null;
  expiration_date?: string | null;
  does_not_expire: boolean;
}

export interface LanguageData {
  language: string;
  proficiency: string;
}

export interface VolunteerData {
  organization_name: string;
  role: string;
  cause?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_current: boolean;
  description?: string | null;
  highlights: string[];
}

export interface AwardData {
  title: string;
  issuer?: string | null;
  date_received?: string | null;
  description?: string | null;
  url?: string | null;
}

// ============================================================================
// Base Block Entity
// ============================================================================

export interface BlockEntity {
  id: number;
  block_type: BlockType;
  content_hash: string;
  created_at: Date;
}

// ============================================================================
// Discriminated Union Types
// ============================================================================

export type TypedBlockData =
  | { block_type: BlockType.WORK_EXPERIENCE; data: WorkExperienceData }
  | { block_type: BlockType.EDUCATION; data: EducationData }
  | { block_type: BlockType.SKILL; data: SkillData }
  | { block_type: BlockType.PROJECT; data: ProjectData }
  | { block_type: BlockType.CERTIFICATION; data: CertificationData }
  | { block_type: BlockType.LANGUAGE; data: LanguageData }
  | { block_type: BlockType.VOLUNTEER; data: VolunteerData }
  | { block_type: BlockType.AWARD; data: AwardData };

export type TypedBlock = BlockEntity &
  TypedBlockData & {
    section_name?: string | null;
    sort_order?: number;
  };

// ============================================================================
// Version & VersionBlock (preserved from old system)
// ============================================================================

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
// API Response Types
// ============================================================================

export type VersionBlockDetail = TypedBlock & {
  version_id: number;
  is_visible?: boolean | null;
};

// ============================================================================
// Batch Update Payload Types
// ============================================================================

export interface BatchUpdateCreation {
  block_type: BlockType;
  data:
    | WorkExperienceData
    | EducationData
    | SkillData
    | ProjectData
    | CertificationData
    | LanguageData
    | VolunteerData
    | AwardData;
  section_name?: string | null;
  sort_order?: number | null;
}

export interface BatchUpdateUpdate {
  parent_block_id: number;
  block_type: BlockType;
  data:
    | WorkExperienceData
    | EducationData
    | SkillData
    | ProjectData
    | CertificationData
    | LanguageData
    | VolunteerData
    | AwardData;
  section_name?: string | null;
  sort_order?: number | null;
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
// Editor State Types (for frontend state management)
// ============================================================================

export type DraftBlockStatus = 'unchanged' | 'created' | 'modified' | 'deleted';

export interface DraftBlock {
  clientId: string;
  serverId?: number;
  blockType: BlockType;
  data: Record<string, unknown>;
  originalData?: Record<string, unknown>;
  sectionName?: string | null;
  sortOrder: number;
  status: DraftBlockStatus;
  errors?: Record<string, string>;
}

// ============================================================================
// Helpers
// ============================================================================

export function generateClientId(): string {
  return `draft-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
