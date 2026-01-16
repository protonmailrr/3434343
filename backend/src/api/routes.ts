import type { FastifyInstance } from 'fastify';
import { healthRoutes } from './health.routes.js';

// Core module routes
import { relationsRoutes } from '../core/relations/relations.routes.js';
import { transfersRoutes } from '../core/transfers/transfers.routes.js';
import { bundlesRoutes } from '../core/bundles/bundles.routes.js';
import { signalsRoutes } from '../core/signals/signals.routes.js';
import { scoresRoutes } from '../core/scores/scores.routes.js';

// Future modules (uncomment as implemented)
// import { actorsRoutes } from '../core/actors/actors.routes.js';
// import { entitiesRoutes } from '../core/entities/entities.routes.js';
// import { walletsRoutes } from '../core/wallets/wallets.routes.js';
// import { tokensRoutes } from '../core/tokens/tokens.routes.js';

/**
 * Register All Routes
 */

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  // Health endpoints
  await app.register(healthRoutes, { prefix: '/api' });

  // ========== CORE MODULES ==========
  
  // Transfers - Normalized layer (L2)
  await app.register(transfersRoutes, { prefix: '/api/transfers' });
  
  // Relations - Aggregated layer (L3)
  await app.register(relationsRoutes, { prefix: '/api/relations' });
  
  // Bundles - Intelligence layer (L4)
  await app.register(bundlesRoutes, { prefix: '/api/bundles' });
  
  // Signals - Event layer (L5)
  await app.register(signalsRoutes, { prefix: '/api/signals' });

  // Future modules (uncomment as implemented)
  // await app.register(actorsRoutes, { prefix: '/api/actors' });
  // await app.register(entitiesRoutes, { prefix: '/api/entities' });
  // await app.register(walletsRoutes, { prefix: '/api/wallets' });
  // await app.register(tokensRoutes, { prefix: '/api/tokens' });
  // await app.register(scoresRoutes, { prefix: '/api/scores' });

  app.log.info('Routes registered');
}
