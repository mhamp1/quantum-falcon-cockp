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

const MOCK_STRATEGIES: StrategyPerformance[] = [
  {
    strategyName: 'Whale Shadow',
    totalTrades: 247,
    winRate: 78.5,
    profitLoss: 15420.50,
    sharpeRatio: 2.34,
    maxDrawdown: -1250.00,
    avgTradeDuration: 45, // minutes
    bestTrade: 2340.00,
    worstTrade: -890.00,
    totalVolume: 892000,
    successRate: 82.1,
    riskAdjustedReturn: 1.67,
    consistency: 89,
  },
  {
    strategyName: 'Momentum Tsunami',
    totalTrades: 189,
    winRate: 71.2,
    profitLoss: 9870.25,
    sharpeRatio: 1.89,
    maxDrawdown: -2100.00,
    avgTradeDuration: 62,
    bestTrade: 3120.00,
    worstTrade: -1450.00,
    totalVolume: 654000,
    successRate: 75.8,
    riskAdjustedReturn: 1.42,
    consistency: 76,
  },
  {
    strategyName: 'Flash Crash Hunter',
    totalTrades: 98,
    winRate: 85.7,
    profitLoss: 22340.75,
    sharpeRatio: 3.12,
    maxDrawdown: -980.00,
    avgTradeDuration: 12,
    bestTrade: 5670.00,
    worstTrade: -320.00,
    totalVolume: 445000,
    successRate: 89.3,
    riskAdjustedReturn: 2.89,
    consistency: 94,
  },
  {
    strategyName: 'Arbitrage Phantom',
    totalTrades: 156,
    winRate: 92.3,
    profitLoss: 18750.00,
    sharpeRatio: 4.56,
    maxDrawdown: -450.00,
    avgTradeDuration: 8,
    bestTrade: 1250.00,
    worstTrade: -120.00,
    totalVolume: 234000,
    successRate: 94.7,
    riskAdjustedReturn: 3.21,
    consistency: 98,
  },
]

const PERFORMANCE_COLORS = ['#00FFFF', '#DC1FFF', '#FF1493', '#FFD700', '#32CD32', '#FF6347']

