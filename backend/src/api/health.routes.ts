import type { FastifyInstance } from 'fastify';
import { mongoose } from '../db/mongoose.js';

/**
 * Health Routes
 */

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  // Basic health check
  app.get('/health', async () => {
    return {
      ok: true,
      ts: Date.now(),
      uptime: process.uptime(),
    };
  });

  // Detailed health check with DB status
  app.get('/health/detailed', async () => {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    return {
      ok: mongoStatus === 'connected',
      ts: Date.now(),
      uptime: process.uptime(),
      services: {
        mongodb: mongoStatus,
      },
      memory: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
    };
  });
}
