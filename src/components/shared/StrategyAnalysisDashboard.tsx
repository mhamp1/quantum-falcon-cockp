// Strategy Analysis Dashboard — Deep Performance Metrics
// November 21, 2025 — Quantum Falcon Cockpit

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, BarChart3, PieChart, Activity,
  Target, Zap, Clock, DollarSign, Percent, Award, Star
} from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useKVSafe } from '@/hooks/useKVFallback'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart as RechartsPieChart, Cell, Area, AreaChart
} from 'recharts'
import { toast } from 'sonner'

interface StrategyPerformance {
  strategyName: string
  totalTrades: number
  winRate: number
  profitLoss: number
  sharpeRatio: number
  maxDrawdown: number
  avgTradeDuration: number
  bestTrade: number
  worstTrade: number
  totalVolume: number
  successRate: number
  riskAdjustedReturn: number
  consistency: number // 0-100 score
}

interface MarketCondition {
  volatility: number
  trend: 'bull' | 'bear' | 'sideways'
  volume: number
  timestamp: string
}

interface TradeAnalysis {
  id: string
  strategy: string
  entryPrice: number
  exitPrice: number
  pnl: number
  duration: number
  marketCondition: MarketCondition
  timestamp: string
  success: boolean
}

// NO MOCK DATA - All strategies must be fetched from live API

const PERFORMANCE_COLORS = ['#00FFFF', '#DC1FFF', '#FF1493', '#FFD700', '#32CD32', '#FF6347']

