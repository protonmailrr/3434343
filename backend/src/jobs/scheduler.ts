/**
 * Job Scheduler
 * Runs periodic tasks (indexer, score recalculations, bundle detection, etc.)
 */
import { env } from '../config/env.js';
import { EthereumRpc, syncERC20Transfers, getSyncStatus } from '../onchain/ethereum/index.js';
import { buildTransfersFromERC20, getBuildStatus } from './build_transfers.job.js';
import { buildRelations, getBuildRelationsStatus } from './build_relations.job.js';
import { buildBundles, getBuildBundlesStatus } from './build_bundles.job.js';
import { buildSignals, getBuildSignalsStatus } from './build_signals.job.js';
import { buildScores, getBuildScoresStatus } from './build_scores.job.js';
import { buildStrategyProfiles, getBuildStrategyProfilesStatus } from './build_strategy_profiles.job.js';

interface ScheduledJob {
  name: string;
  interval: number; // ms
  handler: () => Promise<void>;
  lastRun?: Date;
  running: boolean;
}

class Scheduler {
  private jobs: Map<string, ScheduledJob> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Register a new job
   */
  register(name: string, intervalMs: number, handler: () => Promise<void>): void {
    this.jobs.set(name, {
      name,
      interval: intervalMs,
      handler,
      running: false,
    });
    console.log(`[Scheduler] Job registered: ${name} (every ${intervalMs}ms)`);
  }

  /**
   * Start all jobs
   */
  startAll(): void {
    for (const job of this.jobs.values()) {
      this.startJob(job.name);
    }
  }

  /**
   * Start a specific job
   */
  startJob(name: string): void {
    const job = this.jobs.get(name);
    if (!job) return;

    // Run immediately first time
    this.runJob(job);

    const timer = setInterval(() => this.runJob(job), job.interval);
    this.timers.set(name, timer);
    console.log(`[Scheduler] Job started: ${name}`);
  }

  /**
   * Run a job
   */
  private async runJob(job: ScheduledJob): Promise<void> {
    if (job.running) {
      console.log(`[Scheduler] Job ${job.name} still running, skipping`);
      return;
    }

    job.running = true;
    try {
      await job.handler();
      job.lastRun = new Date();
    } catch (err) {
      console.error(`[Scheduler] Job ${job.name} failed:`, err);
    } finally {
      job.running = false;
    }
  }

  /**
   * Stop all jobs
   */
  stopAll(): void {
    for (const [name, timer] of this.timers) {
      clearInterval(timer);
      console.log(`[Scheduler] Job stopped: ${name}`);
    }
    this.timers.clear();
  }

  /**
   * Stop a specific job
   */
  stopJob(name: string): void {
    const timer = this.timers.get(name);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(name);
      console.log(`[Scheduler] Job stopped: ${name}`);
    }
  }

  /**
   * Get job status
   */
  getStatus(): Record<string, { running: boolean; lastRun?: Date }> {
    const status: Record<string, { running: boolean; lastRun?: Date }> = {};
    for (const [name, job] of this.jobs) {
      status[name] = { running: job.running, lastRun: job.lastRun };
    }
    return status;
  }
}

export const scheduler = new Scheduler();

// Global RPC instance (initialized in registerDefaultJobs)
let ethereumRpc: EthereumRpc | null = null;

/**
 * Get Ethereum RPC instance
 */
export function getEthereumRpc(): EthereumRpc | null {
  return ethereumRpc;
}

/**
 * Register default jobs
 * Call this after DB connection
 */
