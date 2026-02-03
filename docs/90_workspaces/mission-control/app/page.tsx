'use client'

import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'

// Types
interface SignalData {
  signal_id: string
  timestamp: string
  symbol: string
  contract: string
  price_data: {
    bid: number
    ask: number
    last: number
    volume: number
  }
  bollinger_bands: {
    upper: number
    middle: number
    lower: number
    z_score: number
  }
  confidence: {
    score: number
    signal: 'STRONG_BUY' | 'WEAK_BUY' | 'HOLD' | 'WEAK_SELL' | 'STRONG_SELL'
    distance_to_band: number
    volatility_regime: string
  }
  trade_id: string
  status: string
  risk_metrics: {
    stop_loss: number
    take_profit: number
    risk_reward_ratio: number
    position_size: number
  }
  connection_health: {
    websocket_connected: boolean
    last_heartbeat: string
    latency_ms: number
    data_quality: string
  }
}

interface TerminalLog {
  timestamp: string
  message: string
  type: 'info' | 'signal' | 'warning' | 'error' | 'success'
}

// Dummy data generator
const generateDummySignal = (): SignalData => {
  const basePrice = 5840 + (Math.random() - 0.5) * 50
  const zScore = (Math.random() - 0.5) * 4
  const confidence = Math.max(0, Math.min(100, 50 - zScore * 15))
  
  let signal: SignalData['confidence']['signal'] = 'HOLD'
  if (confidence >= 70) signal = 'STRONG_BUY'
  else if (confidence >= 55) signal = 'WEAK_BUY'
  else if (confidence >= 45) signal = 'HOLD'
  else if (confidence >= 30) signal = 'WEAK_SELL'
  else signal = 'STRONG_SELL'
  
  return {
    signal_id: `sig-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    symbol: '@ES',
    contract: 'ESH6',
    price_data: {
      bid: basePrice - 0.25,
      ask: basePrice + 0.25,
      last: basePrice,
      volume: Math.floor(Math.random() * 10000) + 5000
    },
    bollinger_bands: {
      upper: basePrice + 10 + Math.random() * 5,
      middle: basePrice,
      lower: basePrice - 10 - Math.random() * 5,
      z_score: zScore
    },
    confidence: {
      score: confidence,
      signal: signal,
      distance_to_band: Math.abs(zScore),
      volatility_regime: Math.random() > 0.7 ? 'HIGH' : 'NORMAL'
    },
    trade_id: `trade-ESH6-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    status: 'PENDING',
    risk_metrics: {
      stop_loss: basePrice * 0.98,
      take_profit: basePrice * 1.03,
      risk_reward_ratio: 1.5,
      position_size: 2
    },
    connection_health: {
      websocket_connected: true,
      last_heartbeat: new Date().toISOString(),
      latency_ms: Math.floor(Math.random() * 50) + 20,
      data_quality: 'EXCELLENT'
    }
  }
}

const generateLogMessage = (signal: SignalData): TerminalLog => {
  const messages = [
    `Market data update: ${signal.price_data.last.toFixed(2)}`,
    `Bollinger Bands calculated: [${signal.bollinger_bands.lower.toFixed(0)} - ${signal.bollinger_bands.middle.toFixed(0)} - ${signal.bollinger_bands.upper.toFixed(0)}]`,
    `Z-Score: ${signal.bollinger_bands.z_score.toFixed(2)}`,
    `Confidence: ${signal.confidence.score.toFixed(1)}%`,
    `Signal generated: ${signal.confidence.signal}`,
    `Trade ID: ${signal.trade_id}`,
  ]
  return {
    timestamp: new Date().toISOString(),
    message: messages[Math.floor(Math.random() * messages.length)],
    type: 'info'
  }
}

