# AlgoTrader - Library: Pitfalls

**Version:** 1.0.0  
**Created:** 2026-02-03  
**Author:** OpenClaw v2.0 (Senior Algorithmic Architect)  
**Classification:** CORE DOCTRINE - CRITICAL

---

## ⚠️ Deadly Sins of Quantitative Trading

These pitfalls have destroyed more quant funds than bad strategies. Know them. Avoid them. Test for them.

---

## 1️⃣ Look-Ahead Bias (Cheating)

### Definition

Using information that would not have been available at the time of the trade to generate signals or evaluate performance.

### How It Sneaks In

| Mistake | Description | Example |
|---------|-------------|---------|
| **Future Data** | Including data from after signal time | Using close of day N to signal at open of day N |
| **Survivor Selection** | Selecting instruments that "survived" | Backtesting only stocks that exist today |
| **Indicator Look-Ahead** | Using smoothed future values | Using tomorrow's close in today's moving average |
| **Parameter Optimization** | Tuning on future data | Choosing lookback that maximizes in-sample returns |

### Detection Methods

```python
def detect_look_ahead(signal_times, data_times):
    """
    Check if any signal was generated using data 
    that wasn't available at signal time.
    """
    for signal, data_used in zip(signal_times, data_times):
        if data_used > signal:
            raise LookAheadBiasError("Signal uses future data")
```

### Prevention Protocol

| Step | Action |
|------|--------|
| 1 | Use only bars completed BEFORE signal generation |
| 2 | Add time index to every data point |
| 3 | Walk-forward validation (never optimize on test set) |
| 4 | Timestamp everything in logs |

### Example of the Error

```python
# ❌ WRONG - Look-ahead bias
df['ma_20'] = df['close'].rolling(20).mean()
# Signal uses today's close in the 20-day average

# ✅ CORRECT - No look-ahead
df['ma_20'] = df['close'].shift(1).rolling(20).mean()
# Signal uses only yesterday's close
```

---

## 2️⃣ Overfitting (Curve Fitting)

### Definition

Creating a strategy that is perfectly tuned to historical noise rather than signal. The strategy "memorizes" the past rather than "learning" the underlying dynamics.

### Symptoms

| Symptom | Description |
|---------|-------------|
| High in-sample Sharpe, low out-of-sample | Memorization, not learning |
| Many parameters | Each parameter is an opportunity to overfit |
| Complex rules | Simple edge, complex expression = overfit |
| Perfect equity curve | Real strategies have drawdowns |

### Overfitting Metrics

| Metric | Healthy | Overfit |
|--------|---------|---------|
| Number of parameters | < 5 | > 20 |
| In-sample / Out-of-sample Sharpe ratio | 0.9 - 1.1 | > 1.5 |
| Degrees of freedom / observations | < 1% | > 10% |
| Strategy complexity score | Low | High |

### Prevention Protocol

| Technique | Description |
|-----------|-------------|
| **Walk-Forward Analysis** | Optimize on one window, test on next |
| **Cross-Validation** | K-fold validation across time |
| **Parameter Regularization** | Penalize complexity in optimization |
| **Out-of-Sample Testing** | Always hold out unseen data |
| **Bootstrapping** | Resample to estimate variance |

### The Rule of Thumb

> **"If your strategy has more parameters than years of data, you're overfitting."**

### Walk-Forward Example

```
Window 1 (2020): Optimize parameters
├── Test Window 1 (Jan 2021): Validate
├── Window 2 (Feb 2021 - Dec 2021): Optimize
├── Test Window 2 (Jan 2022): Validate
└── Window 3 (Feb 2022 - Dec 2022): Optimize
    └── Test Window 3 (Jan 2023): Validate
```

---

## 3️⃣ CRITICAL: Futures Contract Rollover Rules

### The Problem

Futures contracts expire. You cannot hold a contract past expiration. You must switch from the near-month contract to the far-month contract before expiration.

### Why This Matters

| Risk | Consequence |
|------|-------------|
| **Missed Roll** | Forced liquidation at expiration price |
| **Roll Timing** | Wrong timing = basis risk |
| **Volume Drop** | New contract may have wider spreads |
| **Price Gaps** | Gap between contracts can be significant |

