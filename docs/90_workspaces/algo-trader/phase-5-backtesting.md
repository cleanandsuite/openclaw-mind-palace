# AlgoTrader - Phase 5: Backtesting & Validation Protocol

**Version:** 1.0.0  
**Created:** 2026-02-03  
**Author:** OpenClaw v2.0 (Senior Algorithmic Architect)  
**Phase:** 5/5 - BACKTESTING, VALIDATION & PAPER TRADING

---

## 🎯 Phase 5 Objective

Validate the Intraday Mean Reversion strategy through rigorous backtesting, walk-forward analysis, and paper trading simulation before committing capital.

---

## 📊 Backtesting Framework

### Walk-Forward Analysis Protocol

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     WALK-FORWARD VALIDATION                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  OPTIMIZE ──► TEST ──► OPTIMIZE ──► TEST ──► OPTIMIZE ──► TEST        │
│  (Window 1)    (Fold 1)  (Window 2)    (Fold 2)  (Window 3)    (Fold 3)│
│                                                                         │
│  Rolling Window: 6 months optimization, 1 month out-of-sample           │
│  Walk-Forward Ratio: 6:1 (industry standard)                            │
└─────────────────────────────────────────────────────────────────────────┘
```

### Walk-Forward Configuration

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Optimization Window** | 6 months | Sufficient data for parameter stability |
| **Test Window** | 1 month | Out-of-sample validation |
| **Total Walk-Forward Periods** | 8-12 | Statistical significance |
| **In-Sample/Out-Sample Ratio** | 6:1 | Industry standard |
| **Walk-Forward Index (WFI)** | > 0.5 required | Consistency measure |

### Walk-Forward Metrics

| Metric | Formula | Target |
|--------|---------|--------|
| **WFI** | (# periods passing) / (total periods) | > 0.5 |
| **OOS Return** | Mean out-of-sample return | > 0 |
| **OOS Sharpe** | Out-of-sample Sharpe ratio | > 0.8 |
| **Degradation** | (IS Sharpe - OOS Sharpe) / IS Sharpe | < 30% |

---

## 🧪 Backtest Specification

### Test Parameters

| Parameter | Value |
|-----------|-------|
| **Period** | Jan 1, 2023 - Dec 31, 2024 (2 years) |
| **Instrument** | ES Futures (@ES) |
| **Timeframe** | 1-minute bars |
| **Session** | 09:30 - 16:00 CT |
| **Initial Capital** | $100,000 |
| **Transaction Costs** | $0.50 per side + 0.002% |

### Strategy Parameters to Test

| Parameter | Range | Step | Current |
|-----------|-------|------|---------|
| BB Period | 10-30 | 5 | 20 |
| BB Std Dev | 1.5-3.0 | 0.5 | 2.0 |
| Entry Threshold | 1.0-3.0 SD | 0.5 | 2.0 |
| Exit Threshold | 0.3-1.0 SD | 0.2 | 0.5 |
| Stop Loss | 1.5-4.0% | 0.5 | 2.0% |

### Walk-Forward Schedule

```
Period | Optimization Window | Test Window | Status
--------|---------------------|-------------|--------
1      | Jan-Jun 2023        | Jul 2023    | PENDING
2      | Feb-Jul 2023        | Aug 2023    | PENDING
3      | Mar-Aug 2023        | Sep 2023    | PENDING
4      | Apr-Sep 2023        | Oct 2023    | PENDING
5      | May-Oct 2023        | Nov 2023    | PENDING
6      | Jun-Nov 2023        | Dec 2023    | PENDING
7      | Jul-Dec 2023        | Jan 2024    | PENDING
8      | Aug-Jan 2024        | Feb 2024    | PENDING
```

---

## 📈 Performance Metrics

### Core Metrics

| Metric | Definition | Target | Minimum |
|--------|------------|--------|---------|
| **Total Return** | (Final - Initial) / Initial | > 20% annually | > 10% |
| **Sharpe Ratio** | (Return - Rf) / Std(Return) | > 1.5 | > 1.0 |
| **Sortino Ratio** | (Return - Rf) / Downside Std | > 2.0 | > 1.5 |
| **Win Rate** | # Wins / # Trades | > 55% | > 50% |
| **Profit Factor** | Gross Profit / Gross Loss | > 1.5 | > 1.2 |
| **Expectancy** | (Win% × AvgWin) - (Loss% × AvgLoss) | > 0 | > 0 |
| **Avg Trade** | Total Net Profit / # Trades | > 0 | > 0 |

### Drawdown Metrics

| Metric | Definition | Target | Maximum |
|--------|------------|--------|---------|
| **Max Drawdown** | Peak-to-valley decline | < 5% | < 10% |
| **Avg Drawdown** | Mean of all drawdowns | < 3% | < 5% |
| **Drawdown Duration** | Days to recover | < 10 days | < 20 days |
| **Calmar Ratio** | Annual Return / Max DD | > 3.0 | > 2.0 |

### Trade Statistics

| Metric | Definition | Target |
|--------|------------|--------|
| **Avg Win** | Mean profit on winning trades | > $150 |
| **Avg Loss** | Mean loss on losing trades | < $100 |
| **Win/Loss Ratio** | Avg Win / Avg Loss | > 1.5 |
| **Avg Time in Trade** | Mean holding period | < 45 min |
| **Max Consecutive Wins** | Longest win streak | > 5 |
| **Max Consecutive Losses** | Longest loss streak | < 8 |

---

## 🔬 Statistical Validation

### Bootstrap Analysis

```python
def bootstrap_returns(returns, n_bootstrap=1000, confidence=0.95):
    """
    Bootstrap resampling for confidence intervals.
    """
    bootstrap_means = []
    for _ in range(n_bootstrap):
        sample = np.random.choice(returns, size=len(returns), replace=True)
        bootstrap_means.append(np.mean(sample))
    
    lower = np.percentile(bootstrap_means, (1-confidence)/2 * 100)
    upper = np.percentile(bootstrap_means, (1+confidence)/2 * 100)
    
    return {
        'mean': np.mean(bootstrap_means),
        'std': np.std(bootstrap_means),
        'ci_95': (lower, upper)
    }
