// AI Optimization Panel — Live Strategy Optimization
// November 26, 2025 — Quantum Falcon Cockpit

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, TrendingUp, Zap, Target, Gauge, Activity } from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface OptimizationMetrics {
  confidence: number
  expectedROI: number
  riskScore: number
  optimizationProgress: number
  suggestions: string[]
}

export default function AIOptimizationPanel() {
  const [metrics, setMetrics] = useState<OptimizationMetrics>({
    confidence: 0,
    expectedROI: 0,
    riskScore: 0,
    optimizationProgress: 0,
    suggestions: []
  })

  const [isTraining, setIsTraining] = useState(false)

  useEffect(() => {
    // Simulate AI optimization training
    setIsTraining(true)
    const interval = setInterval(() => {
      setMetrics(prev => ({
        confidence: Math.min(100, prev.confidence + Math.random() * 5),
        expectedROI: prev.expectedROI + Math.random() * 2,
        riskScore: Math.max(0, prev.riskScore - Math.random() * 0.5),
        optimizationProgress: Math.min(100, prev.optimizationProgress + Math.random() * 3),
        suggestions: [
          'Consider adding stop-loss at -5%',
          'RSI threshold optimized to 30/70',
          'Volume filter improved by 12%'
        ]
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="border-4 border-purple-500/50 bg-gradient-to-br from-purple-900/20 to-black/50">
      <CardHeader>
        <CardTitle className="text-2xl font-black uppercase text-purple-400 flex items-center gap-3">
          <Brain size={32} weight="duotone" />
          AI OPTIMIZATION
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Training Status */}
        {isTraining && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-purple-300 text-sm uppercase">Training Progress</span>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50 animate-pulse">
                <Activity size={16} className="mr-2" />
                ACTIVE
              </Badge>
            </div>
            <Progress value={metrics.optimizationProgress} className="h-3" />
            <p className="text-xs text-purple-400 text-right">
              {metrics.optimizationProgress.toFixed(0)}%
            </p>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-black/40 rounded-lg border border-purple-500/30">
            <Gauge size={32} className="mx-auto mb-2 text-purple-400" />
            <p className="text-gray-400 text-xs uppercase">Confidence</p>
            <p className="text-3xl font-black text-purple-400">
              {metrics.confidence.toFixed(0)}%
            </p>
          </div>
          <div className="text-center p-4 bg-black/40 rounded-lg border border-green-500/30">
            <TrendingUp size={32} className="mx-auto mb-2 text-green-400" />
            <p className="text-gray-400 text-xs uppercase">Expected ROI</p>
            <p className="text-3xl font-black text-green-400">
              +{metrics.expectedROI.toFixed(1)}%
            </p>
          </div>
          <div className="text-center p-4 bg-black/40 rounded-lg border border-yellow-500/30">
            <Target size={32} className="mx-auto mb-2 text-yellow-400" />
            <p className="text-gray-400 text-xs uppercase">Risk Score</p>
            <p className="text-3xl font-black text-yellow-400">
              {metrics.riskScore.toFixed(1)}
            </p>
          </div>
          <div className="text-center p-4 bg-black/40 rounded-lg border border-cyan-500/30">
            <Zap size={32} className="mx-auto mb-2 text-cyan-400" />
            <p className="text-gray-400 text-xs uppercase">Optimization</p>
            <p className="text-3xl font-black text-cyan-400">
              {metrics.optimizationProgress.toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Suggestions */}
        {metrics.suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-purple-300 text-sm uppercase font-bold">AI Suggestions</p>
            <div className="space-y-2">
              {metrics.suggestions.map((suggestion, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-sm text-purple-200"
                >
                  • {suggestion}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

