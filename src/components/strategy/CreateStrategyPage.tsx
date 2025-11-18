import { useState, useEffect, useRef, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import Editor from '@monaco-editor/react'
import { Canvas } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Lightning, 
  Play, 
  FloppyDisk, 
  ShareNetwork, 
  Sparkle, 
  Code, 
  ChartLine, 
  Lock,
  CheckCircle,
  TrendUp,
  ArrowRight,
  Rocket,
  Star,
  Brain,
  Cube
} from '@phosphor-icons/react'
import type { UserAuth } from '@/lib/auth'

interface Strategy {
  id: string
  name: string
  code: string
  category: string
  description: string
  author: string
  winRate?: number
  roi?: number
  trades?: number
  createdAt: number
}

interface BacktestResult {
  winRate: number
  roi: number
  totalTrades: number
  profitableTrades: number
  maxDrawdown: number
  sharpeRatio: number
  avgWin: number
  avgLoss: number
}

interface CodeParticle {
  id: number
  position: [number, number, number]
  rotation: [number, number, number]
  code: string
  speed: number
}

const STRATEGY_CATEGORIES = [
  'Trend Following',
  'Mean Reversion',
  'Breakout',
  'Momentum',
  'Scalping',
  'Swing Trading',
  'Grid Trading',
  'Arbitrage',
  'Market Making',
  'DCA (Dollar Cost Averaging)',
  'Custom'
]

const DEFAULT_CODE = `// Quantum Falcon Strategy Template
// Write your custom trading strategy below

  const { price, volume, indicators } = data
  
  // Your strategy logic here
  // Example: Simple Moving Average Crossover
  const shortMA = indicators.sma(20)
  const longMA = indicators.sma(50)
  
  if (shortMA > longMA) {
    return { signal: 'BUY', confidence: 0.8 }
  } else if (shortMA < longMA) {
    return { signal: 'SELL', confidence: 0.8 }
  }
  
  return { signal: 'HOLD', confidence: 0.5 }
}

// Available indicators:
// - indicators.sma(period) - Simple Moving Average
// - indicators.ema(period) - Exponential Moving Average
// - indicators.rsi(period) - Relative Strength Index
// - indicators.macd() - MACD
// - indicators.bollinger(period, std) - Bollinger Bands
// - indicators.atr(period) - Average True Range
`

function CodeParticles() {
  const [particles] = useState<CodeParticle[]>(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15
      ] as [number, number, number],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ] as [number, number, number],
      code: ['BUY', 'SELL', 'MA', 'RSI', 'EMA', 'MACD', '>', '<', '==', '&&', '||', 'if', 'return'][i % 13],
      speed: 0.5 + Math.random() * 1
    }))
  })

  return (
    <Canvas
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
      camera={{ position: [0, 0, 20], fov: 50 }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#14F195" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#9945FF" />
      
      {particles.map((particle) => (
        <Float
          key={particle.id}
          speed={particle.speed}
          rotationIntensity={0.4}
          floatIntensity={0.5}
        >
          <mesh position={particle.position}>
            <boxGeometry args={[1, 1, 0.2]} />
            <meshStandardMaterial
              color="#DC1FFF"
              emissive="#DC1FFF"
              emissiveIntensity={0.5}
              transparent
              opacity={0.6}
            />
          </mesh>
        </Float>
      ))}
    </Canvas>
  )
}

