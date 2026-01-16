# 🔗 BlockView — On-Chain Intelligence Platform

> Real-time Ethereum blockchain analytics with behavioral classification, strategy detection, and smart money tracking.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=flat&logo=fastify&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)

## 📋 Overview

BlockView is a sophisticated on-chain intelligence platform that transforms raw Ethereum blockchain data into actionable insights. The platform analyzes ERC-20 transfer patterns to identify trading strategies, detect wash trading, and classify behavioral patterns of blockchain addresses.

### Key Features

- **🔍 ERC-20 Indexer** — Real-time indexing of Transfer events from Ethereum
- **📊 Relations Engine** — Corridor detection and interaction density analysis
- **🎯 Bundle Classification** — Behavioral classification (accumulation, distribution, wash, rotation)
- **🔔 Signals System** — Event-driven alerts on state changes
- **⭐ Scoring Engine** — Multi-dimensional rating (behavior, intensity, consistency, risk, influence)
- **🧠 Strategy Profiles** — Automated trading strategy classification

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA PIPELINE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  L1 [Raw]        ──►  ERC-20 Indexer (Infura RPC)                       │
│                       └── erc20_logs collection                          │
│                                                                          │
│  L2 [Normalized] ──►  Build Transfers Job                               │
│                       └── transfers collection                           │
│                                                                          │
│  L3 [Aggregated] ──►  Build Relations Job                               │
│                       └── relations collection (corridors, density)      │
│                                                                          │
│  L4 [Intelligence] ──► Build Bundles Job                                │
│                        └── bundles collection (accumulation, wash, etc.) │
│                                                                          │
│  L5 [Events]     ──►  Build Signals Job                                 │
│                       └── signals collection (state changes)             │
│                                                                          │
│  L6 [Ranking]    ──►  Build Scores Job                                  │
│                       └── scores collection (5 dimensions)               │
│                                                                          │
│  L7 [Strategy]   ──►  Build Strategy Profiles Job                       │
│                       └── strategy_profiles collection                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6+
- Infura API Key (for Ethereum RPC)

### Installation

```bash
# Clone repository
git clone https://github.com/your-repo/blockview.git
cd blockview

# Install backend dependencies
cd backend
yarn install

# Configure environment
cp .env.example .env
# Edit .env with your INFURA_RPC_URL and MONGO_URL

# Build TypeScript
yarn build

# Start development server
yarn dev
```

### Environment Variables

```env
# Backend (.env)
MONGO_URL=mongodb://localhost:27017/blockview
DB_NAME=blockview
INFURA_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
INDEXER_ENABLED=true
INDEXER_INTERVAL_MS=30000
```

## 📁 Project Structure

```
/app
├── backend/
│   ├── src/
│   │   ├── api/                    # API routes registration
│   │   │   ├── routes.ts           # Main router
│   │   │   └── health.routes.ts    # Health check endpoints
│   │   │
│   │   ├── config/                 # Configuration
│   │   │   ├── env.ts              # Environment variables
│   │   │   └── logger.ts           # Logger configuration
│   │   │
│   │   ├── core/                   # Domain modules
│   │   │   ├── bundles/            # L4 - Behavioral classification
│   │   │   ├── relations/          # L3 - Corridor aggregation
│   │   │   ├── scores/             # L6 - Rating engine
│   │   │   ├── signals/            # L5 - Event detection
│   │   │   ├── strategies/         # L7 - Strategy classification
│   │   │   └── transfers/          # L2 - Normalized transfers
│   │   │
│   │   ├── db/                     # Database connection
│   │   │   └── mongoose.ts         # MongoDB setup
│   │   │
│   │   ├── jobs/                   # Background jobs
│   │   │   ├── scheduler.ts        # Job orchestration
│   │   │   ├── build_transfers.job.ts
│   │   │   ├── build_relations.job.ts
│   │   │   ├── build_bundles.job.ts
│   │   │   ├── build_signals.job.ts
│   │   │   ├── build_scores.job.ts
│   │   │   └── build_strategy_profiles.job.ts
│   │   │
│   │   ├── onchain/                # Blockchain interaction
│   │   │   └── ethereum/           # Ethereum-specific
│   │   │       ├── erc20.indexer.ts
│   │   │       ├── rpc.client.ts
│   │   │       └── sync_state.model.ts
│   │   │
│   │   ├── plugins/                # Fastify plugins
│   │   │   ├── auth.ts
│   │   │   └── zod.ts
│   │   │
│   │   ├── app.ts                  # Fastify app builder
│   │   └── server.ts               # Server entry point
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                       # React frontend
│   └── src/
│
└── memory/
    └── PRD.md                      # Product requirements
```

## 📊 Data Models

### Bundle Types (L4)
| Type | Description |
|------|-------------|
| `accumulation` | Buying/collecting pattern |
| `distribution` | Selling/dispersing pattern |
| `flow` | Balanced bidirectional movement |
| `wash` | Suspicious symmetric activity |
| `rotation` | Cyclic movement pattern |

