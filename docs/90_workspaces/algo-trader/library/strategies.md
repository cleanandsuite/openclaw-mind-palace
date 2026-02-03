# AlgoTrader - Library: Strategies

**Version:** 1.0.0  
**Created:** 2026-02-03  
**Author:** OpenClaw v2.0 (Senior Algorithmic Architect)  
**Classification:** CORE DOCTRINE

---

## 📚 Foundational Strategy Classes

Quantitative trading is built on two opposing philosophies. Each has theoretical merit, empirical support, and distinct risk profiles.

---

## 1️⃣ Mean Reversion

**Philosophy:** Price deviates from intrinsic value and tends to return. Buy low, sell high.

### Core Assumption

Assets that have moved significantly from their recent average will revert. The "mean" is typically calculated as a moving average (SMA, EMA, VWAP) or statistical measure (z-score from mean).

### Characteristics

| Attribute | Value |
|-----------|-------|
| **Win Rate** | Higher (60-70%) |
| **Average Win/Loss** | Small wins, larger occasional losses |
| **Expectation** | Positive in mean-reverting markets |
| **Time Horizon** | Intraday to swing |
| **Capital Required** | Lower (per trade) |

### Implementation Examples

| Approach | Indicator | Threshold |
|----------|-----------|-----------|
| Z-Score | Price vs. Rolling Mean | ±2.0 SD |
| RSI | 14-period | < 30 (buy), > 70 (sell) |
| Bollinger Bands | Price vs. Bands | Touch lower (buy), upper (sell) |
| Pairs | Spread deviation | Z-score > 2.0 |

### When It Works Best

- Range-bound markets
- High-liquidity instruments
- Short-term horizons (intraday)
- Mean-reverting assets (futures, indices)

---

## 2️⃣ Momentum (Trend Following)

**Philosophy:** Trends persist. Buy high, sell higher. Ride the wave until it breaks.

### Core Assumption

Assets that have been moving in one direction will continue. Momentum is a proxy for sentiment, flow, and fundamentals that haven't been fully priced in.

### Characteristics

| Attribute | Value |
|-----------|-------|
| **Win Rate** | Lower (30-40%) |
| **Average Win/Loss** | Large wins, small losses |
| **Expectation** | Asymmetric (few big winners) |
| **Time Horizon** | Swing to position |
| **Capital Required** | Higher (carry, drawdown) |

### Implementation Examples

| Approach | Indicator | Threshold |
|----------|-----------|-----------|
| Moving Average Crossover | Fast > Slow MA | Golden cross |
| MACD | Histogram direction | Above/below zero |
| ADX | Trend strength | > 25 = trending |
| Donchian | Breakout highs/lows | N-period high/low |

### When It Works Best

- Strong trending markets
- Higher timeframes (daily, weekly)
- Capturing "fat tails" in both directions
- Crisis periods (momentum surges)

---

## 3️⃣ Pairs Trading (Statistical Arbitrage)

**Philosophy:** Exploit mispricing between two correlated instruments.

### Core Assumption

Two assets with a stable relationship (cointegration) will diverge temporarily and revert. Trade the spread, not the direction of individual assets.

### Characteristics

| Attribute | Value |
|-----------|-------|
| **Market Direction** | Neutral (hedged) |
| **Win Rate** | High (65-75%) |
| **Correlation** | Must maintain > 0.7 |
| **Capital Required** | High (dual positions) |
| **Execution** | Complex |

### Implementation Examples

| Approach | Metric | Threshold |
|----------|--------|-----------|
| Z-Spread | Spread vs. mean | > 2.0 SD |
| Half-Life | Mean reversion speed | < 20 days |
| Cointegration Test | ADF statistic | p < 0.05 |
| Ratio | Price ratio deviation | > 2 ATR |

### When It Works Best

- Highly correlated assets (stock pairs, futures spreads)
- Stable economic relationships
- Not during regime changes (correlation breakdown)

---

## 🎯 CHOSEN STRATEGY: INTRADAY MEAN REVERSION ON FUTURES

### Why Mean Reversion for Futures?

| Factor | Rationale |
|--------|-----------|
| **Futures Characteristics** | Futures often mean-revert within sessions due to overnight positioning and morning rebalancing |
| **Liquidity** | ES and NQ have tight spreads, reliable order execution |
| **Volatility** | 1-minute bars provide sufficient range for edge |
| **Intraday Focus** | Eliminates overnight risk, margin efficiency |
| **Historical Evidence** | Studies show mean reversion in equity indices during regular hours |

### Selected Instruments

| Rank | Instrument | Rationale |
|------|------------|-----------|
| 1 | **ES (E-mini S&P 500)** | Highest liquidity, tightest spreads, most predictable behavior |
| 1 | **NQ (E-mini Nasdaq)** | Higher volatility = more opportunities, still liquid |
| 2 | **CL (Crude Oil)** | News-sensitive, higher spreads |
| 2 | **GC (Gold)** | Safe haven flows, moderate volatility |
| 3 | **DX (US Dollar)** | Lower volatility, correlate with risk sentiment |

### Why NOT Momentum for This System?

- Momentum requires longer holding periods to validate trends
- Intraday momentum signals are noisy and false
- Overnight gaps expose to gap risk (defeats intraday purpose)
- Capital efficiency lower (wider stops required)

### Why NOT Pairs Trading?

- Futures pairs (calendar spreads) require special handling
- Rollover complexity adds operational risk
- Correlation can break during volatile regimes
- Higher capital requirements for dual positions

---

## 📜 DOCTRINE

> **"The market is not a random walk. It is a drunkard walking home — sometimes stumbling far, sometimes near, but always pulled toward home. Our job is to catch the stumbles."**

> — OpenClaw v2.0

---

## 🔗 Related Protocols

- `library/risk-math.md` — Position sizing and risk metrics
- `library/pitfalls.md` — Common strategy pitfalls
- `context.md` — Strategy parameters and implementation

---

## 🚦 STATUS LOG

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-02-03 | 1.0.0 | Strategy doctrine defined | OpenClaw v2.0 |
