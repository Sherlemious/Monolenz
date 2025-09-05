import { z } from 'zod';
import { baseIdSchemas } from './base-schemas';

// Base primitives
const idInteger = baseIdSchemas.intId;
const idParam = baseIdSchemas.intIdParam;

// Data payload for a block: flexible JSON object
const blockData = z.record(z.string(), z.any());

// Property visibility map keyed by property_name
const propertyVisibility = z.record(z.string(), z.boolean());

// Create-and-attach block body schema
export const createAttachBlockBody = z
  .object({
    blockTypeId: idInteger.optional(),
    blockTypeName: z.string().min(1, 'Block type name is required').optional(),
    data: blockData,
    sectionName: z.string().max(255).optional(),
    sortOrder: z.number().int().min(0).optional(),
    propertyVisibility: propertyVisibility.optional(),
    previousBlockId: idInteger.optional(),
  })
  .refine((v) => !!v.blockTypeId || !!v.blockTypeName, {
    message: 'Either blockTypeId or blockTypeName is required',
    path: ['blockTypeId'],
  });

// Params
export const versionIdParams = z.object({
  versionId: idParam,
});

export const blockTypeIdParams = z.object({
  id: idParam,
});

export const deleteBlockParams = z.object({
  versionId: idParam,
  blockId: idParam,
});

// Queries
export const listVersionBlocksQuery = z.object({
  section: z.string().optional(),
});

export const profileBlockSchemas = {
  createAttach: {
    body: createAttachBlockBody,
    params: versionIdParams,
  },
  batchUpdate: {
    body: z.object({
      creations: z
        .array(
          z.object({
            blockTypeId: idInteger.optional(),
            blockTypeName: z.string().min(1).optional(),
            data: blockData,
            sectionName: z.string().max(255).optional(),
            sortOrder: z.number().int().min(0).optional(),
          })
        )
        .default([]),
      updates: z
        .array(
          z.object({
            parentBlockId: idInteger, // existing block id from previous version
            blockTypeId: idInteger.optional(),
            blockTypeName: z.string().min(1).optional(),
            data: blockData,
            sectionName: z.string().max(255).optional(),
            sortOrder: z.number().int().min(0).optional(),
          })
        )
        .default([]),
      deletions: z.array(idInteger).default([]),
    }),
  },
  listVersionBlocks: {
    params: z.object({ versionId: idParam, identifier: z.string().min(1) }),
    query: listVersionBlocksQuery,
  },
  deleteFromVersion: {
    params: deleteBlockParams,
  },
  catalog: {
    blockTypePropsParams: blockTypeIdParams,
  },
};

export type CreateAttachBlockBody = z.infer<typeof createAttachBlockBody>;
export type VersionIdParams = z.infer<typeof versionIdParams>;
export type DeleteBlockParams = z.infer<typeof deleteBlockParams>;
export type ListVersionBlocksQuery = z.infer<typeof listVersionBlocksQuery>;
export type BlockTypeIdParams = z.infer<typeof blockTypeIdParams>;