### Signal Types (L5)
| Signal | Description | Dedup |
|--------|-------------|-------|
| `new_corridor` | First significant activity between addresses | 24h |
| `accumulation_start` | Accumulation pattern started | 12h |
| `distribution_start` | Distribution pattern started | 12h |
| `wash_detected` | Wash trading detected | 24h |
| `intensity_spike` | Sudden activity increase | 6h |
| `intensity_drop` | Significant activity decrease | 6h |
| `bundle_change` | Bundle type changed | 12h |
| `rotation_shift` | Rotation pattern changed | 12h |

### Score Dimensions (L6)
| Score | Description | Weight |
|-------|-------------|--------|
| Behavior | Accumulation/distribution ratios | 25% |
| Intensity | Activity volume and density | 25% |
| Consistency | Regularity of behavior | 20% |
| Risk | Wash trading, reversals, variance | -20% |
| Influence | Follower count, front-run ratio | 20% |

**Composite Score Formula:**
```
Composite = BS×0.25 + IS×0.25 + CS×0.20 + INF×0.20 - RS×0.20
```

**Tier System:**
- 🟢 Green: 80-100 (Strong/Smart)
- 🟡 Yellow: 60-79 (Moderate)
- 🟠 Orange: 40-59 (Weak)
- 🔴 Red: 0-39 (Risky/Noise)

### Strategy Types (L7)
| Strategy | Description |
|----------|-------------|
| `accumulation_sniper` | Early entry specialist, long holding periods |
| `distribution_whale` | Large-scale distributor, high influence |
| `momentum_rider` | Short-term, capitalizes on intensity spikes |
| `rotation_trader` | Multi-asset cycler, consistent rotation |
| `wash_operator` | Suspicious symmetric activity |
| `liquidity_farmer` | Stable flow, LP patterns |
| `mixed` | No dominant strategy detected |

## 🔌 API Endpoints

### Health
```
GET /api/health                    # Service health check
GET /api/health/indexer            # Indexer status with all job stats
```

### Transfers (L2)
```
GET /api/transfers?address=0x...   # Get transfers for address
GET /api/transfers/stats           # Transfer statistics
```

### Relations (L3)
```
GET /api/relations/graph?window=7d # Get relation graph
GET /api/relations/corridor/:from/:to
```

### Bundles (L4)
```
GET /api/bundles/corridor/:from/:to
GET /api/bundles/address/:address
GET /api/bundles/stats
```

### Signals (L5)
```
GET /api/signals/latest            # Latest signals (filterable)
GET /api/signals/stats             # Signal statistics
GET /api/signals/address/:address  # Signals for address
GET /api/signals/corridor/:from/:to
POST /api/signals/:id/acknowledge
```

### Scores (L6)
```
GET /api/scores/address/:address   # Score for address
GET /api/scores/address/:address/all  # All window scores
GET /api/scores/top                # Leaderboard
GET /api/scores/watchlist?addresses=0x...,0x...
GET /api/scores/stats
```

### Strategy Profiles (L7)
```
GET /api/strategies/top            # Top profiles by confidence
GET /api/strategies/address/:address
GET /api/strategies/type/:strategyType
GET /api/strategies/types          # All strategy types
GET /api/strategies/stats
```

## ⚡ Background Jobs

| Job | Interval | Description |
|-----|----------|-------------|
| `erc20-indexer` | 30s | Fetches Transfer events from Ethereum |
| `build-transfers` | 35s | Normalizes raw logs to transfers |
| `build-relations` | 40s | Aggregates transfers to corridors |
| `build-bundles` | 50s | Classifies relations into bundles |
| `build-signals` | 60s | Detects state changes |
| `build-scores` | 90s | Calculates multi-dimensional scores |
| `build-strategy-profiles` | 5min | Classifies trading strategies |

## 🛠️ Development

### Build
```bash
cd backend
yarn build
```

### Run Development
```bash
yarn dev
```

### Run Production
```bash
yarn start
```

### Type Checking
```bash
yarn build --noEmit
```

## 📈 Roadmap

### Completed ✅
- [x] Phase 1: ERC-20 Indexer
- [x] Phase 2: Relations Engine
- [x] Phase 3: Bundles (Warhammer Logic)
- [x] Phase 4: Signals (Event Layer)
- [x] Phase 5: Scores (Rating Core)
- [x] Phase 6: Strategy Profiles

### Upcoming 🔜
- [ ] Phase 7: Copy Signals (Monetization)
- [ ] Phase 8: Market Context Layer
- [ ] Actors Module (whale tracking)
- [ ] WebSocket real-time signals
- [ ] Native ETH indexing

## 📄 License

MIT

---

Built with ❤️ for on-chain intelligence