export function registerDefaultJobs(): void {
  // ========== ERC-20 INDEXER JOB ==========
  if (env.INDEXER_ENABLED && env.INFURA_RPC_URL) {
    ethereumRpc = new EthereumRpc(env.INFURA_RPC_URL);

    scheduler.register('erc20-indexer', env.INDEXER_INTERVAL_MS, async () => {
      if (!ethereumRpc) return;
      
      try {
        const result = await syncERC20Transfers(ethereumRpc);
        
        // Log progress periodically
        if (result.logsCount > 0) {
          console.log(
            `[ERC20 Indexer] Synced blocks ${result.fromBlock}-${result.toBlock}: ` +
            `${result.newLogsCount} new logs (${result.duration}ms)`
          );
        }
      } catch (err) {
        console.error('[ERC20 Indexer] Sync failed:', err);
      }
    });

    console.log('[Scheduler] ERC-20 Indexer job registered');
  } else {
    console.log('[Scheduler] ERC-20 Indexer disabled (no INFURA_RPC_URL or INDEXER_ENABLED=false)');
  }

  // ========== BUILD TRANSFERS JOB (L1 → L2) ==========
  if (env.INDEXER_ENABLED) {
    // Run slightly after indexer to ensure logs are available
    const buildInterval = env.INDEXER_INTERVAL_MS + 5000; // 5 seconds after indexer
    
    scheduler.register('build-transfers', buildInterval, async () => {
      try {
        const result = await buildTransfersFromERC20();
        
        if (result.processed > 0) {
          console.log(
            `[Build Transfers] Created ${result.created} transfers from ${result.processed} logs (${result.duration}ms)`
          );
        }
      } catch (err) {
        console.error('[Build Transfers] Job failed:', err);
      }
    });

    console.log('[Scheduler] Build Transfers job registered');
  }

  // ========== BUILD RELATIONS JOB (L2 → L3) ==========
  if (env.INDEXER_ENABLED) {
    // Run after build-transfers to ensure transfers are available
    const relationsInterval = env.INDEXER_INTERVAL_MS + 10000; // 10 seconds after indexer
    
    scheduler.register('build-relations', relationsInterval, async () => {
      try {
        const result = await buildRelations();
        
        if (result.processedTransfers > 0) {
          console.log(
            `[Build Relations] Created ${result.relationsCreated} relations, ` +
            `updated ${result.relationsUpdated} from ${result.processedTransfers} transfers (${result.duration}ms)`
          );
        }
      } catch (err) {
        console.error('[Build Relations] Job failed:', err);
      }
    });

    console.log('[Scheduler] Build Relations job registered');
  }

  // ========== BUILD BUNDLES JOB (L3 → L4) ==========
  if (env.INDEXER_ENABLED) {
    // Run after build-relations
    const bundlesInterval = env.INDEXER_INTERVAL_MS + 20000; // 20 seconds after indexer
    
    scheduler.register('build-bundles', bundlesInterval, async () => {
      try {
        const result = await buildBundles();
        
        if (result.processedPairs > 0) {
          console.log(
            `[Build Bundles] Created ${result.bundlesCreated} bundles, ` +
            `updated ${result.bundlesUpdated} from ${result.processedPairs} pairs (${result.duration}ms)`
          );
        }
      } catch (err) {
        console.error('[Build Bundles] Job failed:', err);
      }
    });

    console.log('[Scheduler] Build Bundles job registered');
  }

  // ========== BUILD SIGNALS JOB (L4 → L5) ==========
  if (env.INDEXER_ENABLED) {
    // Run after build-bundles
    const signalsInterval = env.INDEXER_INTERVAL_MS + 30000; // 30 seconds after indexer
    
    scheduler.register('build-signals', signalsInterval, async () => {
      try {
        const result = await buildSignals();
        
        if (result.signalsGenerated > 0) {
          console.log(
            `[Build Signals] Generated ${result.signalsGenerated} signals ` +
            `from ${result.processedBundles} bundles (${result.duration}ms)`
          );
        }
      } catch (err) {
        console.error('[Build Signals] Job failed:', err);
      }
    });

    console.log('[Scheduler] Build Signals job registered');
  }

  // ========== BUILD SCORES JOB (L5 → L6) ==========
  if (env.INDEXER_ENABLED) {
    // Run every 90 seconds, after signals
    const scoresInterval = 90000; // 90 seconds
    
    scheduler.register('build-scores', scoresInterval, async () => {
      try {
        const result = await buildScores();
        
        if (result.scoresUpdated > 0) {
          console.log(
            `[Build Scores] Updated ${result.scoresUpdated} scores ` +
            `for ${result.processedAddresses} addresses (${result.duration}ms)`
          );
        }
      } catch (err) {
        console.error('[Build Scores] Job failed:', err);
      }
    });

    console.log('[Scheduler] Build Scores job registered');
  }

  // ========== BUILD STRATEGY PROFILES JOB (L6 → L7) ==========
  if (env.INDEXER_ENABLED) {
    // Run every 5 minutes (strategies are not high-frequency)
    const strategyInterval = 5 * 60 * 1000; // 5 minutes
    
    scheduler.register('build-strategy-profiles', strategyInterval, async () => {
      try {
        const result = await buildStrategyProfiles();
        
        if (result.profilesUpdated > 0) {
          console.log(
            `[Build Strategy Profiles] Updated ${result.profilesUpdated} profiles ` +
            `for ${result.processedAddresses} addresses (${result.duration}ms)`
          );
          if (result.strategyShifts > 0) {
            console.log(`[Build Strategy Profiles] Strategy shifts: ${result.strategyShifts}`);
          }
        }
      } catch (err) {
        console.error('[Build Strategy Profiles] Job failed:', err);
      }
    });

    console.log('[Scheduler] Build Strategy Profiles job registered');
  }

  // ========== FUTURE JOBS ==========

  // scheduler.register('cleanup-old-transfers', 3600_000, async () => {
  //   // await transfersService.cleanupOld();
  // });

  console.log('[Scheduler] Default jobs registered');
}