export default function StrategyAnalysisDashboard() {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d' | '90d'>('30d')
  const [strategies] = useKVSafe<StrategyPerformance[]>('strategy-performance', MOCK_STRATEGIES)

  // Generate mock performance data
  const performanceData = strategies.map((strategy, index) => ({
    name: strategy.strategyName,
    profit: strategy.profitLoss,
    winRate: strategy.winRate,
    trades: strategy.totalTrades,
    sharpe: strategy.sharpeRatio,
    color: PERFORMANCE_COLORS[index % PERFORMANCE_COLORS.length],
  }))

  // Generate mock time series data
  const timeSeriesData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    'Whale Shadow': Math.random() * 1000 + 500,
    'Momentum Tsunami': Math.random() * 800 + 300,
    'Flash Crash Hunter': Math.random() * 1200 + 800,
    'Arbitrage Phantom': Math.random() * 600 + 400,
  }))

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

  const topStrategy = strategies.reduce((best, current) =>
    current.riskAdjustedReturn > best.riskAdjustedReturn ? current : best
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-wider text-primary">
            Strategy Analysis
          </h2>
          <p className="text-muted-foreground">Deep performance metrics and optimization insights</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value)}
            className="cyber-input px-3 py-2"
          >
            <option value="all">All Strategies</option>
            {strategies.map(s => (
              <option key={s.strategyName} value={s.strategyName}>{s.strategyName}</option>
            ))}
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="cyber-input px-3 py-2"
          >
            <option value="1d">1 Day</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
          </select>
        </div>
      </div>

      {/* Top Performer Highlight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/50"
      >
        <div className="flex items-center gap-4">
          <Award size={48} className="text-yellow-400" />
          <div>
            <h3 className="text-xl font-bold text-yellow-400">Top Performer: {topStrategy.strategyName}</h3>
            <p className="text-muted-foreground">
              Risk-Adjusted Return: {topStrategy.riskAdjustedReturn.toFixed(2)} •
              Win Rate: {topStrategy.winRate.toFixed(1)}% •
              Consistency: {topStrategy.consistency}/100
            </p>
          </div>
        </div>
      </motion.div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            className="cyber-card p-4"
          >
            <div className="flex items-center justify-between mb-2">
              {metric.icon}
              <Badge className="bg-green-500/20 text-green-400 text-xs">
                {metric.change}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-primary">{metric.value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{metric.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Analysis Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit Over Time */}
            <Card className="cyber-card p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp size={20} />
                Profit Over Time
              </h3>
              <div className="h-64">
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
            <Card className="cyber-card p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Win Rate Distribution
              </h3>
              <div className="h-64">
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

        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk-Return Scatter */}
            <Card className="cyber-card p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Target size={20} />
                Risk vs Return
              </h3>
              <div className="h-64">
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
            <Card className="cyber-card p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Star size={20} />
                Strategy Consistency
              </h3>
              <div className="space-y-4">
                {strategies.map((strategy) => (
                  <div key={strategy.strategyName} className="flex items-center gap-4">
                    <div className="w-32 text-sm truncate">{strategy.strategyName}</div>
                    <Progress value={strategy.consistency} className="flex-1" />
                    <span className="text-sm font-bold w-12 text-right">{strategy.consistency}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Strategy Comparison Table */}
            <Card className="cyber-card p-6">
              <h3 className="text-lg font-bold mb-4">Strategy Comparison Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-primary/30">
                      <th className="text-left py-2">Strategy</th>
                      <th className="text-right py-2">Trades</th>
                      <th className="text-right py-2">Win Rate</th>
                      <th className="text-right py-2">Profit</th>
                      <th className="text-right py-2">Sharpe</th>
                      <th className="text-right py-2">Max DD</th>
                      <th className="text-right py-2">Consistency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strategies.map((strategy) => (
                      <motion.tr
                        key={strategy.strategyName}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-primary/10 hover:bg-primary/5"
                      >
                        <td className="py-3 font-bold text-primary">{strategy.strategyName}</td>
                        <td className="text-right py-3">{strategy.totalTrades}</td>
                        <td className="text-right py-3 text-green-400">{strategy.winRate.toFixed(1)}%</td>
                        <td className="text-right py-3 text-accent">
                          ${strategy.profitLoss.toLocaleString()}
                        </td>
                        <td className="text-right py-3 text-purple-400">{strategy.sharpeRatio.toFixed(2)}</td>
                        <td className="text-right py-3 text-red-400">
                          ${Math.abs(strategy.maxDrawdown).toLocaleString()}
                        </td>
                        <td className="text-right py-3">
                          <div className="flex items-center gap-2">
                            <Progress value={strategy.consistency} className="w-16 h-2" />
                            <span className="w-8 text-right">{strategy.consistency}</span>
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

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Optimization Recommendations */}
            <Card className="cyber-card p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Zap size={20} />
                Optimization Recommendations
              </h3>
              <div className="space-y-4">
                {strategies.map((strategy) => {
                  const recommendations = []
                  if (strategy.winRate < 70) recommendations.push('Consider adjusting entry criteria')
                  if (strategy.sharpeRatio < 2) recommendations.push('Risk management needs improvement')
                  if (strategy.consistency < 80) recommendations.push('Focus on trade timing')
                  if (strategy.maxDrawdown > 1000) recommendations.push('Implement stricter stop-losses')

                  return (
                    <div key={strategy.strategyName} className="p-4 bg-background/60 rounded-lg">
                      <h4 className="font-bold text-primary mb-2">{strategy.strategyName}</h4>
                      <ul className="text-sm space-y-1">
                        {recommendations.length > 0 ? recommendations.map((rec, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                            {rec}
                          </li>
                        )) : (
                          <li className="text-green-400">Strategy performing optimally!</li>
                        )}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Performance Forecast */}
            <Card className="cyber-card p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp size={20} />
                Performance Forecast
              </h3>
              <div className="space-y-4">
                {strategies.slice(0, 3).map((strategy) => (
                  <div key={strategy.strategyName} className="flex items-center justify-between p-3 bg-background/60 rounded-lg">
                    <div>
                      <p className="font-bold text-sm">{strategy.strategyName}</p>
                      <p className="text-xs text-muted-foreground">Next 30 days</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">
                        +${(strategy.profitLoss * 0.1).toFixed(0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Projected</p>
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


