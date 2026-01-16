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
L6 (Ranking)      → Scores (behavior, intensity, consistency, risk, influence) ✅
L7 (User Layer)   → Alerts (subscriptions) [UPCOMING]
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
- Tracks sync state per indexer

### Phase 1.2 - Normalized Transfers ✅
- Converts raw logs to normalized `transfers`
- Supports multiple asset types (ERC-20, native)

### Phase 2 - Relations Engine ✅
- Aggregates transfers into `relations`
- Calculates interaction density
- Time windows: 1d, 7d, 30d

### Phase 3 - Bundles (Warhammer Logic) ✅
- Classifies relations: accumulation, distribution, flow, wash, rotation
- Intensity scoring

### Phase 4 - Signals (Event Layer) ✅ [2026-01-16]
- Detects state changes in bundles
- Signal types: new_corridor, wash_detected, intensity_spike/drop, accumulation/distribution start/end
- Dedup intervals: 24h (new_corridor, wash), 12h (bundle_change), 6h (intensity)
- prevState/newState adapter for UI

### Phase 5 - Scores (Rating Core) ✅ [2026-01-16]
- 5 Independent Scores:
  - **Behavior Score**: accumulation/distribution/wash ratios
  - **Intensity Score**: avg/peak density, volume weighted
  - **Consistency Score**: active days, signal noise ratio
  - **Risk Score**: wash, reversals, variance
  - **Influence Score**: followers, front-run ratio
- **Composite Score**: BS*0.25 + IS*0.25 + CS*0.20 + INF*0.20 - RS*0.20
- **Tier System**: green (80+), yellow (60-79), orange (40-59), red (0-39)
- 1153 addresses scored in testing

## Prioritized Backlog

### P0 - DONE

### P1 - Phase 6: Alerts
- User subscription system
- Push notifications for signals
- Alert rules engine

### P2 - Infrastructure
- Switch supervisor to TypeScript backend permanently
- Fix WebSocket error in `ws.server.ts`

### P3 - Future Features
- Actors module (whale tracking)
- Influence module (leader/follower detection)
- Copy-trading detection
- Native ETH indexing

## Key Files
- `/app/backend/src/jobs/scheduler.ts` - Job orchestration (6 jobs)
- `/app/backend/src/core/scores/` - Score calculation module
- `/app/backend/src/core/signals/` - Signal detection module
- `/app/backend/src/jobs/build_scores.job.ts` - Score calculation job (90s interval)

## API Endpoints

### Scores (L6)
- `GET /api/scores/address/:address` - Score for address
- `GET /api/scores/address/:address/all` - All window scores
- `GET /api/scores/actor/:id` - Score for actor
- `GET /api/scores/entity/:id` - Score for entity
- `GET /api/scores/top` - Leaderboard (sort: composite/behavior/intensity/risk/influence)
- `GET /api/scores/watchlist?addresses=0x...,0x...` - Batch lookup
- `GET /api/scores/stats` - Statistics

### Signals (L5)
- `GET /api/signals/latest` - Latest signals
- `GET /api/signals/stats` - Signal statistics
- `GET /api/signals/address/:addr` - Signals for address
- `GET /api/signals/corridor/:from/:to` - Signals for corridor

## Known Issues
1. Supervisor runs Python backend; TS backend requires manual start
2. Placeholder modules (actors, entities, wallets) excluded from build
3. WebSocket `socket.on` error (deferred)
