/**
 * Job Scheduler
 * Runs periodic tasks (score recalculations, bundle detection, etc.)
 */

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

    const timer = setInterval(async () => {
      if (job.running) {
        console.log(`[Scheduler] Job ${name} still running, skipping`);
        return;
      }

      job.running = true;
      try {
        await job.handler();
        job.lastRun = new Date();
      } catch (err) {
        console.error(`[Scheduler] Job ${name} failed:`, err);
      } finally {
        job.running = false;
      }
    }, job.interval);

    this.timers.set(name, timer);
    console.log(`[Scheduler] Job started: ${name}`);
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

/**
 * Register default jobs
 * Call this after DB connection
 */
export function registerDefaultJobs(): void {
  // Example jobs (uncomment when services are ready)

  // scheduler.register('recalculate-scores', 60_000, async () => {
  //   // await scoresService.recalculateAll();
  // });

  // scheduler.register('detect-bundles', 300_000, async () => {
  //   // await bundlesService.detectNewBundles();
  // });

  // scheduler.register('cleanup-old-transfers', 3600_000, async () => {
  //   // await transfersService.cleanupOld();
  // });

  console.log('[Scheduler] Default jobs registered (none active yet)');
}
