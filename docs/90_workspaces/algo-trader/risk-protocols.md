# AlgoTrader - Risk Protocols

**Version:** 1.0.0  
**Created:** 2026-02-03  
**Author:** OpenClaw v2.0 (Senior Algorithmic Architect)  
**Related:** context.md

---

## 🎯 Risk Management Framework

This document defines the risk limits, drawdown controls, and kill switch mechanisms for the Futures Intraday Mean Reversion strategy.

---

## 📉 Drawdown Limits

### Daily Drawdown

| Tier | Drawdown % | Action |
|------|------------|--------|
| GREEN | 0% - 1.0% | Normal operation |
| YELLOW | 1.0% - 2.0% | Reduce position size by 50% |
| RED | 2.0% - 3.0% | Reduce position size by 75%, increase threshold |
| KILL | > 3.0% | HALT ALL TRADING |

**Definition:** Daily drawdown = (Peak Equity - Current Equity) / Peak Equity

### Session Drawdown

| Tier | Drawdown % | Action |
|------|------------|--------|
| WARNING | 1.5% | Reduce position size by 50% |
| CRITICAL | 2.5% | Stop opening new positions |

### Consecutive Loss Limit

- **5 consecutive losses:** Reduce position size by 50%
- **8 consecutive losses:** Stop trading for 30 minutes
- **10 consecutive losses:** HALT until next session

### Maximum Loss Per Day

- **Hard Limit:** 3.5% of portfolio
- **Action:** Immediate kill switch activation
- **Recovery:** Cannot trade next session

---

## 🛑 Kill Switch

### Level 1: Soft Kill (Session Pause)
**Trigger:** 2.5% daily drawdown or 8 consecutive losses

**Actions:**
- Close all open positions at market
- Cancel all pending orders
- Set `KILL_SWITCH = SOFT`
- Log event with timestamp
- Resume only after 30-minute cooldown

### Level 2: Hard Kill (Season Halt)
**Trigger:** 3.5% daily drawdown or 10 consecutive losses

**Actions:**
- Close all open positions at market
- Cancel all pending orders
- Set `KILL_SWITCH = HARD`
- Disable auto-trading
- Require manual reset by senior trader

### Kill Switch Code Interface

```python
class KillSwitch:
    def __init__(self):
        self.status = "ACTIVE"  # ACTIVE, SOFT, HARD
        self.trigger_count = 0
        self.last_trigger = None
    
    def check(self, portfolio, recent_pnl) -> str:
        # Returns: "CONTINUE", "SOFT_KILL", "HARD_KILL"
        daily_dd = self.calculate_drawdown(portfolio)
        
        if daily_dd > 0.035:
            return "HARD_KILL"
        elif daily_dd > 0.025:
            return "SOFT_KILL"
        return "CONTINUE"
```

---

## 💼 Position Limits

### Maximum Positions

| Condition | Max Concurrent |
|-----------|----------------|
| Normal | 3 |
| Yellow drawdown | 2 |
| Red drawdown | 1 |
| Post-loss cooldown | 0 |

### Position Size Limits

| Market | Max % of Portfolio | Max Contracts (ES) |
|--------|-------------------|-------------------|
| ES | 2.0% | ~5 |
| NQ | 1.5% | ~3 |
| CL | 1.0% | ~2 |
| GC | 1.0% | ~2 |
| DX | 0.5% | ~1 |

### Margin Utilization

- **Max Margin:** 50% of account equity
- **Warning Threshold:** 40%
- **Action:** Reduce position size if approaching

---

## ⚠️ Risk Events

### Auto-Triggered Events

| Event | Condition | Response |
|-------|-----------|----------|
| Connection Lost | Rithmic feed drops | Flatten all positions |
| Latency Spike | Execution latency > 500ms | Switch to paper mode |
| Price Feed Gap | Missing data > 1 minute | Pause trading |
| Exchange Halt | Circuit breaker triggered | Flatten all positions |

### Manual Override

- Senior trader can trigger kill switch at any time
- Emergency contact protocol in place
- Kill switch accessible via Telegram bot

---

## 📊 Monitoring Dashboard

### Real-Time Metrics

```
┌─────────────────────────────────────────────────────────────┐
│  EQUITY: $100,000.00         DRAWDOWN: 1.2%  [YELLOW]      │
│  OPEN POSITIONS: 2           PNL (TODAY): -$420.00         │
│  KILL SWITCH: ACTIVE         SESSION: 10:42 AM CT          │
├─────────────────────────────────────────────────────────────┤
│  ES Position: 2 lots @ 5,840.00  │  NQ Position: 1 lot @   │
│  Unrealized: -$250.00           │  Unrealized: -$170.00    │
└─────────────────────────────────────────────────────────────┘
```

### Alerts

- **Telegram:** Every kill switch trigger
- **Email:** Daily risk summary
- **Dashboard:** Real-time status overlay

---

## 🔄 Recovery Protocol

After Hard Kill:

1. **Immediate:** No trading for minimum 24 hours
2. **Review:** Senior trader analyzes failure
3. **Adjust:** Update parameters if needed
4. **Test:** Paper trade for 1 week
5. **Resume:** Manual authorization required

---

## 📁 Related Protocols

- `context.md` — Strategy objectives and parameters
- `tech-stack.md` — Implementation stack
- `execution.md` — Order handling and execution
- `performance.md` — Performance attribution

---

## 🚦 STATUS LOG

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-02-03 | 1.0.0 | Initial risk protocols | OpenClaw v2.0 |