```

### Walk-Forward Index (WFI) Calculation

```python
def calculate_wfi(is_returns, oos_returns, threshold=0.0):
    """
    Calculate Walk-Forward Index.
    
    WFI = # of out-of-sample periods with return > threshold / Total periods
    """
    passes = sum(1 for ret in oos_returns if ret > threshold)
    return passes / len(oos_returns)
```

### Stationarity Tests

| Test | Purpose | Interpretation |
|------|---------|----------------|
| **ADF Test** | Test for unit root | p < 0.05 = stationary |
| **KPSS Test** | Test for stationarity | p > 0.05 = stationary |
| ** Hurst Exponent** | Measure mean reversion | H < 0.5 = mean reverting |

---

## 📋 Backtest Checklist

### Data Quality

- [ ] Data source: QuantConnect historical futures data
- [ ] Data cleaned for survivorship bias (none for futures)
- [ ] Missing data handling: Forward-fill limited to 5 minutes
- [ ] Corporate actions: None (futures)
- [ ] Split-adjusted: N/A (futures)

### Implementation

- [ ] No look-ahead bias (verified `shift(1)` usage)
- [ ] No overfitting (parameters < 5)
- [ ] Transaction costs included ($0.50 + 0.002%)
- [ ] Slippage modeled (0.5 tick for ES)
- [ ] Execution delay simulated (100ms)

### Results

- [ ] Walk-Forward Index > 0.5
- [ ] Out-of-sample Sharpe > 0.8
- [ ] Max drawdown < 10%
- [ ] Win rate > 50%
- [ ] Profit factor > 1.2

---

## 🎮 Paper Trading Protocol

### Paper Trading Setup

| Component | Configuration |
|-----------|---------------|
| **Platform** | Alpaca Paper (recommended) or QuantConnect Paper |
| **Account** | Paper trading account |
| **Capital** | $100,000 (simulated) |
| **Data Feed** | Real-time IBKR or Alpaca |
| **Execution** | Simulated (no real orders) |

### Paper Trading Period

| Phase | Duration | Purpose |
|-------|----------|---------|
| **Phase 1** | 2 weeks | Infrastructure validation |
| **Phase 2** | 4 weeks | Signal quality verification |
| **Phase 3** | 4 weeks | Full workflow testing |
| **Total** | 10 weeks | Before live trading |

### Paper Trading Checklist

- [ ] Data feed connected and stable
- [ ] Signal generation working
- [ ] Order simulation triggering correctly
- [ ] P&L calculation verified
- [ ] Risk checks functioning
- [ ] Logging complete
- [ ] Dashboard updating
- [ ] Alert system working

### Paper Trading Metrics

| Metric | Target | Notes |
|--------|--------|-------|
| **Signal Accuracy** | > 55% | Signals match backtest patterns |
| **Execution Latency** | < 500ms | From signal to simulated fill |
| **Uptime** | > 99% | Data feed availability |
| **False Signals** | < 5% | Signals rejected by risk checks |

---

## 🚀 Production Readiness Checklist

### Before Live Trading

| Category | Requirement | Status |
|----------|-------------|--------|
| **Backtest** | Walk-forward complete, WFI > 0.5 | ☐ |
| **Paper Trading** | 10 weeks successful, metrics match backtest | ☐ |
| **Risk Limits** | Daily loss limit, kill switch tested | ☐ |
| **Execution** | Broker connection verified, orders working | ☐ |
| **Monitoring** | Dashboard operational, alerts tested | ☐ |
| **Documentation** | Runbook complete, contacts listed | ☐ |
| **Compliance** | Regulatory requirements met | ☐ |
| **Capital** | Sufficient margin for positions | ☐ |

### Live Trading Parameters

| Parameter | Value |
|-----------|-------|
| **Initial Capital** | $100,000 |
| **Position Size** | 2% per trade |
| **Max Positions** | 3 concurrent |
| **Max Daily Risk** | 3% of portfolio |
| **Kill Switch** | Manual + auto at 3.5% DD |

### Graduated Deployment

| Phase | Capital | Duration | Purpose |
|-------|---------|----------|---------|
| **1** | $25,000 | 2 weeks | Validation |
| **2** | $50,000 | 2 weeks | Scale testing |
| **3** | $100,000 | Ongoing | Full deployment |

---

## 📊 Reporting Templates

### Weekly Report Template

```markdown
## Week of [DATE]