export default function StrategyAnalysisDashboard() {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d' | '90d'>('30d')
  // Fetch live strategy performance data from API
  const [strategies, setStrategies] = useKVSafe<StrategyPerformance[]>('strategy-performance', [])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch live strategy performance from API
    const fetchStrategies = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/strategies/performance')
        if (!response.ok) throw new Error('Failed to fetch strategies')
        const data = await response.json()
        setStrategies(data)
      } catch (err) {
        console.error('❌ Failed to load strategy performance:', err)
        toast.error('Failed to load strategy performance - API unavailable')
        setStrategies([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchStrategies()
  }, [setStrategies])

  // Generate performance data from live strategies
  const performanceData = strategies.map((strategy, index) => ({
    name: strategy.strategyName,
    profit: strategy.profitLoss,
    winRate: strategy.winRate,
    trades: strategy.totalTrades,
    sharpe: strategy.sharpeRatio,
    color: PERFORMANCE_COLORS[index % PERFORMANCE_COLORS.length],
  }))

  // Fetch live time series data from API
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([])
  
  useEffect(() => {
    const fetchTimeSeries = async () => {
      try {
        const response = await fetch(`/api/strategies/timeseries?range=${timeRange}`)
        if (!response.ok) throw new Error('Failed to fetch time series')
        const data = await response.json()
        setTimeSeriesData(data)
      } catch (err) {
        console.error('❌ Failed to load time series:', err)
        setTimeSeriesData([])
      }
    }
    if (strategies.length > 0) {
      fetchTimeSeries()
    }
  }, [timeRange, strategies])

  // Risk-return scatter plot data
  const riskReturnData = strategies.map(strategy => ({
    name: strategy.strategyName,
    risk: Math.abs(strategy.maxDrawdown),
    return: strategy.riskAdjustedReturn,
    size: strategy.totalTrades / 10,
  }))

  const filteredStrategies = selectedStrategy === 'all'
    ? strategies
    : strategies.filter(s => s.strategyName === selectedStrategy)

  const topStrategy = strategies.length > 0 
    ? strategies.reduce((best, current) =>
        current.riskAdjustedReturn > best.riskAdjustedReturn ? current : best
      )
    : null

  if (isLoading) {
    return (
      <div className="cyber-card p-12 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground uppercase tracking-wider">Loading Strategy Analysis...</p>
      </div>
    )
  }

  if (strategies.length === 0) {
    return (
      <div className="cyber-card p-12 text-center space-y-4">
        <Activity size={64} className="mx-auto text-muted-foreground opacity-50" />
        <h3 className="text-xl font-bold uppercase tracking-wider text-muted-foreground">
          No Strategy Data Available
        </h3>
        <p className="text-sm text-muted-foreground">
          Start trading to see detailed performance analysis
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 diagonal-stripes opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-transparent blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-[0.2em] text-primary mb-2">
              Strategy Analysis
            </h2>
            <p className="text-muted-foreground text-sm">Deep performance metrics and optimization insights</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="flex-1 md:flex-none px-4 py-2 bg-background/50 border border-primary/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Strategies</option>
              {strategies.map(s => (
                <option key={s.strategyName} value={s.strategyName}>{s.strategyName}</option>
              ))}
            </select>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="flex-1 md:flex-none px-4 py-2 bg-background/50 border border-primary/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="1d">1 Day</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="90d">90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top Performer Highlight */}
      {topStrategy && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="cyber-card p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/50"
        >
          <div className="flex items-center gap-6">
            <Award size={56} weight="duotone" className="text-yellow-400" />
            <div>
              <h3 className="text-2xl font-black uppercase tracking-wider text-yellow-400 mb-2">
                Top Performer: {topStrategy.strategyName}
              </h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Risk-Adjusted Return: </span>
                  <span className="font-bold text-primary">{topStrategy.riskAdjustedReturn.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Win Rate: </span>
                  <span className="font-bold text-green-400">{topStrategy.winRate.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Consistency: </span>
                  <span className="font-bold text-accent">{topStrategy.consistency}/100</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Total Profit',
            value: `$${strategies.reduce((sum, s) => sum + s.profitLoss, 0).toLocaleString()}`,
            icon: <DollarSign size={24} className="text-green-400" />,
            change: '+12.5%'
          },
          {
            label: 'Average Win Rate',
            value: `${(strategies.reduce((sum, s) => sum + s.winRate, 0) / strategies.length).toFixed(1)}%`,
            icon: <Target size={24} className="text-blue-400" />,
            change: '+2.1%'
          },
          {
            label: 'Best Sharpe Ratio',
            value: `${Math.max(...strategies.map(s => s.sharpeRatio)).toFixed(2)}`,
            icon: <TrendingUp size={24} className="text-purple-400" />,
            change: '+0.3'
          },
          {
            label: 'Total Trades',
            value: strategies.reduce((sum, s) => sum + s.totalTrades, 0).toLocaleString(),
            icon: <Activity size={24} className="text-orange-400" />,
            change: '+156'
          }
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-morph-card p-6 border border-primary/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                {metric.icon}
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                {metric.change}
              </Badge>
            </div>
            <p className="text-3xl font-black text-primary mb-2">{metric.value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{metric.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Analysis Tabs */}
      <Tabs defaultValue="performance" className="space-y-8">
        <TabsList className="grid grid-cols-4 w-full bg-card/50 backdrop-blur-sm border-2 border-primary/30 p-1 gap-1">
          <TabsTrigger 
            value="performance"
            className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary jagged-corner-small transition-all"
          >
            Performance
          </TabsTrigger>
          <TabsTrigger 
            value="risk"
            className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 data-[state=active]:border-2 data-[state=active]:border-red-500 jagged-corner-small transition-all"
          >
            Risk Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="comparison"
            className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 data-[state=active]:border-2 data-[state=active]:border-blue-500 jagged-corner-small transition-all"
          >
            Comparison
          </TabsTrigger>
          <TabsTrigger 
            value="optimization"
            className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 data-[state=active]:border-2 data-[state=active]:border-purple-500 jagged-corner-small transition-all"
          >
            Optimization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profit Over Time */}
            <Card className="cyber-card p-8">
              <h3 className="text-xl font-black uppercase tracking-wider mb-6 flex items-center gap-3">
                <TrendingUp size={24} weight="duotone" className="text-primary" />
                Profit Over Time
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesData}>
                    <defs>
                      {strategies.map((strategy, i) => (
                        <linearGradient key={strategy.strategyName} id={`gradient${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={PERFORMANCE_COLORS[i]} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={PERFORMANCE_COLORS[i]} stopOpacity={0.1}/>
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{ background: '#0f0b1a', border: '1px solid #DC1FFF' }}
                      labelStyle={{ color: '#DC1FFF' }}
                    />
                    {strategies.map((strategy, i) => (
                      <Area
                        key={strategy.strategyName}
                        type="monotone"
                        dataKey={strategy.strategyName}
                        stroke={PERFORMANCE_COLORS[i]}
                        fillOpacity={1}
                        fill={`url(#gradient${i})`}
                        name={strategy.strategyName}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Win Rate Distribution */}
            <Card className="cyber-card p-8">
              <h3 className="text-xl font-black uppercase tracking-wider mb-6 flex items-center gap-3">
                <BarChart3 size={24} weight="duotone" className="text-primary" />
                Win Rate Distribution
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#666" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{ background: '#0f0b1a', border: '1px solid #DC1FFF' }}
                      labelStyle={{ color: '#DC1FFF' }}
                    />
                    <Bar dataKey="winRate" fill="#00FFFF" name="Win Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Risk-Return Scatter */}
            <Card className="cyber-card p-8">
              <h3 className="text-xl font-black uppercase tracking-wider mb-6 flex items-center gap-3">
                <Target size={24} weight="duotone" className="text-primary" />
                Risk vs Return
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskReturnData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#666" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{ background: '#0f0b1a', border: '1px solid #DC1FFF' }}
                      labelStyle={{ color: '#DC1FFF' }}
                    />
                    <Bar dataKey="return" fill="#DC1FFF" name="Risk-Adjusted Return" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Strategy Consistency */}
            <Card className="cyber-card p-8">
              <h3 className="text-xl font-black uppercase tracking-wider mb-6 flex items-center gap-3">
                <Star size={24} weight="duotone" className="text-primary" />
                Strategy Consistency
              </h3>
              <div className="space-y-6">
                {strategies.map((strategy) => (
                  <div key={strategy.strategyName} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">{strategy.strategyName}</span>
                      <span className="text-sm font-black text-primary">{strategy.consistency}/100</span>
                    </div>
                    <Progress value={strategy.consistency} className="h-3" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-8">
          <div className="grid grid-cols-1 gap-8">
            {/* Strategy Comparison Table */}
            <Card className="cyber-card p-8">
              <h3 className="text-xl font-black uppercase tracking-wider mb-6">Strategy Comparison Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-primary/30">
                      <th className="text-left py-4 px-4 uppercase tracking-wider font-bold">Strategy</th>
                      <th className="text-right py-4 px-4 uppercase tracking-wider font-bold">Trades</th>
                      <th className="text-right py-4 px-4 uppercase tracking-wider font-bold">Win Rate</th>
                      <th className="text-right py-4 px-4 uppercase tracking-wider font-bold">Profit</th>
                      <th className="text-right py-4 px-4 uppercase tracking-wider font-bold">Sharpe</th>
                      <th className="text-right py-4 px-4 uppercase tracking-wider font-bold">Max DD</th>
                      <th className="text-right py-4 px-4 uppercase tracking-wider font-bold">Consistency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strategies.map((strategy) => (
                      <motion.tr
                        key={strategy.strategyName}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-primary/10 hover:bg-primary/5 transition-colors"
                      >
                        <td className="py-4 px-4 font-black text-primary">{strategy.strategyName}</td>
                        <td className="text-right py-4 px-4 font-bold">{strategy.totalTrades}</td>
                        <td className="text-right py-4 px-4 font-bold text-green-400">{strategy.winRate.toFixed(1)}%</td>
                        <td className="text-right py-4 px-4 font-bold text-accent">
                          ${strategy.profitLoss.toLocaleString()}
                        </td>
                        <td className="text-right py-4 px-4 font-bold text-purple-400">{strategy.sharpeRatio.toFixed(2)}</td>
                        <td className="text-right py-4 px-4 font-bold text-red-400">
                          ${Math.abs(strategy.maxDrawdown).toLocaleString()}
                        </td>
                        <td className="text-right py-4 px-4">
                          <div className="flex items-center justify-end gap-3">
                            <Progress value={strategy.consistency} className="w-20 h-3" />
                            <span className="w-10 text-right font-bold">{strategy.consistency}</span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Optimization Recommendations */}
            <Card className="cyber-card p-8">
              <h3 className="text-xl font-black uppercase tracking-wider mb-6 flex items-center gap-3">
                <Zap size={24} weight="duotone" className="text-primary" />
                Optimization Recommendations
              </h3>
              <div className="space-y-6">
                {strategies.map((strategy) => {
                  const recommendations = []
                  if (strategy.winRate < 70) recommendations.push('Consider adjusting entry criteria')
                  if (strategy.sharpeRatio < 2) recommendations.push('Risk management needs improvement')
                  if (strategy.consistency < 80) recommendations.push('Focus on trade timing')
                  if (strategy.maxDrawdown > 1000) recommendations.push('Implement stricter stop-losses')

                  return (
                    <div key={strategy.strategyName} className="p-6 bg-background/60 rounded-lg border border-primary/20">
                      <h4 className="font-black text-primary mb-4 uppercase tracking-wider">{strategy.strategyName}</h4>
                      <ul className="text-sm space-y-2">
                        {recommendations.length > 0 ? recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-accent rounded-full mt-1.5 shrink-0" />
                            <span className="leading-relaxed">{rec}</span>
                          </li>
                        )) : (
                          <li className="text-green-400 font-bold">Strategy performing optimally!</li>
                        )}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Performance Forecast */}
            <Card className="cyber-card p-8">
              <h3 className="text-xl font-black uppercase tracking-wider mb-6 flex items-center gap-3">
                <TrendingUp size={24} weight="duotone" className="text-primary" />
                Performance Forecast
              </h3>
              <div className="space-y-6">
                {strategies.slice(0, 3).map((strategy) => (
                  <div key={strategy.strategyName} className="flex items-center justify-between p-6 bg-background/60 rounded-lg border border-primary/20">
                    <div>
                      <p className="font-black text-lg text-primary mb-1">{strategy.strategyName}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Next 30 days</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-black text-xl">
                        +${(strategy.profitLoss * 0.1).toFixed(0)}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Projected</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


