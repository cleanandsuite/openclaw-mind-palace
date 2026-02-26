import { KnowledgeFolder } from "../knowledge-tree";

export const algoTraderWorkspace: KnowledgeFolder = {
  id: "algo-trader",
  name: "algo-trader",
  purpose: "Futures intraday mean reversion strategy with QuantConnect + Rithmic",
  color: "workspace",
  files: [
    {
      id: "algo-context",
      name: "context.md",
      lastUpdated: "2026-02-03",
      content: `# AlgoTrader - Context Protocol

**Version:** 1.0.0
**Created:** 2026-02-03
**Status:** ACTIVE - PENDING VALIDATION

## Objective

**Futures Intraday Mean Reversion Strategy**

Primary mandate: Capture alpha through systematic mean reversion in futures markets during intraday sessions.

### Core Thesis

- Futures exhibit mean-reverting behavior within trading sessions
- Overnight positioning creates mispricings that correct during regular hours
- Intraday volatility provides sufficient spread for execution
- Systematic approach removes emotional decision-making

### Markets

| Tier | Instrument | Session |
|------|------------|---------|
| 1 | ES (E-mini S&P 500) | US Equities |
| 1 | NQ (E-mini Nasdaq) | US Equities |
| 2 | CL (Crude Oil) | US Energy |
| 2 | GC (Gold) | US Commodities |
| 3 | DX (US Dollar Index) | Global FX proxy |

### Timeframe

- **Resolution:** 1-minute bars (primary), 5-minute (confirmation)
- **Session:** 09:30 - 16:00 CT (US Equities)
- **Holding:** Intraday only — no overnight positions

### Execution Venue

- **Primary:** Rithmic (direct market access)
- **Backup:** QuantConnect execution engine

## Strategy Parameters

### Mean Reversion Engine

| Parameter | Value |
|-----------|-------|
| Lookback Period | 20-50 minutes |
| Entry Threshold | 1.5-2.0 standard deviations |
| Exit Threshold | 0.5 standard deviations |
| Stop Loss | 3.0 standard deviations |
| Time Exit | 45 minutes max hold |

### Position Sizing

- **Fixed Fractional:** 1-2% of portfolio per trade
- **Max Positions:** 3 concurrent trades
- **Max Daily Trades:** 12

## Workflow

\`\`\`
1. DATA INGESTION → 2. SIGNAL GENERATION → 3. RISK VALIDATION → 4. EXECUTION → 5. POST-TRADE
\`\`\`

## Related Protocols

- \`risk-protocols.md\` — Drawdown limits, kill switch, position limits
- \`tech-stack.md\` — QuantConnect, Rithmic, libraries
- \`library/strategies.md\` — Mean Reversion Doctrine
- \`library/risk-math.md\` — Kelly, Sharpe, Stop Loss
- \`library/pitfalls.md\` — Bias Prevention`
    },
    {
      id: "algo-risk-protocols",
      name: "risk-protocols.md",
      lastUpdated: "2026-02-03",
      content: `# AlgoTrader - Risk Protocols

**Version:** 1.0.0
**Created:** 2026-02-03

## Drawdown Limits

### Daily Drawdown

| Tier | Drawdown % | Action |
|------|------------|--------|
| GREEN | 0% - 1.0% | Normal operation |
| YELLOW | 1.0% - 2.0% | Reduce position size by 50% |
| RED | 2.0% - 3.0% | Reduce position size by 75% |
| KILL | > 3.0% | HALT ALL TRADING |

### Consecutive Loss Limit

- **5 consecutive losses:** Reduce position size by 50%
- **8 consecutive losses:** Stop trading for 30 minutes
- **10 consecutive losses:** HALT until next session

### Maximum Loss Per Day

- **Hard Limit:** 3.5% of portfolio
- **Action:** Immediate kill switch activation

## Kill Switch

### Level 1: Soft Kill (Session Pause)
**Trigger:** 2.5% daily drawdown or 8 consecutive losses

### Level 2: Hard Kill (Season Halt)
**Trigger:** 3.5% daily drawdown or 10 consecutive losses

\`\`\`python
class KillSwitch:
    def __init__(self):
        self.status = "ACTIVE"  # ACTIVE, SOFT, HARD

    def check(self, portfolio, recent_pnl) -> str:
        daily_dd = self.calculate_drawdown(portfolio)
        if daily_dd > 0.035:
            return "HARD_KILL"
        elif daily_dd > 0.025:
            return "SOFT_KILL"
        return "CONTINUE"
\`\`\`

## Position Limits

| Condition | Max Concurrent |
|-----------|----------------|
| Normal | 3 |
| Yellow drawdown | 2 |
| Red drawdown | 1 |
| Post-loss cooldown | 0 |`
    },
    {
      id: "algo-tech-stack",
      name: "tech-stack.md",
      lastUpdated: "2026-02-03",
      content: `# AlgoTrader - Tech Stack

**Version:** 1.0.0
**Created:** 2026-02-03

## Architecture Overview

| Layer | Technology |
|-------|-----------|
| Strategy Engine | QuantConnect Cloud / Python |
| Data Feed | Rithmic (Real-time) |
| Execution | Rithmic (FIX 4.4) / IBKR |
| Risk Management | Custom Python Risk Engine |
| Backtesting | QuantConnect Research |
| Version Control | GitHub / OpenClaw Mind Palace |

## Python Libraries (Core)

| Library | Purpose |
|---------|---------|
| \`pandas\` >= 2.0 | Time series manipulation |
| \`numpy\` >= 1.24 | Numerical computing |
| \`numba\` >= 0.57 | JIT compilation |
| \`scipy\` >= 1.10 | Statistical functions |
| \`pandas-ta\` >= 0.3 | Technical analysis indicators |

## Testing Stack

| Tool | Purpose |
|------|---------|
| \`pytest\` | Unit testing |
| \`pytest-cov\` | Code coverage |
| \`hypothesis\` | Property-based testing |

## Security

- API Keys in environment variables (\`.env\`)
- TLS 1.3 for all connections
- Role-based access (trader, analyst, admin)`
    },
    {
      id: "algo-system-integration",
      name: "SYSTEM_INTEGRATION.md",
      lastUpdated: "2026-02-03",
      content: `# AlgoTrader System - Complete Integration Guide

**Version:** 1.0.0
**Status:** FULLY DEPLOYED - Phase 7 Complete

## System Architecture

\`\`\`
MISSION CONTROL (Dashboard) → RUN_SYSTEM.PY (Launcher)
    ↓                              ↓
PERFORMANCE AUDITOR          DATA_BRIDGE (Feed)
    ↓                              ↓
              ALGO_TRADER (Logic)
                    ↓
             MEMORY BANK (Mind Palace)
\`\`\`

## Components

| Phase | Component | Description |
|-------|-----------|-------------|
| 1 | context.md | Strategy Objectives |
| 2 | library/ | Strategies, Risk Math, Pitfalls |
| 3 | OpenClawFuturesBot.py | QuantConnect Algorithm |
| 4 | data_bridge.py | Real-time WebSocket Data |
| 5 | phase-5-backtesting.md | Walk-Forward Validation |
| 6 | mission-control/ | React/Next.js Dashboard |
| 7 | run_system.py | Master Launcher |

## Performance Targets

| Metric | Target | Minimum |
|--------|--------|---------|
| Sharpe Ratio | > 1.5 | > 1.0 |
| Win Rate | > 55% | > 50% |
| Max Drawdown | < 5% | < 10% |
| Profit Factor | > 1.5 | > 1.2 |

## Status: DEPLOYMENT READY`
    },
    {
      id: "algo-backtesting",
      name: "phase-5-backtesting.md",
      lastUpdated: "2026-02-03",
      content: `# AlgoTrader - Phase 5: Backtesting & Validation

**Version:** 1.0.0
**Phase:** 5/5 - BACKTESTING, VALIDATION & PAPER TRADING

## Walk-Forward Analysis Protocol

| Parameter | Value |
|-----------|-------|
| Optimization Window | 6 months |
| Test Window | 1 month |
| Total Periods | 8-12 |
| Walk-Forward Index (WFI) | > 0.5 required |

## Backtest Specification

| Parameter | Value |
|-----------|-------|
| Period | Jan 2023 - Dec 2024 (2 years) |
| Instrument | ES Futures (@ES) |
| Timeframe | 1-minute bars |
| Initial Capital | $100,000 |
| Transaction Costs | $0.50 per side + 0.002% |

## Paper Trading Protocol

| Phase | Duration | Purpose |
|-------|----------|---------|
| Phase 1 | 2 weeks | Infrastructure validation |
| Phase 2 | 4 weeks | Signal quality verification |
| Phase 3 | 4 weeks | Full workflow testing |
| Total | 10 weeks | Before live trading |

## Production Readiness Checklist

- Walk-forward complete, WFI > 0.5
- 10 weeks paper trading successful
- Risk limits and kill switch tested
- Broker connection verified
- Dashboard operational, alerts tested

## Status: READY FOR VALIDATION`
    }
  ],
  subfolders: [
    {
      id: "algo-library",
      name: "library",
      purpose: "Core trading doctrine — strategies, risk math, and pitfall prevention.",
      color: "workspace",
      files: [
        {
          id: "algo-strategies",
          name: "strategies.md",
          lastUpdated: "2026-02-03",
          content: `# AlgoTrader - Library: Strategies

**Classification:** CORE DOCTRINE

## Foundational Strategy Classes

### 1. Mean Reversion

**Philosophy:** Price deviates from intrinsic value and tends to return.

| Attribute | Value |
|-----------|-------|
| Win Rate | Higher (60-70%) |
| Average Win/Loss | Small wins, larger occasional losses |
| Time Horizon | Intraday to swing |

### 2. Momentum (Trend Following)

**Philosophy:** Trends persist. Ride the wave until it breaks.

| Attribute | Value |
|-----------|-------|
| Win Rate | Lower (30-40%) |
| Average Win/Loss | Large wins, small losses |
| Time Horizon | Swing to position |

### 3. Pairs Trading (Statistical Arbitrage)

**Philosophy:** Exploit mispricing between two correlated instruments.

| Attribute | Value |
|-----------|-------|
| Market Direction | Neutral (hedged) |
| Win Rate | High (65-75%) |
| Correlation | Must maintain > 0.7 |

## CHOSEN: INTRADAY MEAN REVERSION ON FUTURES

> "The market is a drunkard walking home. Our job is to catch the stumbles." — OpenClaw v2.0`
        },
        {
          id: "algo-risk-math",
          name: "risk-math.md",
          lastUpdated: "2026-02-03",
          content: `# AlgoTrader - Library: Risk Math

**Classification:** CORE DOCTRINE

## 1. Kelly Criterion (Position Sizing)

- **Never use full Kelly.** Use fractional Kelly (0.25-0.5)
- Maximum Kelly exposure: 2% of portfolio per trade
- Stop using if Kelly < 0 (negative expectancy)

## 2. Sharpe Ratio vs. Sortino Ratio

| Metric | Target | Minimum |
|--------|--------|---------|
| Sharpe Ratio | > 1.5 | > 1.0 |
| Sortino Ratio | > 2.0 | > 1.5 |

## 3. Maximum Drawdown (MDD) Limits

| Tier | Drawdown | Action |
|------|----------|--------|
| GREEN | 0 - 1.0% | Normal |
| YELLOW | 1.0 - 2.0% | Reduce 50% |
| RED | 2.5 - 3.0% | Stop opening |
| KILL | > 3.0% | HALT ALL |

## 4. Stop Loss Rule

**CRITICAL: Stop Loss at -2% from entry. Non-negotiable.**

- Long Stop: Entry × 0.98
- Short Stop: Entry × 1.02
- Minimum risk:reward ratio: 1.5:1`
        },
        {
          id: "algo-pitfalls",
          name: "pitfalls.md",
          lastUpdated: "2026-02-03",
          content: `# AlgoTrader - Library: Pitfalls

**Classification:** CORE DOCTRINE - CRITICAL

## Deadly Sins of Quantitative Trading

### 1. Look-Ahead Bias (Cheating)

Using information not available at trade time to generate signals.

**Prevention:**
- Use only bars completed BEFORE signal generation
- Walk-forward validation (never optimize on test set)

\`\`\`python
# ❌ WRONG - Look-ahead bias
df['ma_20'] = df['close'].rolling(20).mean()

# ✅ CORRECT - No look-ahead
df['ma_20'] = df['close'].shift(1).rolling(20).mean()
\`\`\`

### 2. Overfitting (Curve Fitting)

Strategy memorizes past noise instead of learning dynamics.

**Rule:** "If your strategy has more parameters than years of data, you're overfitting."

### 3. Futures Contract Rollover Rules

- **Never hold to expiration** — Exit 7 days before
- **Check volume** — New contract must have 50%+ of old
- Roll on 2nd Friday of expiration month

### 4. Survivorship Bias

Backtesting only on instruments that "survived" to the present.

**Impact:** Futures/forex = Low (no survivorship). Equities = High (2-4% annually).`
        }
      ]
    }
  ]
};
