/**
 * Relations Zod Schemas
 * Validation for all relation operations
 */
import { z } from 'zod';

// Entity types that can be related
export const EntityTypeEnum = z.enum(['actor', 'entity', 'wallet', 'token']);
export type EntityType = z.infer<typeof EntityTypeEnum>;

// Direction of the relation
export const DirectionEnum = z.enum(['in', 'out', 'bidirectional']);
export type Direction = z.infer<typeof DirectionEnum>;

// Common relation tags
export const RelationTagEnum = z.enum([
  'fund-flow',
  'lp',
  'bridge',
  'cex',
  'dex',
  'smart-money',
  'whale',
  'mev',
  'wash-trading',
  'accumulation',
  'distribution',
  'rotation',
]);
export type RelationTag = z.infer<typeof RelationTagEnum>;

/**
 * Schema for creating a new relation
 */
export const CreateRelationSchema = z.object({
  from: z.string().min(1, 'From ID is required'),
  to: z.string().min(1, 'To ID is required'),
  fromType: EntityTypeEnum,
  toType: EntityTypeEnum,
  direction: DirectionEnum,
  volumeUSD: z.number().min(0).default(0),
  timestamp: z.coerce.date().optional(),
  tags: z.array(z.string()).optional().default([]),
});
export type CreateRelationInput = z.infer<typeof CreateRelationSchema>;

/**
 * Schema for updating a relation
 */
export const UpdateRelationSchema = z.object({
  volumeUSD: z.number().min(0).optional(),
  direction: DirectionEnum.optional(),
  tags: z.array(z.string()).optional(),
  influenceWeight: z.number().min(0).optional(),
});
export type UpdateRelationInput = z.infer<typeof UpdateRelationSchema>;

/**
 * Schema for upserting relation (main operation)
 */
export const UpsertRelationSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  fromType: EntityTypeEnum,
  toType: EntityTypeEnum,
  direction: DirectionEnum,
  volumeUSD: z.number().min(0),
  timestamp: z.coerce.date(),
  tags: z.array(z.string()).optional().default([]),
});
export type UpsertRelationInput = z.infer<typeof UpsertRelationSchema>;

/**
 * Schema for querying relations
 */
export const QueryRelationsSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  fromType: EntityTypeEnum.optional(),
  toType: EntityTypeEnum.optional(),
  direction: DirectionEnum.optional(),
  minDensity: z.coerce.number().min(0).optional(),
  maxDensity: z.coerce.number().optional(),
  minVolume: z.coerce.number().min(0).optional(),
  maxVolume: z.coerce.number().optional(),
  minInteractions: z.coerce.number().int().min(0).optional(),
  tags: z.array(z.string()).or(z.string().transform(s => s.split(','))).optional(),
  since: z.coerce.date().optional(),
  until: z.coerce.date().optional(),
  sortBy: z.enum(['densityScore', 'volumeUSD', 'interactionCount', 'lastSeenAt', 'influenceWeight']).optional().default('densityScore'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  limit: z.coerce.number().int().min(1).max(1000).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
});
export type QueryRelationsInput = z.infer<typeof QueryRelationsSchema>;

/**
 * Schema for corridor query (between two entities)
 */
export const CorridorQuerySchema = z.object({
  fromId: z.string().min(1),
  toId: z.string().min(1),
});
export type CorridorQueryInput = z.infer<typeof CorridorQuerySchema>;

/**
 * Schema for graph query (all relations for an entity)
 */
export const GraphQuerySchema = z.object({
  entityId: z.string().min(1),
  entityType: EntityTypeEnum.optional(),
  depth: z.coerce.number().int().min(1).max(3).optional().default(1),
  minDensity: z.coerce.number().min(0).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional().default(50),
});
export type GraphQueryInput = z.infer<typeof GraphQuerySchema>;

/**
 * Response schemas
 */
export const RelationResponseSchema = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  fromType: EntityTypeEnum,
  toType: EntityTypeEnum,
  direction: DirectionEnum,
  interactionCount: z.number(),
  volumeUSD: z.number(),
  densityScore: z.number(),
  influenceWeight: z.number(),
  firstSeenAt: z.date(),
  lastSeenAt: z.date(),
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type RelationResponse = z.infer<typeof RelationResponseSchema>;
