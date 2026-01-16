/**
 * Relations Service
 * Business logic for relation operations
 * 
 * Key concept: DENSITY SCORE
 * - We never draw N lines between entities
 * - We draw 1 corridor, where N is its density (thickness)
 * 
 * Formula: densityScore = log(interactions + 1) * log(volume + 1) / days
 * 
 * This prevents the graph from exploding ("onion layers" problem)
 */
import {
  relationsRepository,
  RelationFilter,
  RelationSort,
  PaginationOptions,
} from './relations.repository.js';
import { IRelation, EntityType, Direction } from './relations.model.js';
import { AppError } from '../../common/errors.js';

/**
 * Calculate density score for a relation
 * 
 * @param interactionCount - Number of interactions
 * @param volumeUSD - Total volume in USD
 * @param firstSeenAt - First interaction timestamp
 * @param lastSeenAt - Last interaction timestamp
 * @returns Density score
 */
export function calculateDensityScore(
  interactionCount: number,
  volumeUSD: number,
  firstSeenAt: Date,
  lastSeenAt: Date
): number {
  const days = Math.max(
    (lastSeenAt.getTime() - firstSeenAt.getTime()) / (1000 * 60 * 60 * 24),
    1 // Minimum 1 day to avoid division issues
  );

  // Log-based formula prevents extreme values
  // High interactions + high volume = thick corridor
  // Over long time = thinner (distributed activity)
  return (Math.log(interactionCount + 1) * Math.log(volumeUSD + 1)) / days;
}

/**
 * Calculate influence weight
 * Can be customized based on entity types and other factors
 */
export function calculateInfluenceWeight(
  densityScore: number,
  fromType: EntityType,
  toType: EntityType
): number {
  // Base weight is density score
  let weight = densityScore;

  // Boost weights for certain relationships
  const boostMap: Record<string, number> = {
    'actor->actor': 1.5,    // Actor-to-actor is highly significant
    'actor->entity': 1.3,   // Actor-to-entity matters
    'entity->entity': 1.2,  // Entity correlations
    'wallet->actor': 1.1,   // Wallet linked to actor
    'token->entity': 1.0,   // Token-entity flows
  };

  const key = `${fromType}->${toType}`;
  weight *= boostMap[key] || 1.0;

  return weight;
}

/**
 * Relations Service Class
 */
export class RelationsService {
  /**
   * Upsert relation - main operation
   * Creates new or updates existing relation with recalculated density
   */
  async upsertRelation(params: {
    from: string;
    to: string;
    fromType: EntityType;
    toType: EntityType;
    direction: Direction;
    volumeUSD: number;
    timestamp: Date;
    tags?: string[];
  }): Promise<IRelation> {
    // Validate: cannot create self-relation
    if (params.from === params.to) {
      throw new AppError('Cannot create self-relation', 400, 'INVALID_RELATION');
    }

    return relationsRepository.upsert(params);
  }

  /**
   * Get relation by ID
   */
  async getById(id: string): Promise<IRelation> {
    const relation = await relationsRepository.findById(id);
    if (!relation) {
      throw new AppError('Relation not found', 404, 'NOT_FOUND');
    }
    return relation;
  }

  /**
   * Get corridor between two entities
   * Returns aggregated data for the "thick corridor" visualization
   */
  async getCorridor(
    fromId: string,
    toId: string
  ): Promise<{
    relations: IRelation[];
    summary: {
      totalInteractions: number;
      totalVolumeUSD: number;
      maxDensity: number;
      directions: Direction[];
      allTags: string[];
      firstSeen: Date | null;
      lastSeen: Date | null;
    };
  }> {
    const relations = await relationsRepository.findCorridor(fromId, toId);

    if (relations.length === 0) {
      return {
        relations: [],
        summary: {
          totalInteractions: 0,
          totalVolumeUSD: 0,
          maxDensity: 0,
          directions: [],
          allTags: [],
          firstSeen: null,
          lastSeen: null,
        },
      };
    }

    // Aggregate summary
    const summary = relations.reduce(
      (acc, rel) => {
        acc.totalInteractions += rel.interactionCount;
        acc.totalVolumeUSD += rel.volumeUSD;
        acc.maxDensity = Math.max(acc.maxDensity, rel.densityScore);
        if (!acc.directions.includes(rel.direction)) {
          acc.directions.push(rel.direction);
        }
        rel.tags.forEach((tag) => {
          if (!acc.allTags.includes(tag)) acc.allTags.push(tag);
        });
        if (!acc.firstSeen || rel.firstSeenAt < acc.firstSeen) {
          acc.firstSeen = rel.firstSeenAt;
        }
        if (!acc.lastSeen || rel.lastSeenAt > acc.lastSeen) {
          acc.lastSeen = rel.lastSeenAt;
        }
        return acc;
      },
      {
        totalInteractions: 0,
        totalVolumeUSD: 0,
        maxDensity: 0,
        directions: [] as Direction[],
        allTags: [] as string[],
        firstSeen: null as Date | null,
        lastSeen: null as Date | null,
      }
    );

    return { relations, summary };
  }

