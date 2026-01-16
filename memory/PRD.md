# BlockView - Product Requirements Document

## Overview

BlockView is an on-chain intelligence platform that transforms raw Ethereum blockchain data into actionable trading insights through behavioral analysis, strategy classification, and smart money tracking.

## Problem Statement

Blockchain data is public but difficult to interpret. Users need to understand:
- Who is accumulating vs distributing
- Which addresses exhibit smart money behavior
- When significant behavioral changes occur
- What trading strategies successful addresses follow

## Solution

A multi-layer data processing pipeline that:
1. Indexes raw ERC-20 transfer events
2. Normalizes and aggregates into corridors
3. Classifies behavioral patterns (bundles)
4. Detects significant state changes (signals)
5. Rates addresses on multiple dimensions (scores)
6. Identifies trading strategies (profiles)

---

## Architecture

```
L1 [Raw]        → ERC-20 Indexer        → erc20_logs
L2 [Normalized] → Build Transfers       → transfers
L3 [Aggregated] → Build Relations       → relations
L4 [Intelligence] → Build Bundles       → bundles
L5 [Events]     → Build Signals         → signals
L6 [Ranking]    → Build Scores          → scores
L7 [Strategy]   → Build Strategy Profiles → strategy_profiles
```

---

## Core Requirements

### Functional Requirements

#### FR-1: ERC-20 Indexing
- Index Transfer events from Ethereum mainnet
- Track sync state for resumability
- Handle RPC rate limits gracefully

#### FR-2: Relations Engine
- Aggregate transfers into corridors (from → to)
- Calculate interaction density
- Support time windows: 1d, 7d, 30d

#### FR-3: Bundle Classification
- Classify relations by behavior type
- Types: accumulation, distribution, flow, wash, rotation
- Calculate confidence and intensity scores

#### FR-4: Signal Detection
- Detect state changes in bundles
- Type-specific deduplication (6h-24h)
- Severity scoring (0-100)

#### FR-5: Scoring Engine
- 5 independent dimensions: Behavior, Intensity, Consistency, Risk, Influence
- Composite score with tier classification
- Windows: 7d, 30d, 90d

#### FR-6: Strategy Profiles
- Classify trading strategies automatically
- Track confidence and stability
- Support 7 strategy types

### Non-Functional Requirements

#### NFR-1: Performance
- Indexer: 30-second intervals
- Score calculation: 90-second intervals
- Strategy classification: 5-minute intervals

#### NFR-2: Scalability
- Batch processing for all jobs
- Indexed queries for all lookups
- Efficient aggregation pipelines

#### NFR-3: Reliability
- Sync state tracking for crash recovery
- Graceful error handling
- Job independence (no cascading failures)

---

## Data Models

### Bundle Types
| Type | Criteria | Use Case |
|------|----------|----------|
| accumulation | High inflow ratio, long hold | Entry signal |
| distribution | High outflow ratio | Exit warning |
| flow | Balanced bidirectional | Liquidity |
| wash | Symmetric patterns | Risk flag |
| rotation | Cyclic movement | Strategy detection |

### Signal Types
| Signal | Trigger | Dedup |
|--------|---------|-------|
| new_corridor | First significant activity | 24h |
| accumulation_start | Bundle → accumulation | 12h |
| distribution_start | Bundle → distribution | 12h |
| wash_detected | Wash pattern confirmed | 24h |
| intensity_spike | +50% intensity | 6h |
| intensity_drop | -40% intensity | 6h |

### Score Dimensions
| Dimension | Weight | Source |
|-----------|--------|--------|
| Behavior | +25% | Bundle ratios |
| Intensity | +25% | Density, volume |
| Consistency | +20% | Active days, noise |
| Risk | -20% | Wash, variance |
| Influence | +20% | Followers |

### Strategy Types
| Strategy | Criteria |
|----------|----------|
| accumulation_sniper | High accumulation, long hold, low wash |
| distribution_whale | High distribution, high influence |
| momentum_rider | Intensity spikes, short hold |
| rotation_trader | Rotation bundles, multi-asset |
| wash_operator | High wash ratio |
| liquidity_farmer | Stable flow, high consistency |
| mixed | No dominant pattern |

---

## API Endpoints

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Service health |
| `/api/transfers` | GET | Transfer history |
| `/api/relations/graph` | GET | Corridor network |
| `/api/bundles/address/:addr` | GET | Address bundles |
| `/api/signals/latest` | GET | Recent signals |
| `/api/scores/address/:addr` | GET | Address score |
| `/api/strategies/address/:addr` | GET | Strategy profile |

### Leaderboard Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/scores/top` | GET | Score leaderboard |
| `/api/strategies/top` | GET | Strategy leaderboard |

---

## Implementation Status

### Completed ✅

- [x] Phase 1.1: ERC-20 Indexer
- [x] Phase 1.2: Normalized Transfers
- [x] Phase 2: Relations Engine
- [x] Phase 3: Bundles (Warhammer Logic)
- [x] Phase 4: Signals (Event Layer)
- [x] Phase 5: Scores (Rating Core)
- [x] Phase 6: Strategy Profiles

### In Progress 🔄

- [ ] Switch supervisor to TypeScript backend

### Planned 📋

- [ ] Phase 7: Copy Signals (Monetization)
- [ ] Phase 8: Market Context Layer
- [ ] WebSocket real-time signals
- [ ] Multi-chain support

---

## Technical Stack

| Component | Technology |
|-----------|------------|
| Backend | TypeScript, Fastify |
| Database | MongoDB, Mongoose |
| Validation | Zod |
| Blockchain | ethers.js, Infura |
| Frontend | React, TailwindCSS |

---

## Success Metrics

1. **Data Quality**: <1% signal false positive rate
2. **Latency**: <2 minute end-to-end pipeline
3. **Coverage**: >90% of active addresses scored
4. **Accuracy**: Strategy classification matches manual review

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| RPC rate limits | Batch requests, exponential backoff |
| MongoDB load | Proper indexing, aggregation optimization |
| Strategy drift | Regular threshold tuning |
| Data staleness | Aggressive job scheduling |

---

## Appendix

### Key Files
- `/app/backend/src/jobs/scheduler.ts` - Job orchestration
- `/app/backend/src/core/` - Domain modules
- `/app/backend/ARCHITECTURE.md` - Technical details
- `/app/backend/API.md` - API reference

### Related Documents
- [CHANGELOG.md](/CHANGELOG.md) - Version history
- [ROADMAP.md](/ROADMAP.md) - Future plans
- [README.md](/README.md) - Quick start guide