### Performance Summary
- **Total Return:** X.X%
- **Sharpe Ratio:** X.X
- **Max Drawdown:** X.X%
- **Win Rate:** X.X%

### Trade Statistics
- **Total Trades:** XX
- **Wins:** XX (XX%)
- **Losses:** XX (XX%)
- **Avg Win:** $XX
- **Avg Loss:** $XX

### Walk-Forward Status
- **Current Window:** [dates]
- **WFI:** X.XX
- **OOS Sharpe:** X.XX

### Issues & Actions
- [Issue 1] → [Action taken]
- [Issue 2] → [Action taken]

### Next Week Focus
- [Task 1]
- [Task 2]
```

### Monthly Report Template

```markdown
## [MONTH] [YEAR] Report

### Executive Summary
- **Monthly Return:** X.X%
- **vs. Benchmark (ES):** +X.X%
- **Sharpe Ratio:** X.X
- **Max Drawdown:** X.X%

### Walk-Forward Progress
- **Periods Completed:** X/8
- **Cumulative WFI:** X.XX
- **Parameter Stability:** [STABLE/UNSTABLE]

### Performance Attribution
- **Best Day:** [date] (+X.X%)
- **Worst Day:** [date] (-X.X%)
- **Best Instrument:** [ES/NQ/CL]
- **Time Analysis:** [morning/afternoon]

### Risk Review
- **Daily VaR (95%):** $X,XXX
- **Max Position Size:** X lots
- **Kill Switch Triggers:** X

### Outlook
- **Strengths:** [list]
- **Weaknesses:** [list]
- **Planned Improvements:** [list]
```

---

## 🔗 Related Protocols

- `context.md` — Strategy objectives
- `library/strategies.md` — Mean reversion doctrine
- `library/risk-math.md` — Kelly, Sharpe, stop loss
- `library/pitfalls.md` — Bias prevention
- `risk-protocols.md` — Risk management rules
- `OpenClawFuturesBot.py` — QuantConnect algorithm
- `data_bridge.py` — Real-time data bridge
- `dashboard-schema.md` — Signal schema

---

## 🚦 STATUS LOG

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-02-03 | 1.0.0 | Phase 5 backtesting protocol created | OpenClaw v2.0 |

---

## ✅ PHASE 5 COMPLETE

**Backtesting & Validation Protocol Ready**

```
PHASE 5 DELIVERABLES:
├── Walk-Forward Analysis Framework
├── Backtest Specification (2 years, ES futures)
├── Performance Metrics & Targets
├── Statistical Validation Methods
├── Paper Trading Protocol (10 weeks)
└── Production Readiness Checklist
```

**Awaiting execution of:**
1. Run walk-forward backtest on QuantConnect
2. Complete 10-week paper trading
3. Graduate to live trading

**Status: READY FOR VALIDATION**