/**
 * Get indexer status (for API)
 */
export async function getIndexerStatus(): Promise<{
  enabled: boolean;
  rpcUrl: string | null;
  syncStatus: {
    syncedBlock: number;
    latestBlock: number;
    blocksBehind: number;
    totalLogs: number;
  } | null;
  buildStatus: {
    lastProcessedBlock: number;
    pendingLogs: number;
    totalTransfers: number;
  } | null;
  relationsStatus: {
    unprocessedTransfers: number;
    totalRelations: number;
    byWindow: Record<string, number>;
  } | null;
  bundlesStatus: {
    totalBundles: number;
    byType: Record<string, number>;
    byWindow: Record<string, number>;
  } | null;
  signalsStatus: {
    totalSignals: number;
    last24h: number;
    unacknowledged: number;
    byType: Record<string, number>;
  } | null;
  scoresStatus: {
    totalScores: number;
    byTier: Record<string, number>;
    avgComposite: number;
    lastCalculated: string | null;
  } | null;
  strategyProfilesStatus: {
    totalProfiles: number;
    byStrategy: Record<string, number>;
    avgConfidence: number;
    avgStability: number;
  } | null;
}> {
  if (!ethereumRpc || !env.INDEXER_ENABLED) {
    return {
      enabled: false,
      rpcUrl: null,
      syncStatus: null,
      buildStatus: null,
      relationsStatus: null,
      bundlesStatus: null,
      signalsStatus: null,
      scoresStatus: null,
      strategyProfilesStatus: null,
    };
  }

  try {
    const [syncStatus, buildStatus, relationsStatus, bundlesStatus, signalsStatus, scoresStatus, strategyProfilesStatus] = await Promise.all([
      getSyncStatus(ethereumRpc),
      getBuildStatus(),
      getBuildRelationsStatus(),
      getBuildBundlesStatus(),
      getBuildSignalsStatus(),
      getBuildScoresStatus(),
      getBuildStrategyProfilesStatus(),
    ]);

    return {
      enabled: true,
      rpcUrl: env.INFURA_RPC_URL ? '[configured]' : null,
      syncStatus,
      buildStatus,
      relationsStatus,
      bundlesStatus,
      signalsStatus,
      scoresStatus,
      strategyProfilesStatus,
    };
  } catch (err) {
    console.error('[Scheduler] Failed to get indexer status:', err);
    return {
      enabled: true,
      rpcUrl: env.INFURA_RPC_URL ? '[configured]' : null,
      syncStatus: null,
      buildStatus: null,
      relationsStatus: null,
      bundlesStatus: null,
      signalsStatus: null,
      scoresStatus: null,
    };
  }
}