### Contract Specification (ES)

| Month | Code | Expiration | Days Before Exp |
|-------|------|------------|-----------------|
| March | ESH6 | 3rd Friday | 7 |
| June | ESM6 | 3rd Friday | 7 |
| September | ESU6 | 3rd Friday | 7 |
| December | ESZ6 | 3rd Friday | 7 |

### Rollover Protocol

```python
class FuturesRollover:
    """
    Manages contract rollover for futures strategies.
    """
    
    def __init__(self):
        self.roll_days_before_exp = 7
        self.volume_threshold = 0.5  # New contract must have 50% of old volume
        
    def should_roll(self, current_contract, current_date):
        """
        Determine if rollover is needed.
        """
        days_to_exp = (current_contract.expiry - current_date).days
        
        if days_to_exp <= self.roll_days_before_exp:
            return True
        return False
    
    def select_next_contract(self, current_contract):
        """
        Find the next contract in the series.
        """
        next_month = current_contract.month + 1
        next_contract = get_contract(current_contract.symbol, next_month)
        
        # Ensure new contract has sufficient liquidity
        if next_contract.volume < current_contract.volume * self.volume_threshold:
            raise LiquidityError("New contract insufficient volume")
        
        return next_contract
    
    def execute_roll(self, strategy, current_contract, next_contract):
        """
        Execute the rollover with minimal slippage.
        """
        # Step 1: Close positions in current contract
        strategy.close_all_positions()
        
        # Step 2: Open equivalent positions in next contract
        strategy.open_positions(next_contract)
        
        # Step 3: Log the roll
        log_roll(current_contract, next_contract, current_date)
```

### Roll Calendar (Example: ES)

| Current Month | Switch To | Roll Date |
|---------------|-----------|-----------|
| March (H) | June (M) | 2nd Friday of March |
| June (M) | September (U) | 2nd Friday of June |
| September (U) | December (Z) | 2nd Friday of September |
| December (Z) | March (H) | 2nd Friday of December |

### Key Rules

| Rule | Description |
|------|-------------|
| **Never hold to expiration** | Exit 7 days before |
| **Check volume** | New contract must have 50%+ of old |
| **Minimize slippage** | Execute in small blocks |
| **Log everything** | Track roll performance separately |
| **Adjust for basis** | Account for price difference |

---

## 4️⃣ Survivorship Bias

### Definition

Backtesting only on instruments that "survived" to the present, excluding those that were delisted, bankrupt, or merged.

### The Mistake

| Backtest Reality | Real-World Reality |
|------------------|-------------------|
| Only stocks still trading | Many stocks went to zero |
| "I made 20% annually!" | "I would have held XYZ which went bankrupt" |
| Performance looks great | Survivorship boosted returns by 2-5% |

### Impact on Strategy

| Strategy Type | Survivorship Bias Impact |
|---------------|--------------------------|
| Long-only equity | High (survivorship adds 2-4% annually) |
| Long/Short equity | Medium (partial hedge) |
| Futures/forex | Low (no survivorship) |
| Options strategies | Variable |

### Prevention

| Method | Description |
|--------|-------------|
| **Delisted data** | Include delisted securities in backtest |
| **Survivorship-free datasets** | Use vendor that includes delisted |
| **Factor models** | Test on synthetic data |
| **Bootstrap** | Resample with replacement |

---

## 📋 Pre-Launch Checklist

Before any strategy goes live, verify:

- [ ] No look-ahead bias in signal generation
- [ ] Parameter count reasonable (< 10)
- [ ] Walk-forward validation completed
- [ ] Out-of-sample performance validated
- [ ] Rollover protocol tested on historical rolls
- [ ] Delisted securities included in backtest
- [ ] Transaction costs included
- [ ] Slippage assumptions conservative

---

## 🔗 Related Protocols

- `library/strategies.md` — Strategy types and selection
- `library/risk-math.md` — Position sizing and metrics
- `risk-protocols.md` — Implementation rules
- `context.md` — Strategy objectives

---

## 🚦 STATUS LOG

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-02-03 | 1.0.0 | Pitfalls doctrine defined | OpenClaw v2.0 |
