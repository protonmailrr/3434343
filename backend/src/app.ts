import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env.js';
import { registerRoutes } from './api/routes.js';
import { zodPlugin } from './plugins/zod.js';
import { websocketPlugin } from './plugins/websocket.js';
import { wsRoutes } from './ws/ws.server.js';
import { AppError } from './common/errors.js';

/**
 * Build Fastify Application
 */
export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
    },
    trustProxy: true,
  });

  // CORS
  app.register(cors, {
    origin: env.CORS_ORIGINS === '*' ? true : env.CORS_ORIGINS.split(','),
    credentials: true,
  });

  // Plugins
  app.register(zodPlugin);
  app.register(websocketPlugin);

  // Global error handler
  app.setErrorHandler((err, _req, reply) => {
    app.log.error(err);

    if (err instanceof AppError) {
      return reply.status(err.statusCode).send({
        ok: false,
        error: err.code,
        message: err.message,
      });
    }

    // Fastify validation errors
    if (err.validation) {
      return reply.status(400).send({
        ok: false,
        error: 'VALIDATION_ERROR',
        message: err.message,
      });
    }

    // Unknown errors
    const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
    return reply.status(statusCode).send({
      ok: false,
      error: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
  });

  // Not found handler
  app.setNotFoundHandler((_req, reply) => {
    reply.status(404).send({
      ok: false,
      error: 'NOT_FOUND',
      message: 'Route not found',
    });
  });

  // Register routes
  app.register(registerRoutes);

  // WebSocket routes (if enabled)
  if (env.WS_ENABLED) {
    app.register(wsRoutes, { prefix: '/api' });
  }

  return app;
}
