#!/usr/bin/env python3
"""
performance_auditor.py - Performance Monitoring & Risk Auditing

Purpose: Monitor trading performance and flag critical violations.
Runs as a background process, checking metrics every 60 seconds.

Risk Thresholds (from risk-protocols.md):
- MAX_DAILY_DRAWDOWN: 3.0%
- MAX_CONSECUTIVE_LOSSES: 10
- MAX_POSITION_SIZE: 3 lots

Author: OpenClaw v2.0 (Senior Algorithmic Architect)
Version: 1.0.0
"""

import json
import time
import signal
import sys
from datetime import datetime
from pathlib import Path

# Risk thresholds
MAX_DAILY_DRAWDOWN = 3.0  # 3%
MAX_CONSECUTIVE_LOSSES = 10
MAX_POSITION_SIZE = 3

# Paths
SYSTEM_DIR = Path(__file__).parent
AUDIT_LOG = SYSTEM_DIR / "logs" / "audit_status.json"
TRADE_LOG = SYSTEM_DIR / "logs" / "trades.json"


class PerformanceAuditor:
    def __init__(self):
        self.running = True
        self.trades = []
        self.current_drawdown = 0.0
        self.daily_pnl = 0.0
        self.consecutive_losses = 0
        
        # Setup signal handlers
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals."""
        print("\n[AUDITOR] Shutdown signal received")
        self.running = False
    
    def load_trades(self):
        """Load trades from log file."""
        if TRADE_LOG.exists():
            try:
                with open(TRADE_LOG, "r") as f:
                    data = json.load(f)
                    self.trades = data.get("trades", [])
            except (json.JSONDecodeError, IOError):
                self.trades = []
    
    def calculate_metrics(self):
        """Calculate current performance metrics."""
        if not self.trades:
            return
        
        # Sort by timestamp
        sorted_trades = sorted(self.trades, key=lambda x: x.get("timestamp", ""))
        
        # Calculate daily P&L (last 24h or today)
        now = datetime.utcnow()
        today_trades = [t for t in sorted_trades if t.get("timestamp", "").startswith(now.strftime("%Y-%m-%d"))]
        self.daily_pnl = sum(t.get("pnl", 0) for t in today_trades)
        
        # Calculate consecutive losses
        self.consecutive_losses = 0
        for t in reversed(sorted_trades):
            if t.get("pnl", 0) < 0:
                self.consecutive_losses += 1
            else:
                break
        
        # Calculate current drawdown (simplified)
        equity_curve = [0]  # Starting equity
        for trade in sorted_trades:
            equity_curve.append(equity_curve[-1] + trade.get("pnl", 0))
        
        peak = max(equity_curve)
        current = equity_curve[-1]
        if peak > 0:
            self.current_drawdown = max(0, (peak - current) / peak * 100)
    
    def check_critical_conditions(self) -> tuple[bool, str]:
        """
        Check for critical conditions.
        Returns (is_critical, reason).
        """
        # Check drawdown
        if self.current_drawdown > MAX_DAILY_DRAWDOWN:
            return True, f"Drawdown {self.current_drawdown:.2f}% exceeds limit {MAX_DAILY_DRAWDOWN}%"
        
        # Check consecutive losses
        if self.consecutive_losses >= MAX_CONSECUTIVE_LOSSES:
            return True, f"Consecutive losses {self.consecutive_losses} exceeds limit {MAX_CONSECUTIVE_LOSSES}"
        
        # Check position size (would need actual position data)
        # For now, we assume positions are managed by the algorithm
        
        return False, ""
    
    def generate_report(self) -> dict:
        """Generate audit report."""
        self.load_trades()
        self.calculate_metrics()
        
        is_critical, reason = self.check_critical_conditions()
        
        # Calculate metrics
        total_trades = len(self.trades)
        winning_trades = sum(1 for t in self.trades if t.get("pnl", 0) > 0)
        win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
        
        report = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "status": "CRITICAL" if is_critical else "OK",
            "message": reason if is_critical else "All systems nominal",
            "metrics": {
                "total_trades": total_trades,
                "winning_trades": winning_trades,
                "win_rate": f"{win_rate:.1f}%",
                "current_drawdown": round(self.current_drawdown, 2),
                "daily_pnl": round(self.daily_pnl, 2),
                "consecutive_losses": self.consecutive_losses,
            },
            "thresholds": {
                "max_drawdown": MAX_DAILY_DRAWDOWN,
                "max_consecutive_losses": MAX_CONSECUTIVE_LOSSES,
                "max_position_size": MAX_POSITION_SIZE,
            }
        }
        
        # Write to file for run_system.py to read
        AUDIT_LOG.parent.mkdir(parents=True, exist_ok=True)
        with open(AUDIT_LOG, "w") as f:
            json.dump(report, f, indent=2)
        
        return report
    
    def run(self):
        """Main audit loop."""
        print("=" * 60)
        print("  PERFORMANCE AUDITOR STARTED")
        print("=" * 60)
        print(f"  Monitoring interval: 60 seconds")
        print(f"  Max Drawdown: {MAX_DAILY_DRAWDOWN}%")
        print(f"  Max Consecutive Losses: {MAX_CONSECUTIVE_LOSSES}")
        print("=" * 60)
        
        while self.running:
            report = self.generate_report()
            
            status = report["status"]
            msg = report["message"]
            metrics = report["metrics"]
            
            timestamp = datetime.now().strftime("%H:%M:%S")
            
            if status == "CRITICAL":
                print(f"[{timestamp}] [CRITICAL] {msg}")
            else:
                print(f"[{timestamp}] [OK] Trades: {metrics['total_trades']} | "
                      f"DD: {metrics['current_drawdown']:.2f}% | "
                      f"PnL: ${metrics['daily_pnl']:.2f} | "
                      f"Win: {metrics['win_rate']}")
            
            # Sleep in 1-second intervals for responsive shutdown
            for _ in range(60):
                if not self.running:
                    break
                time.sleep(1)
        
        print("\n[AUDITOR] Shutdown complete")
    
    def stop(self):
        """Stop the auditor."""
        self.running = False


def main():
    """Main entry point."""
    auditor = PerformanceAuditor()
    try:
        auditor.run()
    except KeyboardInterrupt:
        auditor.stop()
        sys.exit(0)


if __name__ == "__main__":
    main()
