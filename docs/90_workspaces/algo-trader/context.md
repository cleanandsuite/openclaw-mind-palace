# AlgoTrader - Context Protocol

**Version:** 1.0.0  
**Created:** 2026-02-03  
**Author:** OpenClaw v2.0 (Senior Algorithmic Architect)  
**Status:** ACTIVE - PENDING VALIDATION

---

## 🎯 Objective

**Futures Intraday Mean Reversion Strategy**

Primary mandate: Capture alpha through systematic mean reversion in futures markets during intraday sessions. The strategy exploits the tendency of futures prices to revert to statistical means after short-term displacements caused by order flow imbalances, news events, and overnight gap adjustments.

### Core Thesis

- Futures exhibit mean-reverting behavior within trading sessions
- Overnight positioning creates mispricings that correct during regular hours
- Intraday volatility provides sufficient spread for execution
- Systematic approach removes emotional decision-making

### Markets

| Tier | Instrument | Session | Notes |
|------|------------|---------|-------|
| 1 | ES (E-mini S&P 500) | US Equities | Highest liquidity |
| 1 | NQ (E-mini Nasdaq) | US Equities | High volatility |
| 2 | CL (Crude Oil) | US Energy | Sensitive to news |
| 2 | GC (Gold) | US Commodities | Safe haven flows |
| 3 | DX (US Dollar Index) | Global FX proxy | Correlates with risk sentiment |

### Timeframe

- **Resolution:** 1-minute bars (primary), 5-minute (confirmation)
- **Session:** 09:30 - 16:00 CT (US Equities)
- **Holding:** Intraday only — no overnight positions

### Execution Venue

- **Primary:** Rithmic (direct market access)
- **Backup:** QuantConnect execution engine
- **Broker Integration:** IBKR or similar (for account management)

---

## 📊 Strategy Parameters

### Mean Reversion Engine

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Lookback Period | 20-50 minutes | Captures short-term mean |
| Entry Threshold | 1.5-2.0 standard deviations | Statistical edge threshold |
| Exit Threshold | 0.5 standard deviations | Profit capture zone |
| Stop Loss | 3.0 standard deviations | Risk management |
| Time Exit | 45 minutes max hold | Intraday constraint |

### Position Sizing

- **Fixed Fractional:** 1-2% of portfolio per trade
- **Volatility Adjusted:** Scale by inverse of 20-min ATR
- **Max Positions:** 3 concurrent trades
- **Max Daily Trades:** 12 (6 per session half)

---

## 🔄 Workflow

```
1. DATA INGESTION → 2. SIGNAL GENERATION → 3. RISK VALIDATION → 4. EXECUTION → 5. POST-TRADE
```

### Phase 1: Data Ingestion
- Pull 1-minute bars from Rithmic
- Normalize to common schema
- Calculate technical indicators in real-time

### Phase 2: Signal Generation
- Compute z-score of price vs. rolling mean
- Generate entry signals when z-score crosses threshold
- Filter by time (avoid first/last 15 min)

### Phase 3: Risk Validation
- Check drawdown limits
- Verify kill switch status
- Confirm position limits

### Phase 4: Execution
- Route to Rithmic via FIX 4.4
- Execute limit orders for execution quality
- Partial fills handled with rebalancer

### Phase 5: Post-Trade
- Record P&L
- Update performance metrics
- Log trade for backtest analysis

---

## 📁 Related Protocols

- `risk-protocols.md` — Drawdown limits, kill switch, position limits
- `tech-stack.md` — QuantConnect, Rithmic, libraries
- `execution.md` — Order routing, FIX protocol, execution algorithms
- `backtesting.md` — Walk-forward validation, walk-forward optimization
- `performance.md` — Metrics, benchmarking, attribution

---

## 🚦 Status LOG

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-02-03 | 1.0.0 | Initial context definition | OpenClaw v2.0 |
