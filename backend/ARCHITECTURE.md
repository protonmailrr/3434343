# Backend Architecture

## Overview

The BlockView backend is built with TypeScript and Fastify, implementing a multi-layer data processing pipeline for on-chain analytics.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Fastify 4.x
- **Language**: TypeScript 5.x
- **Database**: MongoDB 6+ with Mongoose ODM
- **Validation**: Zod
- **Blockchain**: ethers.js v6 (via Infura RPC)

## Core Modules

### `/src/core/`

Each domain module follows the same structure:

```
module/
├── module.model.ts       # Mongoose schema and interface
├── module.schema.ts      # Zod validation schemas
├── module.repository.ts  # Database operations
├── module.service.ts     # Business logic
├── module.routes.ts      # API endpoints
└── index.ts              # Module exports
```

### Module Descriptions

#### Transfers (`/src/core/transfers/`)
- **Model**: `ITransfer` - Normalized transfer record
- **Fields**: txHash, from, to, assetType, assetAddress, amountRaw, timestamp
- **Purpose**: L2 normalized layer from raw ERC-20 logs

#### Relations (`/src/core/relations/`)
- **Model**: `IRelation` - Aggregated corridor data
- **Fields**: from, to, window, interactionCount, volumeRaw, densityScore
- **Purpose**: L3 aggregated layer, represents "roads" between addresses

#### Bundles (`/src/core/bundles/`)
- **Model**: `IBundle` - Behavioral classification
- **Fields**: from, to, window, bundleType, intensityScore, confidence, netflowRaw
- **Purpose**: L4 intelligence layer, classifies "traffic" on roads

#### Signals (`/src/core/signals/`)
- **Model**: `ISignal` - State change events
- **Fields**: entityType, entityId, signalType, prevState, newState, severityScore, confidence
- **Purpose**: L5 event layer, detects meaningful changes

#### Scores (`/src/core/scores/`)
- **Model**: `IScore` - Multi-dimensional rating
- **Fields**: behaviorScore, intensityScore, consistencyScore, riskScore, influenceScore, compositeScore, tier
- **Purpose**: L6 ranking layer, explains "who is who"

#### Strategies (`/src/core/strategies/`)
- **Model**: `IStrategyProfile` - Trading strategy classification
- **Fields**: strategyType, confidence, stability, riskLevel, influenceLevel, bundleBreakdown
- **Purpose**: L7 strategy layer, identifies trading patterns

## Jobs Pipeline

### `/src/jobs/`

Jobs are orchestrated by `scheduler.ts` and run at different intervals:

```
┌─────────────────────────────────────────────────────────────────┐
│                      JOB EXECUTION ORDER                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [30s]  erc20-indexer                                           │
│            │                                                     │
│            ▼                                                     │
│  [35s]  build-transfers ──────────────────────────────────────► │
│            │                                                     │
│            ▼                                                     │
│  [40s]  build-relations ──────────────────────────────────────► │
│            │                                                     │
│            ▼                                                     │
│  [50s]  build-bundles ────────────────────────────────────────► │
│            │                                                     │
│            ▼                                                     │
│  [60s]  build-signals ────────────────────────────────────────► │
│            │                                                     │
│            ▼                                                     │
│  [90s]  build-scores ─────────────────────────────────────────► │
│            │                                                     │
│            ▼                                                     │
│  [5min] build-strategy-profiles ──────────────────────────────► │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Job Descriptions

| Job | File | Purpose |
|-----|------|---------|
| `erc20-indexer` | `onchain/ethereum/erc20.indexer.ts` | Fetches Transfer events via Infura RPC |
| `build-transfers` | `build_transfers.job.ts` | Normalizes raw logs to transfers |
| `build-relations` | `build_relations.job.ts` | Aggregates transfers to corridors (1d/7d/30d) |
| `build-bundles` | `build_bundles.job.ts` | Classifies relations into behavioral bundles |
| `build-signals` | `build_signals.job.ts` | Detects state changes in bundles |
| `build-scores` | `build_scores.job.ts` | Calculates 5 score dimensions |
| `build-strategy-profiles` | `build_strategy_profiles.job.ts` | Classifies trading strategies |

## Database Collections

| Collection | Layer | Purpose |
|------------|-------|---------|
| `erc20_logs` | L1 | Raw ERC-20 Transfer event logs |
| `sync_states` | - | Indexer sync state tracking |
| `transfers` | L2 | Normalized transfer records |
| `relations` | L3 | Aggregated corridor data |
| `bundles` | L4 | Behavioral classification |
| `signals` | L5 | State change events |
| `scores` | L6 | Multi-dimensional ratings |
| `strategy_profiles` | L7 | Strategy classification |

## API Structure

### Route Registration (`/src/api/routes.ts`)

```typescript
// Health
/api/health

// Core modules
/api/transfers      → transfersRoutes
/api/relations      → relationsRoutes
/api/bundles        → bundlesRoutes
/api/signals        → signalsRoutes
/api/scores         → scoresRoutes
/api/strategies     → strategyProfilesRoutes
```

## Configuration

### Environment Variables

```typescript
// /src/config/env.ts
interface Env {
  NODE_ENV: 'development' | 'production';
  PORT: number;
  MONGO_URL: string;
  DB_NAME: string;
  INFURA_RPC_URL: string;
  INDEXER_ENABLED: boolean;
  INDEXER_INTERVAL_MS: number;
}
```

## Error Handling

Custom error classes in `/src/common/errors.ts`:
- `ValidationError` - Input validation failures
- `NotFoundError` - Resource not found
- `InternalError` - Server errors

## Key Design Decisions

1. **Event-Driven Architecture**: Signals are generated on state CHANGES, not states
2. **Time Windows**: All aggregations support 1d/7d/30d windows
3. **Deduplication**: Signals have type-specific dedup intervals (6h-24h)
4. **Composite Scoring**: Risk score has negative weight in composite formula
5. **Strategy Classification**: Uses bundle breakdown ratios for classification
