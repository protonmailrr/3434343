/**
 * Relations Module - Core foundation for the graph
 * 
 * This module handles:
 * - Influence Graph
 * - "Dense corridor" logic (Warhammer-style)
 * - Actors / Entities correlation
 * - Signals foundation
 * - Alerts foundation
 * - Copy-trading logic
 * 
 * Key concept: Relation = aggregated connection, NOT a transaction
 * "Between A and B there are X interactions over period T
 *  with direction, density, and type"
 */

// Model
export { RelationModel, type IRelation, type EntityType, type Direction } from './relations.model.js';

// Schemas
export {
  EntityTypeEnum,
  DirectionEnum,
  RelationTagEnum,
  CreateRelationSchema,
  UpdateRelationSchema,
  UpsertRelationSchema,
  QueryRelationsSchema,
  CorridorQuerySchema,
  GraphQuerySchema,
  RelationResponseSchema,
  type CreateRelationInput,
  type UpdateRelationInput,
  type UpsertRelationInput,
  type QueryRelationsInput,
  type CorridorQueryInput,
  type GraphQueryInput,
  type RelationResponse,
} from './relations.schema.js';

// Repository
export {
  RelationsRepository,
  relationsRepository,
  type RelationFilter,
  type RelationSort,
  type PaginationOptions,
} from './relations.repository.js';

// Service
export {
  RelationsService,
  relationsService,
  calculateDensityScore,
  calculateInfluenceWeight,
} from './relations.service.js';

// Routes
export { relationsRoutes, routes } from './relations.routes.js';
