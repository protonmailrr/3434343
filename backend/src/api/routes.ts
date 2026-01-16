import type { FastifyInstance } from 'fastify';
import { healthRoutes } from './health.routes.js';

// Core module routes (uncomment as implemented)
// import { actorsRoutes } from '../core/actors/actors.routes.js';
// import { entitiesRoutes } from '../core/entities/entities.routes.js';
// import { walletsRoutes } from '../core/wallets/wallets.routes.js';
// import { tokensRoutes } from '../core/tokens/tokens.routes.js';
// import { relationsRoutes } from '../core/relations/relations.routes.js';
// import { bundlesRoutes } from '../core/bundles/bundles.routes.js';
// import { scoresRoutes } from '../core/scores/scores.routes.js';
// import { signalsRoutes } from '../core/signals/signals.routes.js';

/**
 * Register All Routes
 */

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  // Health endpoints
  await app.register(healthRoutes, { prefix: '/api' });

  // Core modules (uncomment as implemented)
  // await app.register(actorsRoutes, { prefix: '/api/actors' });
  // await app.register(entitiesRoutes, { prefix: '/api/entities' });
  // await app.register(walletsRoutes, { prefix: '/api/wallets' });
  // await app.register(tokensRoutes, { prefix: '/api/tokens' });
  // await app.register(relationsRoutes, { prefix: '/api/relations' });
  // await app.register(bundlesRoutes, { prefix: '/api/bundles' });
  // await app.register(scoresRoutes, { prefix: '/api/scores' });
  // await app.register(signalsRoutes, { prefix: '/api/signals' });

  app.log.info('Routes registered');
}
