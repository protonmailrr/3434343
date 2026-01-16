# On-Chain Intelligence Platform

## Original Problem Statement
Build a new TypeScript backend (Fastify) to replace the existing Python backend for an on-chain intelligence platform analyzing Ethereum ERC-20 transfer patterns.

## Architecture
```
L1 (Raw Data)     → ERC-20 Indexer (Infura RPC)
L2 (Normalized)   → Transfers (cleaned, normalized)
L3 (Aggregated)   → Relations (corridors, density)
L4 (Intelligence) → Bundles (accumulation, distribution, wash)
L5 (Events)       → Signals (state change detection)
L6 (Ranking)      → Scores (behavior, intensity, consistency, risk, influence)
L7 (Strategies)   → Strategy Profiles (trading pattern classification) ✅
L8 (User Layer)   → Copy Signals / Alerts [UPCOMING]
```

## Tech Stack
- **Frontend**: React, TailwindCSS
- **Backend**: TypeScript, Fastify, Mongoose
- **Database**: MongoDB
- **Blockchain**: Ethereum via Infura RPC

## What's Implemented

### Phase 1.1 - ERC-20 Indexer ✅
- Fetches Transfer events from Ethereum
- Stores raw logs in `erc20_logs` collection

### Phase 1.2 - Normalized Transfers ✅
- Converts raw logs to normalized `transfers`

### Phase 2 - Relations Engine ✅
- Aggregates transfers into `relations`
- Calculates interaction density

### Phase 3 - Bundles (Warhammer Logic) ✅
- Classifies relations: accumulation, distribution, flow, wash, rotation

### Phase 4 - Signals (Event Layer) ✅
- Detects state changes in bundles
- Dedup intervals by type (6h-24h)

### Phase 5 - Scores (Rating Core) ✅
- 5 Independent Scores: Behavior, Intensity, Consistency, Risk, Influence
- Composite Score formula with tier system

### Phase 6 - Strategy Profiles ✅ [2026-01-16]
- **6 Strategy Types**:
  - `accumulation_sniper` - Early entry, long hold
  - `distribution_whale` - Large-scale distributor
  - `momentum_rider` - Short-term, intensity spikes
  - `rotation_trader` - Multi-asset cycling
  - `wash_operator` - Suspicious symmetric activity
  - `liquidity_farmer` - LP patterns
  - `mixed` - No dominant strategy
- **Confidence & Stability** scores (0-1)
- **Risk/Influence levels**: low/medium/high
- **Performance proxy** from scores
- **Bundle breakdown** for classification
- Job runs every 5 minutes
- 500+ profiles classified in testing

## Prioritized Backlog

### P0 - DONE

### P1 - Phase 7: Copy Signals (Monetization Core)
- "Accumulation started by top-5 influence actor"
- "Rotation detected BEFORE market"
- Pro subscription tier

### P2 - Phase 8: Market Context Layer
- Market regime (risk-on/risk-off)
- Correlation with BTC/ETH
- Context-adjusted scores

### P3 - Infrastructure
- Switch supervisor to TypeScript backend permanently

## 8 Jobs Running
1. `erc20-indexer` - Fetch raw data
2. `build-transfers` - L1 → L2
3. `build-relations` - L2 → L3
4. `build-bundles` - L3 → L4
5. `build-signals` - L4 → L5
6. `build-scores` - Scores calculation (90s)
7. `build-strategy-profiles` - Strategy classification (5min)

## API Endpoints

### Strategies (L7)
- `GET /api/strategies/top` - Top profiles (sort: confidence/stability/influence/risk)
- `GET /api/strategies/address/:address` - Profile for address
- `GET /api/strategies/type/:strategyType` - Profiles by strategy
- `GET /api/strategies/stats` - Statistics
- `GET /api/strategies/types` - All strategy types with descriptions

### Scores (L6)
- `GET /api/scores/address/:address` - Score for address
- `GET /api/scores/top` - Leaderboard
- `GET /api/scores/watchlist` - Batch lookup

### Signals (L5)
- `GET /api/signals/latest` - Latest signals
- `GET /api/signals/stats` - Statistics

## Key Files
- `/app/backend/src/core/strategies/` - Strategy Profiles module
- `/app/backend/src/jobs/build_strategy_profiles.job.ts` - Classification job
- `/app/backend/src/jobs/scheduler.ts` - 7 jobs orchestrated
