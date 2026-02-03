# AlgoTrader - Library: Risk Math

**Version:** 1.0.0  
**Created:** 2026-02-03  
**Author:** OpenClaw v2.0 (Senior Algorithmic Architect)  
**Classification:** CORE DOCTRINE

---

## 🎯 Risk Mathematics Doctrine

Quantitative trading is as much about risk management as it is about finding alpha. The following mathematical principles are non-negotiable.

---

## 1️⃣ Kelly Criterion (Position Sizing)

### Formula

$$f^* = \frac{p(b+1) - 1}{b} = \frac{p}{q} - \frac{1-p}{b}$$

Where:
- $f^*$ = Fraction of bankroll to wager
- $p$ = Probability of winning
- $q = 1-p$ = Probability of losing
- $b$ = Net odds received on the wager (win/loss ratio)

### Simplified Form for Trading

$$f = \frac{win\_rate}{avg\_loss} - \frac{loss\_rate}{avg\_win}$$

### Half-Kelly Rule

**Never use full Kelly.** Use fractional Kelly (typically 0.25-0.5) for:

| Fraction | Volatility | Growth | Drawdown Risk |
|----------|------------|--------|---------------|
| Full Kelly | Maximum | Optimal | Extreme |
| ½ Kelly | High | 75% of optimal | Moderate |
| ¼ Kelly | Moderate | 56% of optimal | Low |
| ⅛ Kelly | Low | 42% of optimal | Minimal |

### Application in AlgoTrader

```python
# Kelly-based position sizing
def kelly_position(win_rate, avg_win, avg_loss, fraction=0.25):
    if avg_loss == 0:
        return 0.0
    
    kelly = (win_rate / avg_loss) - ((1 - win_rate) / avg_win)
    return max(0, kelly * fraction)  # Never leverage
```

### Constraints

- **Maximum Kelly exposure:** 2% of portfolio per trade
- **Minimum Kelly exposure:** 0.5% (below threshold, skip trade)
- **Stop using:** If Kelly < 0 (negative expectancy)

---

## 2️⃣ Sharpe Ratio vs. Sortino Ratio

### Sharpe Ratio

$$Sharpe = \frac{R_p - R_f}{\sigma_p}$$

| Metric | Value |
|--------|-------|
| $R_p$ | Portfolio return |
| $R_f$ | Risk-free rate (assume 0 for intraday) |
| $\sigma_p$ | Standard deviation of returns |

**Interpretation:**
- < 0.5: Poor
- 0.5 - 1.0: Acceptable
- 1.0 - 2.0: Good
- > 2.0: Excellent

### Sortino Ratio

$$Sortino = \frac{R_p - R_f}{\sigma_d}$$

Where $\sigma_d$ = **Downside deviation only** (volatility of negative returns)

### Why Sortino > Sharpe for Trading

| Scenario | Sharpe Behavior | Sortino Behavior |
|----------|-----------------|------------------|
| Big winners | Increases (may overstate) | Ignores (correct) |
| Big losers | Penalizes (correct) | Penalizes (correct) |
| Strategy focus | Total risk | Downside risk |

### AlgoTrader Targets

| Metric | Target | Minimum |
|--------|--------|---------|
| **Sharpe Ratio** | > 1.5 | > 1.0 |
| **Sortino Ratio** | > 2.0 | > 1.5 |
| **Win Rate** | > 55% | > 50% |
| **Profit Factor** | > 1.5 | > 1.2 |

---

## 3️⃣ Maximum Drawdown (MDD) Limits

### Definition

$$MDD = \frac{Peak - Trough}{Peak}$$

The largest peak-to-valley decline in portfolio value.

### Drawdown Tiers

| Tier | Drawdown | Action |
|------|----------|--------|
| GREEN | 0 - 1.0% | Normal operation |
| YELLOW | 1.0 - 2.0% | Reduce size by 50% |
| ORANGE | 2.0 - 2.5% | Reduce size by 75% |
| RED | 2.5 - 3.0% | Stop opening new positions |
| KILL | > 3.0% | HALT ALL TRADING |

### Time-Based Drawdown Limits

| Period | Maximum Drawdown |
|--------|------------------|
| Daily | 3.0% |
| Weekly | 5.0% |
| Monthly | 8.0% |
| Quarterly | 12.0% |

### Recovery from Drawdown

$$T = \frac{D}{1-D}$$

Where $T$ = % gain needed to recover from drawdown $D$

| Drawdown | Recovery Needed |
|----------|-----------------|
| 10% | 11.1% |
| 20% | 25.0% |
| 30% | 42.9% |
| 50% | 100.0% |

---

## 4️⃣ Stop Loss Rule

### 🔴 CRITICAL: Stop Loss at -2% from Entry

**Non-negotiable rule.** Every trade must have a stop loss at **-2%** from entry price.

### Stop Loss Implementation

| Condition | Stop Level |
|-----------|------------|
| **Entry Price** | $P_{entry}$ |
| **Long Stop** | $P_{entry} \times (1 - 0.02)$ |
| **Short Stop** | $P_{entry} \times (1 + 0.02)$ |

### Stop Loss Types

| Type | Description | Use Case |
|------|-------------|----------|
| **Hard Stop** | Fixed -2% from entry | Always required |
| **Trailing Stop** | Moves with price | Optional: lock in gains |
| **Time Stop** | Exit after N minutes | Intraday constraint |

### Stop Loss Example

```python
def calculate_stops(self, entry_price, direction):
    if direction == "LONG":
        stop_loss = entry_price * 0.98
        take_profit = entry_price * 1.03  # 3:1 reward:risk
    else:  # SHORT
        stop_loss = entry_price * 1.02
        take_profit = entry_price * 0.97
    
    return {
        "stop_loss": stop_loss,
        "take_profit": take_profit,
        "risk_reward": 1.5  # Minimum 1.5:1
    }
```

### Why -2%?

| Factor | Rationale |
|--------|-----------|
| **Daily Limit** | 3 trades at -2% = 6% max daily loss |
| **Kelly Constraints** | Aligns with position sizing math |
| **Recovery Feasibility** | 2% loss requires 2.04% gain to recover |
| **Psychological** | Large enough to survive noise, small enough to limit damage |

---

## 📊 Risk Dashboard Formula Sheet

| Metric | Formula | Target |
|--------|---------|--------|
| **Expectancy** | $(p \times avg\_win) - ((1-p) \times avg\_loss)$ | > 0 |
| **Profit Factor** | $gross\_profits / gross\_losses$ | > 1.5 |
| **Win Rate** | $wins / total\_trades$ | > 55% |
| **Avg Trade** | $net\_profit / total\_trades$ | > 0 |
| **MDD Recovery** | $D / (1-D)$ | Track only |
| **Kelly %** | $(p/q) - (1-p)/R$ | < 2% |

---

## 🔗 Related Protocols

- `library/strategies.md` — Mean reversion, momentum, pairs
- `library/pitfalls.md` — Common analysis errors
- `risk-protocols.md` — Implementation rules
- `context.md` — Strategy parameters

---

## 🚦 STATUS LOG

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-02-03 | 1.0.0 | Risk math doctrine defined | OpenClaw v2.0 |
