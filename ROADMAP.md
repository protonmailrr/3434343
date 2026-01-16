# Roadmap

## Current Status: Phase 6 Complete ✅

The backend data pipeline is fully operational with 7 processing layers.

---

## Completed Phases

### ✅ Phase 1: Foundation (ERC-20 Indexer)
- Real-time Transfer event indexing
- Normalized transfers layer
- Sync state management

### ✅ Phase 2: Relations Engine
- Corridor detection (from → to pairs)
- Interaction density calculation
- Multi-window support (1d/7d/30d)

### ✅ Phase 3: Bundles (Warhammer Logic)
- Behavioral classification
- Types: accumulation, distribution, flow, wash, rotation
- Intensity scoring

### ✅ Phase 4: Signals (Event Layer)
- State change detection
- 11 signal types
- Type-specific deduplication
- Severity scoring

### ✅ Phase 5: Scores (Rating Core)
- 5 score dimensions
- Composite formula
- Tier system (green/yellow/orange/red)

### ✅ Phase 6: Strategy Profiles
- 7 strategy types
- Confidence & stability metrics
- Automated classification

---

## Upcoming Phases

### 🔜 Phase 7: Copy Signals (Monetization Core)

**Goal**: Transform signals into actionable copy-trading intelligence

**Features**:
- "Accumulation started by top-5 influence actor"
- "Rotation detected BEFORE market"
- "Distribution by whale detected → avoid/short"

**Implementation**:
- `copy_signals.model.ts` - Enhanced signal with actor context
- Integration with Strategy Profiles
- Pro subscription tier support

**Priority**: P1

---

### 🔜 Phase 8: Market Context Layer

**Goal**: Answer "Is this smart behavior or just market movement?"

**Features**:
- Market regime detection (risk-on/risk-off)
- BTC/ETH correlation
- Context-adjusted scores

**Implementation**:
- External price feed integration
- Regime classification logic
- Score adjustment factors

**Priority**: P2

---

## Future Enhancements

### Actors Module
- Whale tracking
- Named entity recognition
- Influence network mapping

### WebSocket Real-time
- Push notifications for signals
- Live score updates
- Real-time graph changes

### Native ETH Indexing
- Expand beyond ERC-20
- ETH transfer tracking
- Gas analysis

### Multi-Chain Support
- Base
- Arbitrum
- Optimism
- Polygon

---

## Non-Goals (What We're NOT Building)

❌ **PnL / Portfolio Valuation**
- Requires price feeds and position tracking
- Different product scope

❌ **ML / Prediction**
- Current approach is rule-based classification
- ML may be added later with sufficient data

❌ **Social / Twitter Linking**
- Out of scope for on-chain intelligence
- Privacy considerations

❌ **UI Improvements Before Logic**
- Backend > Frontend priority
- Data quality first

---

## Architecture Principles

1. **Event-Driven**: Signals on changes, not states
2. **Multi-Window**: All metrics support time windows
3. **Deduplication**: Type-specific intervals prevent spam
4. **Composable**: Each layer builds on previous
5. **API-First**: Clean REST endpoints for all data

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
