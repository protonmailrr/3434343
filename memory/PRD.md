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
L6 (Ranking)      → Scores (smart_money, risk) [UPCOMING]
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
- 291 signals generated in testing

## Prioritized Backlog

### P0 - DONE

### P1 - Phase 5: Scores
- `scores.model.ts`, `scores.schema.ts`
- Calculate: `smart_money`, `risk`, `manipulation` scores
- Build job for periodic recalculation

### P2 - Phase 6: Alerts
- User subscription system
- Push notifications for signals

### P3 - Infrastructure
- Switch supervisor to TypeScript backend permanently
- Fix WebSocket error in `ws.server.ts`

### P3 - Future Features
- Actors module (whale tracking)
- Influence module
- Copy-trading detection
- Native ETH indexing

## Key Files
- `/app/backend/src/jobs/scheduler.ts` - Job orchestration
- `/app/backend/src/core/signals/` - Signal detection module
- `/app/backend/src/core/bundles/` - Bundle classification
- `/app/backend/tsconfig.json` - Excludes placeholder `actors` module

## Known Issues
1. Supervisor runs Python backend; TS backend requires manual start for testing
2. Placeholder modules (actors, entities, wallets) need implementation
3. WebSocket `socket.on is not a function` error (deferred)

## API Endpoints
- `GET /api/signals/latest` - Latest signals with filters
- `GET /api/signals/stats` - Signal statistics
- `GET /api/signals/address/:addr` - Signals for address
- `GET /api/signals/corridor/:from/:to` - Signals for corridor
- `POST /api/signals/:id/acknowledge` - Acknowledge signal