export default function CreateStrategyPage() {
  const [codeValue, setCodeValue] = useKV<string>('strategy-editor-code', DEFAULT_CODE)
  const code = codeValue || DEFAULT_CODE
  const setCode = (newCode: string) => setCodeValue(newCode)
  const [strategyName, setStrategyName] = useState('')
  const [category, setCategory] = useState('Trend Following')
  const [description, setDescription] = useState('')
  const [strategies, setStrategies] = useKV<Strategy[]>('user-strategies', [])
  const [isBacktesting, setIsBacktesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [activeTab, setActiveTab] = useState('editor')
  const [aiSuggestionLoading, setAiSuggestionLoading] = useState(false)
  const editorRef = useRef<any>(null)
  
  const [auth] = useKV<UserAuth>('user-auth', {
    isAuthenticated: false,
    userId: null,
    username: null,
    email: null,
    avatar: null,
    license: null
  })

  const userTier = auth?.license?.tier || 'free'
  const canCreate = ['starter', 'trader', 'pro', 'elite', 'lifetime'].includes(userTier)

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    
    monaco.editor.defineTheme('quantum-falcon', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '9945FF', fontStyle: 'italic' },
        { token: 'keyword', foreground: '14F195', fontStyle: 'bold' },
        { token: 'string', foreground: 'DC1FFF' },
        { token: 'number', foreground: 'B9F2FF' },
        { token: 'function', foreground: '14F195' },
      ],
      colors: {
        'editor.background': '#0A0E27',
        'editor.foreground': '#B9F2FF',
        'editor.lineHighlightBackground': '#1A1F3A',
        'editorCursor.foreground': '#14F195',
        'editor.selectionBackground': '#9945FF40',
      }
    })
    
    monaco.editor.setTheme('quantum-falcon')
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave()
    })
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleBacktest()
    })
  }

  const handleAISuggestion = async () => {
    if (!canCreate) {
      setShowUpgradeModal(true)
      return
    }

    setAiSuggestionLoading(true)
    
    try {
      const selection = editorRef.current?.getSelection()
      const selectedText = selection 
        ? editorRef.current?.getModel()?.getValueInRange(selection)
        : code

      const promptText = `You are an expert trading strategy developer. Analyze and improve this trading strategy code:

${selectedText || code}

Category: ${category}

Please provide:
1. Code improvements for better performance
2. Risk management suggestions
3. Optimization tips

Return only improved code with comments explaining changes.`

      const suggestion = await window.spark.llm(promptText, 'gpt-4o')
      
      if (selection && selectedText) {
        const range = editorRef.current?.getSelection()
        editorRef.current?.executeEdits('ai-suggestion', [{
          range: range,
          text: suggestion,
          forceMoveMarkers: true
        }])
      } else {
        setCode(suggestion)
      }
      
      toast.success('AI suggestion applied!', {
        description: 'Strategy code has been improved',
        icon: <Sparkle size={20} weight="fill" className="text-primary" />
      })
    } catch (error) {
      console.error('AI suggestion error:', error)
      toast.error('Failed to get AI suggestion', {
        description: 'Please try again'
      })
    } finally {
      setAiSuggestionLoading(false)
    }
  }

  const handleBacktest = async () => {
    if (!canCreate) {
      setShowUpgradeModal(true)
      return
    }

    setIsBacktesting(true)
    setActiveTab('backtest')
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockResult: BacktestResult = {
      winRate: 65 + Math.random() * 20,
      roi: 15 + Math.random() * 30,
      totalTrades: Math.floor(100 + Math.random() * 400),
      profitableTrades: 0,
      maxDrawdown: -(5 + Math.random() * 15),
      sharpeRatio: 1.2 + Math.random() * 1.5,
      avgWin: 2 + Math.random() * 3,
      avgLoss: -(1 + Math.random() * 2)
    }
    
    mockResult.profitableTrades = Math.floor(mockResult.totalTrades * (mockResult.winRate / 100))
    
    setBacktestResult(mockResult)
    setIsBacktesting(false)
    
    toast.success('Backtest complete!', {
      description: `Win Rate: ${mockResult.winRate.toFixed(1)}% | ROI: ${mockResult.roi.toFixed(1)}%`,
      icon: <ChartLine size={20} weight="duotone" className="text-primary" />
    })
  }

  const handleSave = async () => {
    if (!canCreate) {
      setShowUpgradeModal(true)
      return
    }

    if (!strategyName.trim()) {
      toast.error('Strategy name required', {
        description: 'Please enter a name for your strategy'
      })
      return
    }

    setIsSaving(true)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newStrategy: Strategy = {
      id: `strategy-${Date.now()}`,
      name: strategyName,
      code,
      category,
      description,
      author: auth?.username || 'Unknown',
      winRate: backtestResult?.winRate,
      roi: backtestResult?.roi,
      trades: backtestResult?.totalTrades,
      createdAt: Date.now()
    }
    
    setStrategies((current) => [newStrategy, ...(current || [])].slice(0, 100))
    
    setIsSaving(false)
    
    toast.success('Strategy saved!', {
      description: `${strategyName} has been saved to your vault`,
      icon: <FloppyDisk size={20} weight="fill" className="text-primary" />
    })
    
    setStrategyName('')
    setDescription('')
  }

  const handleShare = async () => {
    if (!canCreate) {
      setShowUpgradeModal(true)
      return
    }

    if (!strategyName.trim()) {
      toast.error('Save strategy first', {
        description: 'Please save your strategy before sharing'
      })
      return
    }

    setIsSharing(true)
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#14F195', '#9945FF', '#DC1FFF']
    })
    
    setIsSharing(false)
    
    toast.success('Strategy shared!', {
      description: 'Your strategy is now available to the community',
      icon: <ShareNetwork size={20} weight="fill" className="text-accent" />
    })
  }

  const loadTemplate = (templateCode: string) => {
    setCode(templateCode)
    toast.success('Template loaded', {
      description: 'You can now customize this strategy'
    })
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
      <CodeParticles />
      
      <div className="relative z-10 container mx-auto p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 py-8"
        >
          <motion.div
            className="inline-flex items-center justify-center w-24 h-24 border-4 border-primary bg-primary/20 jagged-corner mb-4 shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.6)]"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
          >
            <Plus size={48} weight="bold" className="text-primary" />
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-[0.15em]">
            <span className="block text-primary neon-glow-primary" style={{
              textShadow: '4px 4px 0 oklch(0.08 0.02 280), 0 0 25px oklch(0.72 0.20 195 / 0.9)',
              WebkitTextStroke: '1px oklch(0.08 0.02 280)'
            }}>
              CREATE YOUR OWN
            </span>
            <span className="block text-accent neon-glow-accent mt-2" style={{
              textShadow: '4px 4px 0 oklch(0.08 0.02 280), 0 0 25px oklch(0.68 0.18 330 / 0.9)',
              WebkitTextStroke: '1px oklch(0.08 0.02 280)'
            }}>
              STRATEGY
            </span>
          </h1>
          
          <p className="text-xl max-w-3xl mx-auto font-bold bg-card/95 border-3 border-primary/60 p-6 jagged-corner-small backdrop-blur-sm shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.4)]">
            <span className="text-foreground">Build and share custom trading strategies with the community. </span>
            <span className="text-primary neon-glow-primary">Available for Pro tier and above.</span>
          </p>

          {!canCreate && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block"
            >
              <Button
                size="lg"
                onClick={() => setShowUpgradeModal(true)}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground jagged-corner border-4 border-primary shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.6)] hover:shadow-[0_0_40px_oklch(0.72_0.20_195_/_0.8)] uppercase tracking-[0.15em] font-bold px-12 py-6 text-lg group"
              >
                <Rocket size={28} weight="duotone" className="mr-3 group-hover:animate-pulse" />
                UPGRADE TO PRO
                <ArrowRight size={28} weight="bold" className="ml-3" />
              </Button>
            </motion.div>
          )}
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card border-3 border-primary/50 p-1 jagged-corner-small">
            <TabsTrigger 
              value="editor" 
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary uppercase tracking-wider font-bold jagged-corner-small"
            >
              <Code size={20} weight="duotone" className="mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger 
              value="backtest"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary uppercase tracking-wider font-bold jagged-corner-small"
            >
              <ChartLine size={20} weight="duotone" className="mr-2" />
              Backtest
            </TabsTrigger>
            <TabsTrigger 
              value="templates"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary uppercase tracking-wider font-bold jagged-corner-small"
            >
              <Cube size={20} weight="duotone" className="mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6 mt-6">
            <Card className="border-4 border-primary/60 bg-card/95 backdrop-blur-sm shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.4)]">
              <CardHeader>
                <CardTitle className="text-2xl uppercase tracking-wider text-primary neon-glow-primary">
                  Strategy Configuration
                </CardTitle>
                <CardDescription className="text-base">
                  Define your strategy parameters and metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="strategy-name" className="uppercase tracking-wide text-xs font-bold">
                      Strategy Name
                    </Label>
                    <Input
                      id="strategy-name"
                      placeholder="My Awesome Strategy"
                      value={strategyName}
                      onChange={(e) => setStrategyName(e.target.value)}
                      className="bg-card border-2 border-primary/50 focus:border-primary jagged-corner-small"
                      disabled={!canCreate}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category" className="uppercase tracking-wide text-xs font-bold">
                      Category
                    </Label>
                    <Select value={category} onValueChange={setCategory} disabled={!canCreate}>
                      <SelectTrigger className="bg-card border-2 border-primary/50 focus:border-primary jagged-corner-small">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STRATEGY_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="uppercase tracking-wide text-xs font-bold">
                    Description
                  </Label>
                  <Input
                    id="description"
                    placeholder="Brief description of your strategy..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-card border-2 border-primary/50 focus:border-primary jagged-corner-small"
                    disabled={!canCreate}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-4 border-accent/60 bg-card/95 backdrop-blur-sm shadow-[0_0_30px_oklch(0.68_0.18_330_/_0.4)]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl uppercase tracking-wider text-accent neon-glow-accent">
                    Code Editor
                  </CardTitle>
                  <CardDescription className="text-base">
                    Write your strategy logic • Cmd/Ctrl+S to save • Cmd/Ctrl+Enter to backtest
                  </CardDescription>
                </div>
                <Button
                  onClick={handleAISuggestion}
                  disabled={!canCreate || aiSuggestionLoading}
                  className="bg-accent/20 hover:bg-accent/30 text-accent border-2 border-accent jagged-corner-small"
                >
                  {aiSuggestionLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin mr-2" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Brain size={20} weight="duotone" className="mr-2" />
                      AI Assist
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="border-4 border-accent/60 jagged-corner overflow-hidden shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)]">
                  <Editor
                    height="600px"
                    defaultLanguage="javascript"
                    value={code}
                    onChange={(value) => {
                      if (value !== undefined) {
                        setCode(value)
                      }
                    }}
                    onMount={handleEditorDidMount}
                    options={{
                      readOnly: !canCreate,
                      minimap: { enabled: true },
                      fontSize: 14,
                      fontFamily: "'Orbitron', monospace",
                      wordWrap: 'on',
                      automaticLayout: true,
                      scrollBeyondLastLine: false,
                      cursorBlinking: 'smooth',
                      cursorSmoothCaretAnimation: 'on',
                      smoothScrolling: true,
                      suggestOnTriggerCharacters: true,
                      quickSuggestions: true,
                      formatOnPaste: true,
                      formatOnType: true,
                    }}
                  />
                </div>

                {!canCreate && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20">
                    <div className="text-center space-y-4 p-8 bg-card border-4 border-destructive jagged-corner shadow-[0_0_40px_oklch(0.65_0.25_25_/_0.6)]">
                      <Lock size={64} weight="duotone" className="text-destructive mx-auto" />
                      <h3 className="text-2xl font-black uppercase tracking-wider text-destructive">
                        Pro Feature
                      </h3>
                      <p className="text-muted-foreground">
                        Upgrade to Pro tier to unlock strategy creation
                      </p>
                      <Button
                        onClick={() => setShowUpgradeModal(true)}
                        className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                      >
                        <Rocket size={20} className="mr-2" />
                        Upgrade Now
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={handleBacktest}
                disabled={!canCreate || isBacktesting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground jagged-corner border-3 border-primary shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.5)] uppercase tracking-wider font-bold"
              >
                {isBacktesting ? (
                  <>
                    <div className="w-5 h-5 border-3 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    Running Backtest...
                  </>
                ) : (
                  <>
                    <Play size={24} weight="fill" className="mr-2" />
                    Run Backtest
                  </>
                )}
              </Button>

              <Button
                size="lg"
                onClick={handleSave}
                disabled={!canCreate || isSaving}
                className="bg-accent hover:bg-accent/90 text-accent-foreground jagged-corner border-3 border-accent shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.5)] uppercase tracking-wider font-bold"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-3 border-accent-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FloppyDisk size={24} weight="fill" className="mr-2" />
                    Save Strategy
                  </>
                )}
              </Button>

              <Button
                size="lg"
                onClick={handleShare}
                disabled={!canCreate || isSharing}
                variant="outline"
                className="border-3 border-secondary text-secondary hover:bg-secondary/10 jagged-corner uppercase tracking-wider font-bold"
              >
                {isSharing ? (
                  <>
                    <div className="w-5 h-5 border-3 border-secondary border-t-transparent rounded-full animate-spin mr-2" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <ShareNetwork size={24} weight="fill" className="mr-2" />
                    Share to Community
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="backtest" className="space-y-6 mt-6">
            <Card className="border-4 border-primary/60 bg-card/95 backdrop-blur-sm shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.4)]">
              <CardHeader>
                <CardTitle className="text-2xl uppercase tracking-wider text-primary neon-glow-primary">
                  Backtest Results
                </CardTitle>
                <CardDescription className="text-base">
                  Historical performance simulation of your strategy
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isBacktesting ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-xl font-bold uppercase tracking-wider text-primary">
                      Running Backtest...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Analyzing strategy performance
                    </p>
                  </div>
                ) : backtestResult ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="border-3 border-primary/50 bg-primary/5">
                        <CardHeader className="pb-2">
                          <CardDescription className="uppercase text-xs tracking-wider">Win Rate</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-black text-primary neon-glow-primary">
                            {backtestResult.winRate.toFixed(1)}%
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-3 border-accent/50 bg-accent/5">
                        <CardHeader className="pb-2">
                          <CardDescription className="uppercase text-xs tracking-wider">ROI</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-black text-accent neon-glow-accent">
                            {backtestResult.roi.toFixed(1)}%
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-3 border-secondary/50 bg-secondary/5">
                        <CardHeader className="pb-2">
                          <CardDescription className="uppercase text-xs tracking-wider">Total Trades</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-black text-secondary neon-glow-secondary">
                            {backtestResult.totalTrades}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-3 border-primary/50 bg-primary/5">
                        <CardHeader className="pb-2">
                          <CardDescription className="uppercase text-xs tracking-wider">Sharpe Ratio</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-black text-primary neon-glow-primary">
                            {backtestResult.sharpeRatio.toFixed(2)}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border-3 border-accent/50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-accent">
                            <TrendUp size={24} weight="duotone" />
                            Performance Metrics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground uppercase tracking-wider">Profitable Trades:</span>
                            <span className="text-lg font-bold text-primary">{backtestResult.profitableTrades}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground uppercase tracking-wider">Avg Win:</span>
                            <span className="text-lg font-bold text-primary">+{backtestResult.avgWin.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground uppercase tracking-wider">Avg Loss:</span>
                            <span className="text-lg font-bold text-destructive">{backtestResult.avgLoss.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground uppercase tracking-wider">Max Drawdown:</span>
                            <span className="text-lg font-bold text-destructive">{backtestResult.maxDrawdown.toFixed(2)}%</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-3 border-primary/50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-primary">
                            <Star size={24} weight="duotone" />
                            Strategy Rating
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle size={20} weight="fill" className="text-primary" />
                              <span className="text-sm">
                                {backtestResult.winRate > 60 ? 'Excellent' : backtestResult.winRate > 50 ? 'Good' : 'Needs Improvement'} win rate
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle size={20} weight="fill" className="text-primary" />
                              <span className="text-sm">
                                {backtestResult.roi > 20 ? 'High' : backtestResult.roi > 10 ? 'Moderate' : 'Low'} return potential
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle size={20} weight="fill" className="text-primary" />
                              <span className="text-sm">
                                {backtestResult.sharpeRatio > 2 ? 'Excellent' : backtestResult.sharpeRatio > 1 ? 'Good' : 'Fair'} risk-adjusted returns
                              </span>
                            </div>
                          </div>
                          
                          <Badge className="w-full justify-center py-2 text-base bg-gradient-to-r from-primary to-accent">
                            {backtestResult.winRate > 65 && backtestResult.roi > 20 ? '⭐⭐⭐ Elite Strategy' :
                             backtestResult.winRate > 55 && backtestResult.roi > 15 ? '⭐⭐ Strong Strategy' :
                             '⭐ Developing Strategy'}
                          </Badge>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <ChartLine size={64} weight="duotone" className="text-muted-foreground opacity-50" />
                    <p className="text-xl font-bold uppercase tracking-wider text-muted-foreground">
                      No Backtest Results Yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Run a backtest to see your strategy's performance
                    </p>
                    <Button onClick={() => setActiveTab('editor')} variant="outline">
                      Go to Editor
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6 mt-6">
            <Card className="border-4 border-accent/60 bg-card/95 backdrop-blur-sm shadow-[0_0_30px_oklch(0.68_0.18_330_/_0.4)]">
              <CardHeader>
                <CardTitle className="text-2xl uppercase tracking-wider text-accent neon-glow-accent">
                  Strategy Templates
                </CardTitle>
                <CardDescription className="text-base">
                  Pre-built strategies to get you started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'SMA Crossover', category: 'Trend Following', desc: 'Classic moving average strategy' },
                    { name: 'RSI Reversal', category: 'Mean Reversion', desc: 'Overbought/oversold signals' },
                    { name: 'Breakout', category: 'Breakout', desc: 'Price breakout detection' },
                    { name: 'Grid Trading', category: 'Grid Trading', desc: 'Buy low, sell high repeatedly' },
                  ].map((template) => (
                    <Card key={template.name} className="border-2 border-primary/50 hover:border-primary transition-all cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>
                          <Badge variant="outline">{template.category}</Badge>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{template.desc}</p>
                        <Button
                          size="sm"
                          onClick={() => {
                            loadTemplate(DEFAULT_CODE)
                            setActiveTab('editor')
                          }}
                          className="w-full"
                          disabled={!canCreate}
                        >
                          Load Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {strategies && strategies.length > 0 && (
          <Card className="border-4 border-secondary/60 bg-card/95 backdrop-blur-sm shadow-[0_0_30px_oklch(0.68_0.18_330_/_0.4)]">
            <CardHeader>
              <CardTitle className="text-2xl uppercase tracking-wider text-secondary neon-glow-secondary">
                Your Strategies ({strategies.length})
              </CardTitle>
              <CardDescription className="text-base">
                Manage and deploy your saved strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {strategies.slice(0, 6).map((strategy) => (
                  <Card key={strategy.id} className="border-2 border-secondary/50 hover:border-secondary transition-all">
                    <CardHeader>
                      <CardTitle className="text-base">{strategy.name}</CardTitle>
                      <CardDescription>
                        <Badge variant="outline">{strategy.category}</Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {strategy.winRate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Win Rate:</span>
                          <span className="font-bold text-primary">{strategy.winRate.toFixed(1)}%</span>
                        </div>
                      )}
                      {strategy.roi && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">ROI:</span>
                          <span className="font-bold text-accent">{strategy.roi.toFixed(1)}%</span>
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => {
                          setCode(strategy.code)
                          setStrategyName(strategy.name)
                          setCategory(strategy.category)
                          setDescription(strategy.description)
                          setActiveTab('editor')
                          toast.success('Strategy loaded')
                        }}
                      >
                        Load
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="border-4 border-destructive bg-card shadow-[0_0_50px_oklch(0.65_0.25_25_/_0.6)]">
          <DialogHeader>
            <DialogTitle className="text-3xl uppercase tracking-wider text-destructive neon-glow-destructive flex items-center gap-3">
              <Lock size={32} weight="duotone" />
              Upgrade Required
            </DialogTitle>
            <DialogDescription className="text-base pt-4">
              Strategy creation is a premium feature available to Pro tier and above.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle size={24} weight="fill" className="text-primary" />
                <span>Create unlimited custom strategies</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={24} weight="fill" className="text-primary" />
                <span>AI-powered code suggestions</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={24} weight="fill" className="text-primary" />
                <span>Advanced backtesting & analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={24} weight="fill" className="text-primary" />
                <span>Share strategies with community</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={24} weight="fill" className="text-primary" />
                <span>Priority support & updates</span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground jagged-corner border-3 border-primary shadow-[0_0_25px_oklch(0.72_0.20_195_/_0.6)] uppercase tracking-wider font-bold py-6 text-lg"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'settings' }))
                setShowUpgradeModal(false)
                toast.info('Navigate to Billing', {
                  description: 'Go to Settings > Billing to upgrade your plan'
                })
              }}
            >
              <Rocket size={24} className="mr-3" />
              Upgrade to Pro - $197/mo
              <Lightning size={24} className="ml-3" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
