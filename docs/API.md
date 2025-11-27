# Quantum Falcon API Documentation

## Overview

Quantum Falcon provides a comprehensive API for trading operations, strategy management, and user authentication.

**Base URL**: `https://api.quantumfalcon.io/v1` (Production)
**Authentication**: Bearer token in `Authorization` header

---

## Authentication

### License Validation

```http
POST /api/license/validate
Content-Type: application/json
Authorization: Bearer {license_key}

{
  "key": "QF-XXXXX-XXXXX-XXXXX"
}
```

**Response (200 OK)**:
```json
{
  "valid": true,
  "tier": "pro",
  "userId": "usr_abc123",
  "expiresAt": 1735689600000,
  "features": ["live-trading", "advanced-analytics", "3-agents"]
}
```

**Response (401 Unauthorized)**:
```json
{
  "error": "Invalid license key",
  "code": "LICENSE_INVALID"
}
```

---

## Trading Endpoints

### Get Market Data

```http
GET /api/market/snapshot
Authorization: Bearer {token}
```

**Response**:
```json
{
  "orderbook": {
    "bestBid": 95234.50,
    "bestAsk": 95235.00,
    "mid": 95234.75,
    "spreadBps": 5.2,
    "volatility1h": 2.3
  },
  "sentiment": {
    "score": 0.72,
    "label": "Bullish"
  },
  "whales": [
    { "type": "buy", "amount": 15000, "wallet": "0x..." }
  ],
  "timestamp": 1732698000000
}
```

### Execute Trade

```http
POST /api/trade/execute
Authorization: Bearer {token}
Content-Type: application/json

{
  "pair": "SOL/USDC",
  "side": "buy",
  "amount": 100,
  "type": "market",
  "slippageBps": 50,
  "agentId": "whale-shadow"
}
```

**Response (200 OK)**:
```json
{
  "txId": "5KtP...",
  "status": "confirmed",
  "executedPrice": 95.234,
  "executedAmount": 100,
  "fee": 0.25,
  "timestamp": 1732698000000
}
```

---

## Strategy Endpoints

### List Strategies

```http
GET /api/strategies
Authorization: Bearer {token}
```

**Response**:
```json
{
  "strategies": [
    {
      "id": "dca-basic",
      "name": "DCA Basic",
      "tier": "free",
      "status": "active",
      "performance": {
        "roi": 15.4,
        "winRate": 68.2,
        "trades": 142
      }
    }
  ]
}
```

### Create Strategy

```http
POST /api/strategies
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "My Custom Strategy",
  "code": "// Strategy code...",
  "parameters": {
    "riskLevel": "medium",
    "maxPosition": 1000
  }
}
```

### Run Backtest

```http
POST /api/strategies/{id}/backtest
Authorization: Bearer {token}
Content-Type: application/json

{
  "startDate": "2024-01-01",
  "endDate": "2024-12-01",
  "initialCapital": 10000
}
```

**Response**:
```json
{
  "roi": 147.3,
  "winRate": 72.1,
  "sharpeRatio": 2.34,
  "maxDrawdown": 12.5,
  "trades": 234,
  "profitFactor": 2.1
}
```

---

## Agent Endpoints

### List Available Agents

```http
GET /api/agents
Authorization: Bearer {token}
```

**Response**:
```json
{
  "agents": [
    {
      "id": "whale-shadow",
      "name": "Whale Shadow",
      "tier": "pro",
      "description": "Mirrors top 100 whale wallets",
      "status": "available"
    }
  ],
  "activeCount": 2,
  "maxAllowed": 3
}
```

### Activate Agent

```http
POST /api/agents/{id}/activate
Authorization: Bearer {token}
Content-Type: application/json

{
  "config": {
    "aggressiveness": 0.7,
    "maxTradeSize": 500
  }
}
```

---

## Quest Endpoints

### Get Weekly Quests

```http
GET /api/quests/weekly
Authorization: Bearer {token}
```

**Response**:
```json
{
  "weekNumber": 48,
  "quests": [
    {
      "id": "trading-001",
      "title": "First Blood",
      "description": "Execute your first trade",
      "category": "Trading",
      "xpReward": 100,
      "nftReward": null,
      "progress": 0,
      "goal": 1,
      "status": "active"
    }
  ]
}
```

### Complete Quest

```http
POST /api/quests/{id}/complete
Authorization: Bearer {token}
```

---

## NFT Endpoints

### Mint Achievement NFT

```http
POST /api/nft/mint
Authorization: Bearer {token}
Content-Type: application/json

{
  "questId": "milestone-first-1000",
  "walletAddress": "ABC123..."
}
```

**Response**:
```json
{
  "mintAddress": "NFT123...",
  "metadataUri": "https://arweave.net/...",
  "rarity": "Epic",
  "edition": 42,
  "maxEdition": 100
}
```

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/market/*` | 60 req | 1 min |
| `/api/trade/*` | 30 req | 1 min |
| `/api/strategies/*` | 20 req | 1 min |
| `/api/nft/mint` | 5 req | 1 min |

---

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Missing authentication |
| `LICENSE_INVALID` | Invalid license key |
| `LICENSE_EXPIRED` | License has expired |
| `TIER_INSUFFICIENT` | Feature requires higher tier |
| `RATE_LIMITED` | Too many requests |
| `TRADE_FAILED` | Trade execution failed |
| `INSUFFICIENT_BALANCE` | Not enough funds |

---

## WebSocket API

### Connect

```javascript
const ws = new WebSocket('wss://api.quantumfalcon.io/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    channels: ['market', 'trades', 'alerts']
  }));
};
```

### Message Types

```json
// Market update
{
  "type": "market",
  "data": { "price": 95234.50, "change1h": 2.3 }
}

// Trade executed
{
  "type": "trade",
  "data": { "txId": "...", "profit": 150.00 }
}

// Alert
{
  "type": "alert",
  "data": { "message": "Whale detected", "severity": "high" }
}
```

