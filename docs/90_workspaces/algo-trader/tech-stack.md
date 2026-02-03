# AlgoTrader - Tech Stack

**Version:** 1.0.0  
**Created:** 2026-02-03  
**Author:** OpenClaw v2.0 (Senior Algorithmic Architect)  
**Related:** context.md,.md

---

## risk-protocols 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ALGO-TRADER STACK                           │
├─────────────────────────────────────────────────────────────────────┤
│  FRONTEND          │  QuantConnect Dashboard / Custom Web UI       │
├────────────────────┼────────────────────────────────────────────────┤
│  STRATEGY ENGINE   │  QuantConnect Cloud / Python Research         │
├────────────────────┼────────────────────────────────────────────────┤
│  DATA FEED         │  Rithmic (Real-time) / QuantConnect History   │
├────────────────────┼────────────────────────────────────────────────┤
│  EXECUTION         │  Rithmic (FIX 4.4) / IBKR Integration         │
├────────────────────┼────────────────────────────────────────────────┤
│  RISK MANAGEMENT   │  Custom Python Risk Engine                    │
├────────────────────┼────────────────────────────────────────────────┤
│  BACKTESTING       │  QuantConnect Research / Zipline Legacy       │
├────────────────────┼────────────────────────────────────────────────┤
│  VERSION CONTROL   │  GitHub / OpenClaw Mind Palace                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🐍 Python Libraries (Analysis & Research)

### Core Stack

| Library | Version | Purpose |
|---------|---------|---------|
| `pandas` | >= 2.0 | Time series manipulation |
| `numpy` | >= 1.24 | Numerical computing |
| `numba` | >= 0.57 | JIT compilation for performance |
| `scipy` | >= 1.10 | Statistical functions |

### Data & APIs

| Library | Version | Purpose |
|---------|---------|---------|
| `requests` | >= 2.28 | HTTP client for REST APIs |
| `websocket-client` | >= 0.58 | Rithmic WebSocket connection |
| `fixp` | >= 1.0 | FIX protocol parser |
| `python-rapidjson` | >= 1.10 | JSON serialization |

### Technical Analysis

| Library | Version | Purpose |
|---------|---------|---------|
| `pandas-ta` | >= 0.3 | Technical analysis indicators |
| `ta-lib` | >= 0.4 | C-based TA library (optional) |
| `bottleneck` | >= 1.3 | Fast array functions |

### Machine Learning (Optional)

| Library | Version | Purpose |
|---------|---------|---------|
| `scikit-learn` | >= 1.3 | Feature engineering |
| `xgboost` | >= 1.7 | Gradient boosting |
| `joblib` | >= 1.3 | Parallel processing |

---

## ⚙️ QuantConnect Configuration

### Algorithm Structure

```
algo-trader/
├── Algorithm.py              # Main algorithm class
├── AlphaModel.py            # Signal generation
├── ExecutionModel.py        # Order execution
├── RiskManagementModel.py   # Risk checks
├── UniverseSelection.py     # Instrument selection
├── Research.ipynb           # Jupyter research notebook
├── config.json              # Strategy parameters
└── requirements.txt         # Python dependencies
```

### Algorithm Template

```python
from QuantConnect import Algorithm
from QuantConnect.Data import Slice

class AlgoTraderAlgorithm(Algorithm):
    def Initialize(self):
        self.SetStartDate(2020, 1, 1)
        self.SetEndDate(2024, 12, 31)
        self.SetCash(100000)
        self.SetBrokerageModel(BrokerageName.Rithmic)
        
        # Add futures
        self.AddFuture(Futures.ES, Resolution.Minute)
        self.AddFuture(Futures.NQ, Resolution.Minute)
        
        # Set execution parameters
        self.SetExecution(ImmediateExecutionModel())
        
    def OnData(self, slice: Slice):
        # Mean reversion logic
        pass
```

### QuantConnect Parameters

```json
{
  "strategy": {
    "name": "AlgoTrader-Intraday-MR",
    "version": "1.0.0"
  },
  "markets": ["ES", "NQ", "CL", "GC", "DX"],
  "timeframes": {
    "primary": "1m",
    "confirmation": "5m"
  },
  "execution": {
    "type": "Immediate",
    "slippage": 0.0001
  }
}
```

---

## 🔌 Rithmic Integration

### Connection Parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| Host | `trader-pro.rithmic.com` | Production |
| Port | `17001` | Market data |
| Port | `17002` | Order routing |
| Protocol | `FIX 4.4` | Message format |
| SenderCompID | `[ACCOUNT_ID]` | Your account |
| TargetCompID | `RITHMIC_D` | Rithmic gateway |

### Data Feed

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | datetime | Exchange timestamp |
| `bid` | float | Best bid price |
| `ask` | float | Best ask price |
| `last` | float | Last traded price |
| `volume` | int | Tick volume |
| `open_interest` | int | Futures OI |

### Order Types Supported

| Type | Description | Usage |
|------|-------------|-------|
| Market | Immediate execution | Kill switch exit |
| Limit | Price-limited entry |.entries |
| Stop | Trigger on breach | Stop-loss orders |

---

## 📦 Installation (Windows)

```powershell
# Create virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install core dependencies
pip install pandas numpy scipy numba
pip install pandas-ta requests websocket-client

# Install Rithmic client (if available)
pip install rithmic-client

# Clone repo
git clone https://github.com/your-org/algo-trader.git
cd algo-trader
pip install -r requirements.txt
```

---

## 🧪 Testing Stack

| Tool | Purpose |
|------|---------|
| `pytest` | Unit testing framework |
| `pytest-cov` | Code coverage |
| `pytest-mock` | Mocking for APIs |
| `hypothesis` | Property-based testing |

### Test Structure

```
tests/
├── unit/
│   ├── test_indicators.py
│   ├── test_risk.py
│   └── test_signals.py
├── integration/
│   └── test_rithmic_connection.py
└── backtest/
    └── validate_signals.py
```

---

## 📈 Performance Monitoring

| Tool | Purpose |
|------|---------|
| ` Grafana` | Real-time dashboards |
| `Prometheus` | Metrics collection |
| `New Relic` | APM and tracing |

---

## 🔐 Security

| Layer | Implementation |
|-------|----------------|
| API Keys | Environment variables (`.env`) |
| Secrets | HashiCorp Vault (optional) |
| Encryption | TLS 1.3 for all connections |
| Access Control | Role-based (trader, analyst, admin) |

---

## 📁 Related Protocols

- `context.md` — Strategy objectives
- `risk-protocols.md` — Risk management rules
- `execution.md` — Order handling
- `backtesting.md` — Validation methodology

---

## 🚦 STATUS LOG

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-02-03 | 1.0.0 | Initial tech stack definition | OpenClaw v2.0 |
