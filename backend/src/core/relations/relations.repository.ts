/**
 * Relations Repository
 * Database operations for relations
 */
import { RelationModel, IRelation, EntityType, Direction } from './relations.model.js';
import { FilterQuery, SortOrder } from 'mongoose';

export interface RelationFilter {
  from?: string;
  to?: string;
  fromType?: EntityType;
  toType?: EntityType;
  direction?: Direction;
  minDensity?: number;
  maxDensity?: number;
  minVolume?: number;
  maxVolume?: number;
  minInteractions?: number;
  tags?: string[];
  since?: Date;
  until?: Date;
}

export interface RelationSort {
  field: 'densityScore' | 'volumeUSD' | 'interactionCount' | 'lastSeenAt' | 'influenceWeight';
  order: 'asc' | 'desc';
}

export interface PaginationOptions {
  limit: number;
  offset: number;
}

/**
 * Build MongoDB filter from RelationFilter
 */
function buildFilter(filter: RelationFilter): FilterQuery<IRelation> {
  const query: FilterQuery<IRelation> = {};

  if (filter.from) query.from = filter.from;
  if (filter.to) query.to = filter.to;
  if (filter.fromType) query.fromType = filter.fromType;
  if (filter.toType) query.toType = filter.toType;
  if (filter.direction) query.direction = filter.direction;

  // Density range
  if (filter.minDensity !== undefined || filter.maxDensity !== undefined) {
    query.densityScore = {};
    if (filter.minDensity !== undefined) query.densityScore.$gte = filter.minDensity;
    if (filter.maxDensity !== undefined) query.densityScore.$lte = filter.maxDensity;
  }

  // Volume range
  if (filter.minVolume !== undefined || filter.maxVolume !== undefined) {
    query.volumeUSD = {};
    if (filter.minVolume !== undefined) query.volumeUSD.$gte = filter.minVolume;
    if (filter.maxVolume !== undefined) query.volumeUSD.$lte = filter.maxVolume;
  }

  // Minimum interactions
  if (filter.minInteractions !== undefined) {
    query.interactionCount = { $gte: filter.minInteractions };
  }

  // Tags filter (match any)
  if (filter.tags && filter.tags.length > 0) {
    query.tags = { $in: filter.tags };
  }

  // Time range
  if (filter.since || filter.until) {
    query.lastSeenAt = {};
    if (filter.since) query.lastSeenAt.$gte = filter.since;
    if (filter.until) query.lastSeenAt.$lte = filter.until;
  }

  return query;
}

/**
 * Relations Repository Class
 */
export class RelationsRepository {
  /**
   * Find relation by ID
   */
  async findById(id: string): Promise<IRelation | null> {
    return RelationModel.findById(id).lean();
  }

  /**
   * Find unique relation between two entities
   */
  async findByPair(
    from: string,
    to: string,
    fromType: EntityType,
    toType: EntityType
  ): Promise<IRelation | null> {
    return RelationModel.findOne({ from, to, fromType, toType }).lean();
  }

  /**
   * Find corridor (relation in both directions)
   */
  async findCorridor(fromId: string, toId: string): Promise<IRelation[]> {
    return RelationModel.find({
      $or: [
        { from: fromId, to: toId },
        { from: toId, to: fromId },
      ],
    })
      .sort({ densityScore: -1 })
      .lean();
  }

  /**
   * Find all relations with filters
   */
  async findMany(
    filter: RelationFilter,
    sort: RelationSort = { field: 'densityScore', order: 'desc' },
    pagination: PaginationOptions = { limit: 100, offset: 0 }
  ): Promise<{ relations: IRelation[]; total: number }> {
    const query = buildFilter(filter);
    const sortObj: Record<string, SortOrder> = {
      [sort.field]: sort.order === 'asc' ? 1 : -1,
    };

    const [relations, total] = await Promise.all([
      RelationModel.find(query)
        .sort(sortObj)
        .skip(pagination.offset)
        .limit(pagination.limit)
        .lean(),
      RelationModel.countDocuments(query),
    ]);

    return { relations, total };
  }

  /**
   * Find relations for entity (graph query)
   */
  async findForEntity(
    entityId: string,
    options: {
      entityType?: EntityType;
      minDensity?: number;
      limit?: number;
    } = {}
  ): Promise<IRelation[]> {
    const query: FilterQuery<IRelation> = {
      $or: [{ from: entityId }, { to: entityId }],
    };

    if (options.minDensity !== undefined) {
      query.densityScore = { $gte: options.minDensity };
    }

    return RelationModel.find(query)
      .sort({ densityScore: -1 })
      .limit(options.limit || 50)
      .lean();
  }

