import 'dotenv/config';
import { buildApp } from './app.js';
import { connectMongo, disconnectMongo } from './db/mongoose.js';
import { env } from './config/env.js';
import { scheduler, registerDefaultJobs } from './jobs/scheduler.js';

async function main(): Promise<void> {
  // Connect to MongoDB
  console.log('[Server] Connecting to MongoDB...');
  await connectMongo();

  // Build Fastify app
  const app = buildApp();

  // Register scheduled jobs (including ERC-20 indexer)
  registerDefaultJobs();

  // Start scheduler jobs
  scheduler.startAll();

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`[Server] Received ${signal}, shutting down...`);

    scheduler.stopAll();
    await app.close();
    await disconnectMongo();

    console.log('[Server] Shutdown complete');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Start server
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`[Server] Backend started on port ${env.PORT}`);
    console.log(`[Server] Environment: ${env.NODE_ENV}`);
    console.log(`[Server] WebSocket: ${env.WS_ENABLED ? 'enabled' : 'disabled'}`);
    console.log(`[Server] Indexer: ${env.INDEXER_ENABLED && env.INFURA_RPC_URL ? 'enabled' : 'disabled'}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[Server] Fatal error:', err);
  process.exit(1);
});
