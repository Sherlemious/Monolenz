/**
 * Block System Types
 */

export interface BlockType {
  id: string;
  name: string;
  description: string;
  section: string;
  icon?: string;
}

export interface PropertySchema {
  type: 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'array';
  required: boolean;
  label: string;
  placeholder?: string;
  options?: string[]; // for enums
  itemType?: string; // for arrays
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export interface BlockSchema {
  blockTypeName: string;
  properties: Record<string, PropertySchema>;
}

export interface Block {
  id: number;
  blockTypeName: string;
  data: Record<string, unknown>;
  sectionName: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlockCreation {
  blockTypeName: string;
  data: Record<string, unknown>;
  sectionName: string;
  sortOrder: number;
}

export interface BlockUpdate {
  parentBlockId: number;
  blockTypeName: string;
  data: Record<string, unknown>;
  sectionName: string;
  sortOrder: number;
}

export interface BlockBatchRequest {
  creations?: BlockCreation[];
  updates?: BlockUpdate[];
  deletions?: number[];
}

export interface BlockBatchResponse {
  created?: Block[];
  updated?: Block[];
  deleted?: number[];
  errors?: Array<{
    blockId?: number;
    error: string;
  }>;
}

