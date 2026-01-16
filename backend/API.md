# API Reference

## Base URL

```
https://your-domain.com/api
```

## Authentication

Currently no authentication required. Future versions will implement JWT-based auth.

---

## Health Endpoints

### GET /health

Health check endpoint.

**Response:**
```json
{
  "ok": true,
  "ts": 1705123456789,
  "uptime": 12345.67
}
```

### GET /health/indexer

Detailed indexer status with all job statistics.

**Response:**
```json
{
  "enabled": true,
  "rpcUrl": "[configured]",
  "syncStatus": {
    "syncedBlock": 19234567,
    "latestBlock": 19234580,
    "blocksBehind": 13,
    "totalLogs": 150000
  },
  "buildStatus": {
    "lastProcessedBlock": 19234560,
    "pendingLogs": 500,
    "totalTransfers": 145000
  },
  "relationsStatus": {
    "unprocessedTransfers": 100,
    "totalRelations": 50000,
    "byWindow": { "1d": 10000, "7d": 20000, "30d": 20000 }
  },
  "bundlesStatus": {
    "totalBundles": 45000,
    "byType": { "accumulation": 5000, "distribution": 4000, "wash": 1000 },
    "byWindow": { "1d": 15000, "7d": 15000, "30d": 15000 }
  },
  "signalsStatus": {
    "totalSignals": 3000,
    "last24h": 150,
    "unacknowledged": 50,
    "byType": { "new_corridor": 100, "intensity_spike": 25 }
  },
  "scoresStatus": {
    "totalScores": 10000,
    "byTier": { "green": 500, "yellow": 2000, "orange": 5000, "red": 2500 },
    "avgComposite": 52.3,
    "lastCalculated": "2025-01-16T10:00:00Z"
  },
  "strategyProfilesStatus": {
    "totalProfiles": 8000,
    "byStrategy": { "mixed": 5000, "rotation_trader": 1500 },
    "avgConfidence": 0.45,
    "avgStability": 0.72
  }
}
```

---

## Transfers Endpoints

### GET /transfers

Get transfers for an address.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `address` | string | required | Ethereum address |
| `limit` | number | 50 | Max results |
| `offset` | number | 0 | Pagination offset |

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "...",
      "txHash": "0x...",
      "from": "0x...",
      "to": "0x...",
      "assetType": "erc20",
      "assetAddress": "0x...",
      "amountRaw": "1000000000000000000",
      "timestamp": "2025-01-16T10:00:00Z"
    }
  ]
}
```

---

## Relations Endpoints

### GET /relations/graph

Get relation graph for visualization.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `window` | string | 7d | Time window: 1d, 7d, 30d |
| `minDensity` | number | 0 | Minimum density score |
| `limit` | number | 100 | Max relations |

**Response:**
```json
{
  "ok": true,
  "data": {
    "nodes": [
      { "id": "0x...", "label": "0x..." }
    ],
    "edges": [
      {
        "from": "0x...",
        "to": "0x...",
        "densityScore": 45.5,
        "interactionCount": 12
      }
    ]
  }
}
```

### GET /relations/corridor/:from/:to

Get relation details for a specific corridor.

**Response:**
```json
{
  "ok": true,
  "data": {
    "from": "0x...",
    "to": "0x...",
    "windows": {
      "1d": { "densityScore": 12.5, "interactionCount": 3 },
      "7d": { "densityScore": 35.2, "interactionCount": 15 },
      "30d": { "densityScore": 55.8, "interactionCount": 45 }
    }
  }
}
```

---

## Bundles Endpoints

### GET /bundles/corridor/:from/:to

Get bundle intelligence for a corridor.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `window` | string | 30d | Time window |

**Response:**
```json
{
  "ok": true,
  "data": {
    "from": "0x...",
    "to": "0x...",
    "window": "30d",
    "bundleType": "accumulation",
    "intensityScore": 72.5,
    "confidence": 0.85,
    "netflowRaw": "5000000000000000000000"
  }
}
```

### GET /bundles/address/:address

Get all bundles involving an address.

**Response:**
```json
{
  "ok": true,
  "data": {
    "bundles": [...],
    "summary": {
      "accumulating": 5,
      "distributing": 2,
      "flowing": 3,
      "suspicious": 1
    }
  }
}
```

---

## Signals Endpoints

### GET /signals/latest

Get latest signals with filtering.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 50 | Max results |
| `signalType` | string | - | Filter by type |
| `severity` | string | - | Filter: low, medium, high, critical |
| `minSeverityScore` | number | - | Minimum severity score |
| `window` | string | - | Filter by window |
| `acknowledged` | boolean | - | Filter by acknowledgment |
| `since` | string | - | ISO date filter |

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "id": "...",
      "entityType": "corridor",
      "entityId": "0x...:0x...",
      "signalType": "accumulation_start",
      "prevState": {
        "bundleType": "flow",
        "intensity": 25.0
      },
      "newState": {
        "bundleType": "accumulation",
        "intensity": 65.0
      },
      "confidence": 0.85,
      "severityScore": 72,
      "severity": "high",
      "window": "7d",
      "chain": "ethereum",
      "triggeredAt": "2025-01-16T10:00:00Z",
      "explanation": "Accumulation pattern started (85% confidence)...",
      "relatedAddresses": ["0x...", "0x..."],
      "acknowledged": false
    }
  ]
}
```