  /**
   * Get relations graph for an entity
   * Used for influence graph visualization
   */
  async getGraph(
    entityId: string,
    options: {
      entityType?: EntityType;
      depth?: number;
      minDensity?: number;
      limit?: number;
    } = {}
  ): Promise<{
    nodes: Array<{ id: string; type: EntityType }>;
    edges: Array<{
      from: string;
      to: string;
      density: number;
      influence: number;
      direction: Direction;
    }>;
  }> {
    const { depth = 1, minDensity = 0, limit = 50 } = options;

    // Get direct relations
    const relations = await relationsRepository.findForEntity(entityId, {
      entityType: options.entityType,
      minDensity,
      limit,
    });

    // Build graph
    const nodesMap = new Map<string, EntityType>();
    const edges: Array<{
      from: string;
      to: string;
      density: number;
      influence: number;
      direction: Direction;
    }> = [];

    // Add center node
    nodesMap.set(entityId, options.entityType || 'entity');

    // Process relations
    relations.forEach((rel) => {
      const fromStr = rel.from.toString();
      const toStr = rel.to.toString();

      nodesMap.set(fromStr, rel.fromType);
      nodesMap.set(toStr, rel.toType);

      edges.push({
        from: fromStr,
        to: toStr,
        density: rel.densityScore,
        influence: rel.influenceWeight,
        direction: rel.direction,
      });
    });

    // If depth > 1, get relations for connected nodes
    if (depth > 1) {
      const connectedIds = Array.from(nodesMap.keys()).filter(
        (id) => id !== entityId
      );

      for (const connectedId of connectedIds.slice(0, 10)) {
        // Limit depth expansion
        const secondLevel = await relationsRepository.findForEntity(
          connectedId,
          { minDensity: minDensity * 1.5, limit: 10 } // Higher threshold for 2nd level
        );

        secondLevel.forEach((rel) => {
          const fromStr = rel.from.toString();
          const toStr = rel.to.toString();

          nodesMap.set(fromStr, rel.fromType);
          nodesMap.set(toStr, rel.toType);

          // Avoid duplicate edges
          const edgeExists = edges.some(
            (e) =>
              (e.from === fromStr && e.to === toStr) ||
              (e.from === toStr && e.to === fromStr)
          );

          if (!edgeExists) {
            edges.push({
              from: fromStr,
              to: toStr,
              density: rel.densityScore,
              influence: rel.influenceWeight,
              direction: rel.direction,
            });
          }
        });
      }
    }

    // Convert to arrays
    const nodes = Array.from(nodesMap.entries()).map(([id, type]) => ({
      id,
      type,
    }));

    return { nodes, edges };
  }

  /**
   * Query relations with filters
   */
  async query(
    filter: RelationFilter,
    sort?: RelationSort,
    pagination?: PaginationOptions
  ): Promise<{
    relations: IRelation[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { relations, total } = await relationsRepository.findMany(
      filter,
      sort,
      pagination
    );

    const limit = pagination?.limit || 100;
    const offset = pagination?.offset || 0;

    return {
      relations,
      total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get top relations by density (hottest corridors)
   */
  async getTopCorridors(limit: number = 50): Promise<IRelation[]> {
    return relationsRepository.findTopByDensity(limit);
  }

  /**
   * Get top relations by influence
   */
  async getTopInfluencers(limit: number = 50): Promise<IRelation[]> {
    return relationsRepository.findTopByInfluence(limit);
  }

  /**
   * Add tags to relation
   */
  async addTags(id: string, tags: string[]): Promise<IRelation> {
    const relation = await relationsRepository.addTags(id, tags);
    if (!relation) {
      throw new AppError('Relation not found', 404, 'NOT_FOUND');
    }
    return relation;
  }

  /**
   * Delete relation
   */
  async delete(id: string): Promise<void> {
    const deleted = await relationsRepository.delete(id);
    if (!deleted) {
      throw new AppError('Relation not found', 404, 'NOT_FOUND');
    }
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<{
    totalRelations: number;
    totalVolume: number;
    avgDensity: number;
    byType: Record<string, number>;
  }> {
    return relationsRepository.getStats();
  }

  /**
   * Cleanup old relations
   */
  async cleanup(olderThanDays: number = 90): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);
    return relationsRepository.deleteOlderThan(cutoff);
  }

  /**
   * Recalculate density for all relations
   * Used for batch recalculation jobs
   */
  async recalculateAllDensities(): Promise<number> {
    const { relations } = await relationsRepository.findMany(
      {},
      { field: 'lastSeenAt', order: 'desc' },
      { limit: 10000, offset: 0 }
    );

    let updated = 0;

    for (const rel of relations) {
      const newDensity = calculateDensityScore(
        rel.interactionCount,
        rel.volumeUSD,
        rel.firstSeenAt,
        rel.lastSeenAt
      );

      const newInfluence = calculateInfluenceWeight(
        newDensity,
        rel.fromType,
        rel.toType
      );

      if (
        Math.abs(newDensity - rel.densityScore) > 0.01 ||
        Math.abs(newInfluence - rel.influenceWeight) > 0.01
      ) {
        await relationsRepository.update(rel._id.toString(), {
          densityScore: newDensity,
          influenceWeight: newInfluence,
        });
        updated++;
      }
    }

    return updated;
  }
}

// Export singleton instance
export const relationsService = new RelationsService();
