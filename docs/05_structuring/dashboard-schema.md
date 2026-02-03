# Mission Control Dashboard - JSON Schema

**Version:** 1.0.0  
**Created:** 2026-02-03  
**Author:** OpenClaw v2.0  
**Status:** ACTIVE

---

## 📊 Signal Data Schema

All real-time signals follow this JSON structure:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Live Trading Signal",
  "type": "object",
  "properties": {
    "signal_id": {
      "type": "string",
      "description": "Unique identifier for this signal"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp of signal generation"
    },
    "symbol": {
      "type": "string",
      "description": "Trading symbol (e.g., @ES, @NQ)"
    },
    "contract": {
      "type": "string",
      "description": "Full contract identifier (e.g., ESH6)"
    },
    "price_data": {
      "type": "object",
      "properties": {
        "bid": {"type": "number"},
        "ask": {"type": "number"},
        "last": {"type": "number"},
        "volume": {"type": "integer"},
        "open_interest": {"type": "integer"}
      },
      "required": ["last", "bid", "ask"]
    },
    "bollinger_bands": {
      "type": "object",
      "properties": {
        "upper": {"type": "number"},
        "middle": {"type": "number"},
        "lower": {"type": "number"},
        "period": {"type": "integer"},
        "std_dev": {"type": "number"},
        "z_score": {"type": "number"}
      },
      "required": ["middle", "upper", "lower"]
    },
    "confidence": {
      "type": "object",
      "description": "Live confidence score based on Bollinger Band position",
      "properties": {
        "score": {
          "type": "number",
          "minimum": 0,
          "maximum": 100,
          "description": "Confidence score 0-100"
        },
        "signal": {
          "type": "string",
          "enum": ["BUY", "SELL", "HOLD"],
          "description": "Recommended action"
        },
        "distance_to_band": {
          "type": "number",
          "description": "Price distance to nearest band as percentage"
        },
        "volatility_regime": {
          "type": "string",
          "enum": ["LOW", "NORMAL", "HIGH"],
          "description": "Current market volatility regime"
        }
      },
      "required": ["score", "signal"]
    },
    "trade_id": {
      "type": "string",
      "description": "Unique trade identifier for this signal"
    },
    "status": {
      "type": "string",
      "enum": ["PENDING", "EXECUTED", "CANCELLED", "FILLED"],
      "description": "Signal status"
    },
    "risk_metrics": {
      "type": "object",
      "properties": {
        "stop_loss": {"type": "number"},
        "take_profit": {"type": "number"},
        "risk_reward_ratio": {"type": "number"},
        "position_size": {"type": "number"}
      }
    },
    "connection_health": {
      "type": "object",
      "properties": {
        "websocket_connected": {"type": "boolean"},
        "last_heartbeat": {"type": "string", "format": "date-time"},
        "latency_ms": {"type": "number"},
        "data_quality": {"type": "string", "enum": ["EXCELLENT", "GOOD", "FAIR", "POOR"]}
      }
    }
  },
  "required": ["signal_id", "timestamp", "symbol", "price_data", "confidence", "trade_id"]
}
```

---

## 📈 Dashboard Metrics Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Dashboard Metrics",
  "type": "object",
  "properties": {
    "session_stats": {
      "type": "object",
      "properties": {
        "signals_generated": {"type": "integer"},
        "signals_executed": {"type": "integer"},
        "win_rate": {"type": "number"},
        "profit_factor": {"type": "number"},
        "total_pnl": {"type": "number"},
        "max_drawdown": {"type": "number"},
        "avg_trade_duration_min": {"type": "number"}
      }
    },
    "connection_status": {
      "type": "object",
      "properties": {
        "status": {"type": "string", "enum": ["CONNECTED", "DISCONNECTED", "RECONNECTING"]},
        "uptime_seconds": {"type": "integer"},
        "messages_received": {"type": "integer"},
        "error_count": {"type": "integer"}
      }
    },
    "active_positions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "symbol": {"type": "string"},
          "direction": {"type": "string", "enum": ["LONG", "SHORT"]},
          "entry_price": {"type": "number"},
          "current_pnl": {"type": "number"},
          "stop_loss": {"type": "number"},
          "time_in_trade": {"type": "integer"}
        }
      }
    }
  }
}
```

---

## 🎨 Signal Confidence Calculation

### Confidence Score Formula

```
confidence = base_confidence + volatility_bonus - distance_penalty
```

| Component | Calculation |
|-----------|-------------|
| **base_confidence** | 50 (starting point) |
| **volatility_bonus** | (ATR / price) * 1000 (normalized) |
| **distance_penalty** | abs(z_score) * 10 |

### Confidence Thresholds

| Score Range | Signal | Action |
|-------------|--------|--------|
| 0-30 | STRONG_SELL | Short opportunity |
| 30-45 | WEAK_SELL | Caution |
| 45-55 | HOLD | Neutral |
| 55-70 | WEAK_BUY | Caution |
| 70-100 | STRONG_BUY | Long opportunity |

---

## 📋 Example Signal Output

```json
{
  "signal_id": "sig-20260203-171245-001",
  "timestamp": "2026-02-03T17:12:45.000Z",
  "symbol": "@ES",
  "contract": "ESH6",
  "price_data": {
    "bid": 5842.25,
    "ask": 5842.75,
    "last": 5842.50,
    "volume": 125000,
    "open_interest": 450000
  },
  "bollinger_bands": {
    "upper": 5850.00,
    "middle": 5840.00,
    "lower": 5830.00,
    "period": 20,
    "std_dev": 2.0,
    "z_score": 0.25
  },
  "confidence": {
    "score": 62.5,
    "signal": "WEAK_BUY",
    "distance_to_band": 1.04,
    "volatility_regime": "NORMAL"
  },
  "trade_id": "trade-ESH6-20260203-171245-001",
  "status": "PENDING",
  "risk_metrics": {
    "stop_loss": 5773.25,
    "take_profit": 5900.00,
    "risk_reward_ratio": 2.0,
    "position_size": 2
  },
  "connection_health": {
    "websocket_connected": true,
    "last_heartbeat": "2026-02-03T17:12:44.500Z",
    "latency_ms": 45,
    "data_quality": "EXCELLENT"
  }
}
```

---

## 🔗 Related Protocols

- `data_bridge.py` — Real-time data ingestion script
- `OpenClawFuturesBot.py` — QuantConnect algorithm
- `risk-protocols.md` — Risk management rules

---

## 🚦 STATUS LOG

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-02-03 | 1.0.0 | Schema created | OpenClaw v2.0 |
