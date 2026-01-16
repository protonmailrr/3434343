/**
 * Relations Routes
 * API endpoints for relation operations
 * 
 * Base path: /api/relations
 * 
 * Endpoints:
 * - GET  /                    - Query relations with filters
 * - GET  /stats               - Get relation statistics
 * - GET  /top/corridors       - Get hottest corridors
 * - GET  /top/influencers     - Get top influence relations
 * - GET  /corridor/:from/:to  - Get corridor between two entities
 * - GET  /graph/:entityId     - Get relation graph for entity
 * - GET  /:id                 - Get relation by ID
 * - POST /                    - Upsert relation
 * - POST /:id/tags            - Add tags to relation
 * - DELETE /:id               - Delete relation
 */
import type { FastifyInstance } from 'fastify';
import { relationsService } from './relations.service.js';
import {
  QueryRelationsSchema,
  UpsertRelationSchema,
  type QueryRelationsInput,
  type GraphQueryInput,
  type UpsertRelationInput,
} from './relations.schema.js';

/**
 * Format relation for API response
 */
function formatRelation(rel: any) {
  return {
    id: rel._id?.toString() || rel.id,
    from: rel.from?.toString() || rel.from,
    to: rel.to?.toString() || rel.to,
    fromType: rel.fromType,
    toType: rel.toType,
    direction: rel.direction,
    interactionCount: rel.interactionCount,
    volumeUSD: rel.volumeUSD,
    densityScore: Math.round(rel.densityScore * 100) / 100,
    influenceWeight: Math.round(rel.influenceWeight * 100) / 100,
    firstSeenAt: rel.firstSeenAt,
    lastSeenAt: rel.lastSeenAt,
    tags: rel.tags || [],
    createdAt: rel.createdAt,
    updatedAt: rel.updatedAt,
  };
}

/**
 * Relations Routes
 */
export async function relationsRoutes(app: FastifyInstance): Promise<void> {
  /**
   * GET / - Query relations with filters
   */
  app.get<{ Querystring: QueryRelationsInput }>(
    '/',
    async (request) => {
      // Parse and validate query params
      const parseResult = QueryRelationsSchema.safeParse(request.query);
      if (!parseResult.success) {
        return {
          ok: false,
          error: 'VALIDATION_ERROR',
          message: parseResult.error.message,
        };
      }
      const query = parseResult.data;

      const result = await relationsService.query(
        {
          from: query.from,
          to: query.to,
          fromType: query.fromType,
          toType: query.toType,
          direction: query.direction,
          minDensity: query.minDensity,
          maxDensity: query.maxDensity,
          minVolume: query.minVolume,
          maxVolume: query.maxVolume,
          minInteractions: query.minInteractions,
          tags: query.tags,
          since: query.since,
          until: query.until,
        },
        {
          field: query.sortBy || 'densityScore',
          order: query.sortOrder || 'desc',
        },
        {
          limit: query.limit || 100,
          offset: query.offset || 0,
        }
      );

      return {
        ok: true,
        data: {
          relations: result.relations.map(formatRelation),
          pagination: {
            total: result.total,
            page: result.page,
            totalPages: result.totalPages,
            limit: query.limit || 100,
          },
        },
      };
    }
  );

  /**
   * GET /stats - Get relation statistics
   */
  app.get('/stats', async () => {
    const stats = await relationsService.getStats();

    return {
      ok: true,
      data: stats,
    };
  });

  /**
   * GET /top/corridors - Get hottest corridors
   */
  app.get<{ Querystring: { limit?: number } }>(
    '/top/corridors',
    async (request) => {
      const limit = Math.min(Number(request.query.limit) || 50, 200);
      const relations = await relationsService.getTopCorridors(limit);

      return {
        ok: true,
        data: relations.map(formatRelation),
      };
    }
  );

  /**
   * GET /top/influencers - Get top influence relations
   */
  app.get<{ Querystring: { limit?: number } }>(
    '/top/influencers',
    async (request) => {
      const limit = Math.min(Number(request.query.limit) || 50, 200);
      const relations = await relationsService.getTopInfluencers(limit);

      return {
        ok: true,
        data: relations.map(formatRelation),
      };
    }
  );

  /**
   * GET /corridor/:from/:to - Get corridor between two entities
   * This is what frontend calls when user clicks on a thick corridor
   */
  app.get<{ Params: { from: string; to: string } }>(
    '/corridor/:from/:to',
    async (request) => {
      const { from, to } = request.params;
      const corridor = await relationsService.getCorridor(from, to);

      return {
        ok: true,
        data: {
          relations: corridor.relations.map(formatRelation),
          summary: corridor.summary,
        },
      };
    }
  );

  /**
   * GET /graph/:entityId - Get relation graph for entity
   * Used for influence graph visualization
   */
  app.get<{ Params: { entityId: string }; Querystring: Omit<GraphQueryInput, 'entityId'> }>(
    '/graph/:entityId',
    async (request) => {
      const { entityId } = request.params;
      const { entityType, depth, minDensity, limit } = request.query;

      const graph = await relationsService.getGraph(entityId, {
        entityType,
        depth: depth ? Number(depth) : 1,
        minDensity: minDensity ? Number(minDensity) : undefined,
        limit: limit ? Number(limit) : 50,
      });

      return {
        ok: true,
        data: graph,
      };
    }
  );

  /**
   * GET /:id - Get relation by ID
   */
  app.get<{ Params: { id: string } }>('/:id', async (request) => {
    const { id } = request.params;
    const relation = await relationsService.getById(id);

    return {
      ok: true,
      data: formatRelation(relation),
    };
  });

  /**
   * POST / - Upsert relation
   * Creates new or updates existing relation
   */
  app.post<{ Body: UpsertRelationInput }>(
    '/',
    {
      schema: {
        body: UpsertRelationSchema,
      },
    },
    async (request, reply) => {
      const data = request.body;

      const relation = await relationsService.upsertRelation({
        from: data.from,
        to: data.to,
        fromType: data.fromType,
        toType: data.toType,
        direction: data.direction,
        volumeUSD: data.volumeUSD,
        timestamp: new Date(data.timestamp),
        tags: data.tags,
      });

      return reply.status(201).send({
        ok: true,
        data: formatRelation(relation),
      });
    }
  );

  /**
   * POST /:id/tags - Add tags to relation
   */
  app.post<{ Params: { id: string }; Body: { tags: string[] } }>(
    '/:id/tags',
    async (request) => {
      const { id } = request.params;
      const { tags } = request.body;

      const relation = await relationsService.addTags(id, tags);

      return {
        ok: true,
        data: formatRelation(relation),
      };
    }
  );

  /**
   * DELETE /:id - Delete relation
   */
  app.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.params;
    await relationsService.delete(id);

    return reply.status(200).send({
      ok: true,
      message: 'Relation deleted',
    });
  });

  app.log.info('Relations routes registered');
}

// Also export as 'routes' for consistency
export { relationsRoutes as routes };