### GET /signals/stats

Get signal statistics.

**Response:**
```json
{
  "ok": true,
  "data": {
    "totalSignals": 3000,
    "unacknowledged": 50,
    "byType": {
      "new_corridor": 1500,
      "intensity_spike": 500,
      "wash_detected": 100
    },
    "bySeverity": {
      "low": 500,
      "medium": 1500,
      "high": 800,
      "critical": 200
    },
    "last24h": 150
  }
}
```

### GET /signals/address/:address

Get signals for a specific address.

### GET /signals/corridor/:from/:to

Get signals for a specific corridor.

### POST /signals/:id/acknowledge

Acknowledge a signal.

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "...",
    "acknowledged": true,
    "acknowledgedAt": "2025-01-16T10:00:00Z"
  }
}
```

---

## Scores Endpoints

### GET /scores/address/:address

Get score for an address.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `window` | string | 30d | Time window: 7d, 30d, 90d |

**Response:**
```json
{
  "ok": true,
  "data": {
    "id": "...",
    "subjectType": "address",
    "subjectId": "0x...",
    "window": "30d",
    "behaviorScore": 65.5,
    "intensityScore": 45.2,
    "consistencyScore": 72.0,
    "riskScore": 15.5,
    "influenceScore": 38.0,
    "compositeScore": 58.3,
    "tier": "yellow",
    "breakdown": {
      "accumulationRatio": 0.6,
      "distributionRatio": 0.2,
      "washRatio": 0.05,
      "avgDensity": 32.5,
      "signalCount": 12
    },
    "chain": "ethereum",
    "calculatedAt": "2025-01-16T10:00:00Z"
  }
}
```

### GET /scores/address/:address/all

Get scores for all windows.

### GET /scores/top

Get score leaderboard.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | address | Subject type |
| `sort` | string | composite | Sort: composite, behavior, intensity, consistency, risk, influence |
| `tier` | string | - | Filter by tier |
| `window` | string | 30d | Time window |
| `limit` | number | 50 | Max results |
| `offset` | number | 0 | Pagination |

### GET /scores/watchlist

Get scores for multiple addresses.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `addresses` | string | yes | Comma-separated addresses |
| `window` | string | no | Time window |

### GET /scores/stats

Get score statistics.

---

## Strategy Profiles Endpoints

### GET /strategies/top

Get top strategy profiles.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | - | Filter by strategy type |
| `riskLevel` | string | - | Filter: low, medium, high |
| `influenceLevel` | string | - | Filter: low, medium, high |
| `minConfidence` | number | - | Minimum confidence (0-1) |
| `sort` | string | confidence | Sort: confidence, stability, influence, risk, recent |
| `limit` | number | 50 | Max results |
| `offset` | number | 0 | Pagination |

**Response:**
```json
{
  "ok": true,
  "data": {
    "profiles": [
      {
        "id": "...",
        "address": "0x...",
        "chain": "ethereum",
        "strategyType": "accumulation_sniper",
        "strategyName": "Accumulation Sniper",
        "strategyDescription": "Early entry specialist...",
        "secondaryStrategy": "rotation_trader",
        "confidence": 0.75,
        "stability": 0.82,
        "riskLevel": "low",
        "influenceLevel": "medium",
        "avgHoldingTimeHours": 168,
        "preferredWindow": "7d",
        "preferredAssets": ["0x...", "0x..."],
        "performanceProxy": {
          "consistencyScore": 72.0,
          "intensityScore": 45.2,
          "behaviorScore": 65.5,
          "washRatio": 0.02,
          "avgDensity": 32.5
        },
        "bundleBreakdown": {
          "accumulationRatio": 0.7,
          "distributionRatio": 0.1,
          "rotationRatio": 0.1,
          "washRatio": 0.02,
          "flowRatio": 0.08
        },
        "previousStrategy": null,
        "strategyChangesLast30d": 0,
        "detectedAt": "2025-01-16T10:00:00Z"
      }
    ],
    "total": 100
  }
}
```

### GET /strategies/address/:address

Get strategy profile for an address.

### GET /strategies/type/:strategyType

Get profiles by strategy type.

**Valid strategy types:**
- `accumulation_sniper`
- `distribution_whale`
- `momentum_rider`
- `rotation_trader`
- `wash_operator`
- `liquidity_farmer`
- `mixed`

### GET /strategies/types

Get all strategy types with descriptions.

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "type": "accumulation_sniper",
      "name": "Accumulation Sniper",
      "description": "Early entry specialist with long holding periods..."
    }
  ]
}
```

### GET /strategies/stats

Get strategy statistics.

**Response:**
```json
{
  "ok": true,
  "data": {
    "totalProfiles": 8000,
    "byStrategy": {
      "accumulation_sniper": { "count": 500, "name": "Accumulation Sniper" },
      "distribution_whale": { "count": 300, "name": "Distribution Whale" },
      "mixed": { "count": 5000, "name": "Mixed Strategy" }
    },
    "byRiskLevel": {
      "low": 2000,
      "medium": 4000,
      "high": 2000
    },
    "byInfluenceLevel": {
      "low": 3000,
      "medium": 4000,
      "high": 1000
    },
    "avgConfidence": 0.45,
    "avgStability": 0.72
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "ok": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `NOT_FOUND` | 404 | Resource not found |
| `INTERNAL_ERROR` | 500 | Server error |