  /**
   * Find top relations by density
   */
  async findTopByDensity(limit: number = 100): Promise<IRelation[]> {
    return RelationModel.find()
      .sort({ densityScore: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Find top relations by influence weight
   */
  async findTopByInfluence(limit: number = 100): Promise<IRelation[]> {
    return RelationModel.find()
      .sort({ influenceWeight: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Create new relation
   */
  async create(data: {
    from: string;
    to: string;
    fromType: EntityType;
    toType: EntityType;
    direction: Direction;
    volumeUSD: number;
    timestamp: Date;
    tags?: string[];
  }): Promise<IRelation> {
    const relation = new RelationModel({
      ...data,
      interactionCount: 1,
      densityScore: 1,
      influenceWeight: 1,
      firstSeenAt: data.timestamp,
      lastSeenAt: data.timestamp,
    });

    return relation.save();
  }

  /**
   * Update relation
   */
  async update(
    id: string,
    data: Partial<{
      direction: Direction;
      interactionCount: number;
      volumeUSD: number;
      densityScore: number;
      influenceWeight: number;
      lastSeenAt: Date;
      tags: string[];
    }>
  ): Promise<IRelation | null> {
    return RelationModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).lean();
  }

  /**
   * Add tags to relation
   */
  async addTags(id: string, tags: string[]): Promise<IRelation | null> {
    return RelationModel.findByIdAndUpdate(
      id,
      { $addToSet: { tags: { $each: tags } } },
      { new: true }
    ).lean();
  }

  /**
   * Upsert relation (main operation)
   */
  async upsert(data: {
    from: string;
    to: string;
    fromType: EntityType;
    toType: EntityType;
    direction: Direction;
    volumeUSD: number;
    timestamp: Date;
    tags?: string[];
  }): Promise<IRelation> {
    const existing = await this.findByPair(
      data.from,
      data.to,
      data.fromType,
      data.toType
    );

    if (!existing) {
      return this.create(data);
    }

    // Update existing relation
    const interactionCount = existing.interactionCount + 1;
    const volumeUSD = existing.volumeUSD + data.volumeUSD;

    // Calculate density score
    const days = Math.max(
      (data.timestamp.getTime() - existing.firstSeenAt.getTime()) /
        (1000 * 60 * 60 * 24),
      1
    );

    const densityScore =
      (Math.log(interactionCount + 1) * Math.log(volumeUSD + 1)) / days;

    // Merge tags
    const tags = [...new Set([...(existing.tags || []), ...(data.tags || [])])];

    return RelationModel.findByIdAndUpdate(
      existing._id,
      {
        $set: {
          interactionCount,
          volumeUSD,
          densityScore,
          influenceWeight: densityScore,
          lastSeenAt: data.timestamp,
          direction: data.direction,
          tags,
        },
      },
      { new: true }
    ).lean() as Promise<IRelation>;
  }

  /**
   * Delete relation
   */
  async delete(id: string): Promise<boolean> {
    const result = await RelationModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  /**
   * Delete old relations
   */
  async deleteOlderThan(date: Date): Promise<number> {
    const result = await RelationModel.deleteMany({
      lastSeenAt: { $lt: date },
    });
    return result.deletedCount;
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
    const [stats, byType] = await Promise.all([
      RelationModel.aggregate([
        {
          $group: {
            _id: null,
            totalRelations: { $sum: 1 },
            totalVolume: { $sum: '$volumeUSD' },
            avgDensity: { $avg: '$densityScore' },
          },
        },
      ]),
      RelationModel.aggregate([
        {
          $group: {
            _id: { fromType: '$fromType', toType: '$toType' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const typeStats: Record<string, number> = {};
    byType.forEach((item) => {
      const key = `${item._id.fromType}->${item._id.toType}`;
      typeStats[key] = item.count;
    });

    return {
      totalRelations: stats[0]?.totalRelations || 0,
      totalVolume: stats[0]?.totalVolume || 0,
      avgDensity: stats[0]?.avgDensity || 0,
      byType: typeStats,
    };
  }
}

// Export singleton instance
export const relationsRepository = new RelationsRepository();
