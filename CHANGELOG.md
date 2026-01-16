# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Phase 7: Copy Signals (planned)
- Phase 8: Market Context Layer (planned)

---

## [0.6.0] - 2025-01-16

### Added - Phase 6: Strategy Profiles

#### New Module: `/src/core/strategies/`
- `strategy_profiles.model.ts` - Mongoose model with 7 strategy types
- `strategy_profiles.schema.ts` - Zod validation schemas
- `strategy_profiles.repository.ts` - Database operations
- `strategy_profiles.service.ts` - Classification logic with thresholds
- `strategy_profiles.routes.ts` - API endpoints

#### Strategy Types
- `accumulation_sniper` - Early entry specialist
- `distribution_whale` - Large-scale distributor
- `momentum_rider` - Short-term intensity trader
- `rotation_trader` - Multi-asset cycler
- `wash_operator` - Suspicious symmetric activity
- `liquidity_farmer` - LP patterns
- `mixed` - No dominant strategy

#### New Job
- `build_strategy_profiles.job.ts` - Runs every 5 minutes
- Classifies addresses based on bundle breakdown and scores
- Tracks strategy changes over time

#### New API Endpoints
```
GET /api/strategies/top
GET /api/strategies/address/:address
GET /api/strategies/type/:strategyType
GET /api/strategies/types
GET /api/strategies/stats
```

### Changed
- Updated `scheduler.ts` to include 7th job
- Updated `routes.ts` to register strategy routes
- Updated `getIndexerStatus()` to include strategy profile stats

---

## [0.5.0] - 2025-01-16

### Added - Phase 5: Scores (Rating Core)

#### New Module: `/src/core/scores/`
- 5 independent score dimensions:
  - Behavior Score (accumulation/distribution ratios)
  - Intensity Score (density, volume)
  - Consistency Score (active days, signal noise)
  - Risk Score (wash, reversals, variance)
  - Influence Score (followers, front-run)
- Composite score formula with tier system
- Windows: 7d, 30d, 90d

#### New Job
- `build_scores.job.ts` - Runs every 90 seconds
- Calculates scores from bundles, relations, signals

#### New API Endpoints
```
GET /api/scores/address/:address
GET /api/scores/address/:address/all
GET /api/scores/top
GET /api/scores/watchlist
GET /api/scores/stats
```

---

## [0.4.0] - 2025-01-16

### Added - Phase 4: Signals (Event Layer)

#### New Module: `/src/core/signals/`
- Event-driven signal detection
- Signal types: new_corridor, accumulation_start/end, distribution_start/end, wash_detected/cleared, intensity_spike/drop, bundle_change, rotation_shift
- Severity scoring (0-100) with tiers
- Deduplication by type (6h-24h intervals)

#### Signal Dedup Intervals
- `new_corridor`: 24h
- `wash_detected/cleared`: 24h
- `accumulation/distribution_start/end`: 12h
- `bundle_change`: 12h
- `intensity_spike/drop`: 6h

#### API Updates
- Added `prevState/newState` adapter in formatSignal for UI diff

---

## [0.3.0] - 2025-01-15

### Added - Phase 3: Bundles (Warhammer Logic)

#### New Module: `/src/core/bundles/`
- Behavioral classification of relations
- Bundle types: accumulation, distribution, flow, wash, rotation, unknown
- Intensity scoring
- Netflow calculation

#### New Job
- `build_bundles.job.ts` - Classifies relations into bundles

---

## [0.2.0] - 2025-01-15

### Added - Phase 2: Relations Engine

#### New Module: `/src/core/relations/`
- Corridor aggregation
- Interaction density calculation
- Time windows: 1d, 7d, 30d

#### New Job
- `build_relations.job.ts` - Aggregates transfers to relations

---

## [0.1.0] - 2025-01-15

### Added - Phase 1: Foundation

#### Phase 1.1: ERC-20 Indexer
- Real-time Transfer event indexing via Infura RPC
- Sync state tracking
- Batch processing with rate limit handling

#### Phase 1.2: Normalized Transfers
- `transfers` collection with normalized schema
- Support for ERC-20 and native transfers

#### Infrastructure
- Fastify server setup
- MongoDB connection with Mongoose
- Job scheduler with interval-based execution
- Zod validation plugin
- Health check endpoints

---

## Migration Notes

### From Python to TypeScript
The backend was migrated from Python (FastAPI) to TypeScript (Fastify). The Python server (`server.py`) is kept for backward compatibility but the TypeScript backend is the primary development target.

To switch to TypeScript backend permanently:
1. Update supervisor config to use `yarn start` instead of `uvicorn`
2. Ensure all environment variables are set
3. Run `yarn build` before starting