export default function MissionControl() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [signal, setSignal] = useState<SignalData | null>(null)
  const [logs, setLogs] = useState<TerminalLog[]>([])
  const [autoExecution, setAutoExecution] = useState(false)
  const [isEmergencyKill, setIsEmergencyKill] = useState(false)
  const [systemStatus, setSystemStatus] = useState<'online' | 'offline' | 'warning'>('online')
  const logsEndRef = useRef<HTMLDivElement>(null)

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Signal updates (simulated)
  useEffect(() => {
    if (!autoExecution || isEmergencyKill) return
    
    const interval = setInterval(() => {
      const newSignal = generateDummySignal()
      setSignal(newSignal)
      
      // Add to logs
      const newLog: TerminalLog = {
        timestamp: new Date().toISOString(),
        message: `SIGNAL: ${newSignal.confidence.signal} @ ${newSignal.price_data.last.toFixed(2)} | CONFIDENCE: ${newSignal.confidence.score.toFixed(1)}%`,
        type: 'signal'
      }
      setLogs(prev => [...prev.slice(-99), newLog])
    }, 2000)
    
    return () => clearInterval(interval)
  }, [autoExecution, isEmergencyKill])

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // Initial signal
  useEffect(() => {
    const initialSignal = generateDummySignal()
    setSignal(initialSignal)
    setLogs([
      { timestamp: new Date().toISOString(), message: 'Mission Control initialized', type: 'success' },
      { timestamp: new Date().toISOString(), message: `Connected to data feed: ${initialSignal.symbol}`, type: 'info' },
      { timestamp: new Date().toISOString(), message: `Bollinger Bands Period: 20, Std: 2.0`, type: 'info' },
      { timestamp: new Date().toISOString(), message: `Strategy: Intraday Mean Reversion`, type: 'info' },
    ])
  }, [])

  const handleEmergencyKill = () => {
    setIsEmergencyKill(true)
    setAutoExecution(false)
    setSystemStatus('offline')
    setLogs(prev => [
      ...prev.slice(-99),
      { timestamp: new Date().toISOString(), message: '!!! EMERGENCY KILL TRIGGERED !!!', type: 'error' },
      { timestamp: new Date().toISOString(), message: 'All positions closed', type: 'error' },
      { timestamp: new Date().toISOString(), message: 'Auto-execution disabled', type: 'warning' },
    ])
  }

  const handleResetKill = () => {
    setIsEmergencyKill(false)
    setSystemStatus('online')
    setLogs(prev => [
      ...prev.slice(-99),
      { timestamp: new Date().toISOString(), message: 'System reset. Ready for operations.', type: 'success' },
    ])
  }

  const getSignalColor = (signalType: string) => {
    if (signalType.includes('BUY')) return 'signal-buy'
    if (signalType.includes('SELL')) return 'signal-sell'
    return 'signal-hold'
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 70) return 'from-red-500 via-yellow-500 to-green-500'
    if (score >= 55) return 'from-yellow-500 to-green-500'
    if (score >= 45) return 'from-yellow-500 to-yellow-500'
    if (score >= 30) return 'from-orange-500 to-red-500'
    return 'from-red-500 to-red-500'
  }

  return (
    <div className="min-h-screen grid-bg">
      {/* Header */}
      <header className="border-b border-cyber-gray bg-cyber-dark/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-display font-bold neon-blue glitch" data-text="OPENCLAW MISSION CONTROL">
                OPENCLAW MISSION CONTROL
              </h1>
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-cyber-gray rounded-full">
                <span className={`status-dot ${systemStatus === 'online' ? 'status-online' : systemStatus === 'warning' ? 'status-warning' : 'status-offline'}`}></span>
                <span className="text-xs uppercase tracking-wider">{systemStatus}</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-cyber-accent uppercase tracking-wider">System Time</div>
                <div className="font-mono text-lg">{format(currentTime, 'HH:mm:ss')}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-cyber-accent uppercase tracking-wider">Date</div>
                <div className="font-mono text-sm">{format(currentTime, 'yyyy-MM-dd')}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Signal Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Signal Card */}
            <div className="bg-cyber-dark/60 border border-cyber-gray rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-cyber-gray flex items-center justify-between">
                <h2 className="font-display font-bold text-lg flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyber-accent rounded-full animate-pulse"></span>
                  CURRENT SIGNAL
                </h2>
                <span className="text-xs font-mono text-cyber-info">@ES / ESH6</span>
              </div>
              
              {signal && (
                <div className="p-6">
                  {/* Price Display */}
                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Last Price</div>
                      <div className="text-5xl font-mono font-bold neon-green">
                        ${signal.price_data.last.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Volume</div>
                      <div className="font-mono text-lg">{signal.price_data.volume.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Signal Badge */}
                  <div className={`inline-flex px-6 py-3 rounded-lg ${getSignalColor(signal.confidence.signal)} mb-6`}>
                    <span className={`text-2xl font-display font-bold ${
                      signal.confidence.signal.includes('BUY') ? 'text-cyber-accent' :
                      signal.confidence.signal.includes('SELL') ? 'text-cyber-danger' : 'text-cyber-warning'
                    }`}>
                      {signal.confidence.signal}
                    </span>
                  </div>

                  {/* Confidence Bar */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase tracking-wider text-gray-400">Confidence</span>
                      <span className="font-mono text-lg">{signal.confidence.score.toFixed(1)}%</span>
                    </div>
                    <div className="h-4 bg-cyber-gray rounded-full overflow-hidden">
                      <div 
                        className={`h-full confidence-bar rounded-full transition-all duration-500`}
                        style={{ width: `${signal.confidence.score}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Bollinger Bands */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-cyber-gray/50 rounded-lg">
                      <div className="text-xs text-gray-500 uppercase mb-1">Upper</div>
                      <div className="font-mono text-lg">${signal.bollinger_bands.upper.toFixed(2)}</div>
                    </div>
                    <div className="text-center p-4 bg-cyber-gray/50 rounded-lg">
                      <div className="text-xs text-gray-500 uppercase mb-1">Middle</div>
                      <div className="font-mono text-lg">${signal.bollinger_bands.middle.toFixed(2)}</div>
                    </div>
                    <div className="text-center p-4 bg-cyber-gray/50 rounded-lg">
                      <div className="text-xs text-gray-500 uppercase mb-1">Lower</div>
                      <div className="font-mono text-lg">${signal.bollinger_bands.lower.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Z-Score */}
                  <div className="mt-4 text-center">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Z-Score: </span>
                    <span className={`font-mono ${Math.abs(signal.bollinger_bands.z_score) > 1.5 ? 'text-cyber-accent' : 'text-gray-400'}`}>
                      {signal.bollinger_bands.z_score > 0 ? '+' : ''}{signal.bollinger_bands.z_score.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Control Panel */}
            <div className="bg-cyber-dark/60 border border-cyber-gray rounded-xl p-6">
              <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-cyber-warning rounded-full"></span>
                CONTROL PANEL
              </h2>
              
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setAutoExecution(!autoExecution)}
                  disabled={isEmergencyKill}
                  className={`btn-cyber ${autoExecution ? 'active' : ''} ${isEmergencyKill ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {autoExecution ? '⏸ PAUSE AUTO-EXECUTION' : '▶ START AUTO-EXECUTION'}
                </button>
                
                {isEmergencyKill ? (
                  <button
                    onClick={handleResetKill}
                    className="btn-cyber border-cyber-accent text-cyber-accent"
                  >
                    🔄 RESET SYSTEM
                  </button>
                ) : (
                  <button
                    onClick={handleEmergencyKill}
                    className="btn-kill px-8 py-3 font-bold"
                  >
                    💀 EMERGENCY KILL
                  </button>
                )}
              </div>

              {isEmergencyKill && (
                <div className="mt-4 p-4 bg-cyber-danger/20 border border-cyber-danger rounded-lg">
                  <div className="flex items-center gap-2 text-cyber-danger font-bold">
                    <span className="text-2xl">⚠</span>
                    EMERGENCY KILL ACTIVATED - ALL TRADING HALTED
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live Terminal */}
          <div className="lg:col-span-1">
            <div className="bg-cyber-dark/60 border border-cyber-gray rounded-xl h-[600px] flex flex-col">
              <div className="px-4 py-3 border-b border-cyber-gray flex items-center justify-between">
                <h2 className="font-display font-bold text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyber-accent rounded-full animate-pulse"></span>
                  LIVE TERMINAL
                </h2>
                <span className="text-xs text-gray-500">{logs.length} events</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
                {logs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`terminal-line ${
                      log.type === 'signal' ? 'text-cyber-accent' :
                      log.type === 'error' ? 'text-cyber-danger' :
                      log.type === 'warning' ? 'text-cyber-warning' :
                      log.type === 'success' ? 'text-green-400' :
                      'text-gray-400'
                    }`}
                  >
                    <span className="text-gray-600">[{format(new Date(log.timestamp), 'HH:mm:ss')}]</span>{' '}
                    {log.message}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Stats Bar */}
        {signal && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-cyber-dark/60 border border-cyber-gray rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Stop Loss</div>
              <div className="font-mono text-lg text-cyber-danger">${signal.risk_metrics.stop_loss.toFixed(2)}</div>
            </div>
            <div className="bg-cyber-dark/60 border border-cyber-gray rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Take Profit</div>
              <div className="font-mono text-lg text-cyber-accent">${signal.risk_metrics.take_profit.toFixed(2)}</div>
            </div>
            <div className="bg-cyber-dark/60 border border-cyber-gray rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Risk/Reward</div>
              <div className="font-mono text-lg">{signal.risk_metrics.risk_reward_ratio.toFixed(1)}:1</div>
            </div>
            <div className="bg-cyber-dark/60 border border-cyber-gray rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Position Size</div>
              <div className="font-mono text-lg">{signal.risk_metrics.position_size} lots</div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-6 text-center text-xs text-gray-600">
          <p>OpenClaw Mission Control v1.0 | AlgoTrader Intraday Mean Reversion Strategy</p>
          <p className="mt-1">Bollinger Bands (20, 2.0) | Confidence-based Signal Generation</p>
        </footer>

      </main>
    </div>
  )
}
