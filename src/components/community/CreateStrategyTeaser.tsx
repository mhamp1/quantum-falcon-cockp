import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkle, 
  Crown, 
  Code, 
  Brain, 
  Rocket, 
  Lock,
  Lightning,
  Heart,
  EyeSlash,
  TrendUp,
  CheckCircle,
  ArrowRight
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

interface CodeParticle {
  id: number
  x: number
  y: number
  code: string
  delay: number
  duration: number
}

function CodeParticlesBackground() {
  const [particles] = useState<CodeParticle[]>(() => {
    const codeSnippets = [
      'if', 'buy', 'sell', 'RSI', 'volume', 'whale', 'DCA', 'AI',
      'EMA', 'MACD', 'trend', 'signal', 'profit', 'loss', 'entry',
      'exit', 'stop', 'limit', '>', '<', '==', '&&', '||', 'return'
    ]
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      code: codeSnippets[i % codeSnippets.length],
      delay: Math.random() * 3,
      duration: 10 + Math.random() * 15
    }))
  })

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute text-xs font-mono font-bold text-accent/40"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.2, 0.6, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        >
          {particle.code}
        </motion.div>
      ))}
    </div>
  )
}

interface FeaturedStrategy {
  name: string
  roi: string
  winRate: string
  likes: string
  category: string
}

const FEATURED_STRATEGIES: FeaturedStrategy[] = [
  { name: "Neon Whale Sniper", roi: "+284%", winRate: "73%", likes: "12.4k", category: "On-Chain" },
  { name: "Quantum DCA God", roi: "+167%", winRate: "81%", likes: "8.9k", category: "DCA" },
  { name: "Flash Crash Hunter", roi: "+412%", winRate: "68%", likes: "15.2k", category: "Scalping" },
  { name: "RSI Divergence Master", roi: "+198%", winRate: "76%", likes: "9.3k", category: "Mean Reversion" }
]

interface CreateStrategyTeaserProps {
  onUpgrade?: () => void
  isLocked?: boolean
}

export default function CreateStrategyTeaser({ onUpgrade, isLocked = true }: CreateStrategyTeaserProps) {
  const [currentStrategyIndex, setCurrentStrategyIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [liveCounter, setLiveCounter] = useState(1247)
  const [royaltyEarned, setRoyaltyEarned] = useState(8421)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStrategyIndex((prev) => (prev + 1) % FEATURED_STRATEGIES.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const counterInterval = setInterval(() => {
      setLiveCounter((prev) => prev + Math.floor(Math.random() * 3))
      setRoyaltyEarned((prev) => prev + Math.floor(Math.random() * 50))
    }, 8000)

    return () => clearInterval(counterInterval)
  }, [])

  const handleUpgradeHover = () => {
    // Confetti effect removed - package not installed
  }

  const handleCardClick = () => {
    if (isLocked) {
      setShowPreviewModal(true)
    }
  }

  const handleUpgradeClick = () => {
    if (onUpgrade) {
      onUpgrade()
    } else {
      window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'settings' }))
      setTimeout(() => {
        const subscriptionSection = document.getElementById('subscription-tiers-section')
        if (subscriptionSection) {
          subscriptionSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 300)
    }
  }

  return (
    <>
      <motion.div
        className="relative overflow-hidden cursor-pointer group"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-black" />
        
        <div className="absolute inset-0 z-0">
          <CodeParticlesBackground />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />

        <div className="relative z-20 p-8 md:p-12 space-y-8 min-h-[700px] flex flex-col">
          <motion.div
            className="absolute top-6 right-6"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Badge className="bg-accent/20 border-2 border-accent text-accent text-sm px-4 py-2 backdrop-blur-sm">
              <Crown size={18} weight="fill" className="mr-2" />
              PRO+ EXCLUSIVE
            </Badge>
          </motion.div>

          <motion.div
            className="flex justify-center"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0, -5, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity
            }}
          >
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-accent/50 animate-pulse" />
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-accent via-primary to-accent flex items-center justify-center shadow-[0_0_80px_oklch(0.68_0.18_330_/_0.8)] border-4 border-primary/50">
                <Code size={64} weight="duotone" className="text-background drop-shadow-2xl" />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </div>
          </motion.div>

          <div className="text-center space-y-4">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-[0.2em]"
              style={{
                background: 'linear-gradient(135deg, #14F195 0%, #9945FF 50%, #DC1FFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 40px #DC1FFF, 0 0 80px #14F195',
                filter: 'drop-shadow(0 0 20px #DC1FFF) drop-shadow(0 0 40px #14F195)',
                WebkitTextStroke: '2px oklch(0.08 0.02 280)',
                paintOrder: 'stroke fill'
              }}
            >
              CREATE
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #DC1FFF 0%, #9945FF 50%, #14F195 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                GOD-TIER
              </span>
              <br />
              STRATEGIES
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-primary font-bold max-w-3xl mx-auto"
              style={{
                textShadow: '0 0 20px oklch(0.72 0.20 195 / 0.8)'
              }}
            >
              Build and share custom trading strategies with the community.
              <br />
              <span className="text-accent">Available for Pro tier and above.</span>
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto"
          >
            {[
              { icon: <Code size={24} weight="duotone" />, text: "Full Monaco Editor with AI-powered code completion", color: "text-primary" },
              { icon: <TrendUp size={24} weight="duotone" />, text: "Real-time backtesting + live performance tracking", color: "text-accent" },
              { icon: <Lightning size={24} weight="fill" />, text: "One-click sharing to Community Hub (earn royalties on copies)", color: "text-primary" },
              { icon: <CheckCircle size={24} weight="fill" />, text: "On-chain proof of ownership via Solana NFT metadata", color: "text-accent" },
              { icon: <Brain size={24} weight="duotone" />, text: "Access to 200+ premium indicators & on-chain data feeds", color: "text-primary" },
              { icon: <Sparkle size={24} weight="fill" />, text: "Priority access to Elite community templates", color: "text-accent" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                whileHover={{ scale: 1.05, x: 10 }}
                className="flex items-center gap-4 bg-card/40 border-2 border-primary/30 p-4 jagged-corner-small backdrop-blur-md hover:border-primary/60 hover:bg-card/60 transition-all hover:shadow-[0_0_25px_oklch(0.72_0.20_195_/_0.4)]"
              >
                <span className={cn("shrink-0", feature.color)}>{feature.icon}</span>
                <span className="text-sm text-foreground font-semibold">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-wider mb-6" style={{
                background: 'linear-gradient(135deg, #14F195 0%, #DC1FFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 30px #14F195'
              }}>
                🔥 Top Community Strategies This Week
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <AnimatePresence mode="wait">
                {FEATURED_STRATEGIES.map((strategy, i) => (
                  <motion.div
                    key={strategy.name}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ 
                      opacity: i === currentStrategyIndex ? 1 : 0.7, 
                      scale: i === currentStrategyIndex ? 1.05 : 1,
                      y: 0
                    }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      "bg-black/80 border-3 p-5 jagged-corner backdrop-blur-sm transition-all",
                      i === currentStrategyIndex 
                        ? "border-accent shadow-[0_0_40px_oklch(0.68_0.18_330_/_0.6)]"
                        : "border-accent/30"
                    )}
                  >
                    <Badge className="mb-3 bg-accent/20 text-accent border border-accent/50 text-[10px]">
                      {strategy.category}
                    </Badge>
                    <h4 className="text-lg font-black text-primary neon-glow-primary mb-2 line-clamp-2">
                      {strategy.name}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Win Rate:</span>
                        <span className="font-bold text-primary">{strategy.winRate}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">ROI:</span>
                        <span className="font-bold text-accent">{strategy.roi}</span>
                      </div>
                      <div className="flex items-center gap-2 justify-between text-sm pt-2 border-t border-border/50">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Heart size={14} weight="fill" className="text-destructive" />
                          {strategy.likes}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
            className="text-center"
          >
            <div className="inline-block bg-card/90 border-3 border-accent/60 px-8 py-4 jagged-corner backdrop-blur-sm shadow-[0_0_40px_oklch(0.68_0.18_330_/_0.5)]">
              <p className="text-xl md:text-2xl font-black text-accent neon-glow-accent">
                🔥 {liveCounter.toLocaleString()} strategies created this week
              </p>
              <p className="text-lg font-bold text-primary mt-1">
                Top creator earned ${royaltyEarned.toLocaleString()} in royalties
              </p>
            </div>
          </motion.div>

          {isLocked && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="flex flex-col md:flex-row items-center justify-center gap-6 mt-auto pt-8"
            >
              <Button
                disabled
                size="lg"
                className="bg-muted/30 text-muted-foreground border-3 border-muted/50 cursor-not-allowed jagged-corner px-8 py-6 text-lg uppercase tracking-wider font-black"
              >
                <Lock className="mr-3" size={28} />
                Pro Tier Required
              </Button>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  onMouseEnter={handleUpgradeHover}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUpgradeClick()
                  }}
                  className="relative group bg-gradient-to-r from-accent via-primary to-accent hover:from-accent/90 hover:via-primary/90 hover:to-accent/90 text-background jagged-corner border-4 border-primary uppercase tracking-[0.2em] font-black px-16 py-8 text-2xl overflow-hidden"
                  style={{
                    boxShadow: '0 0 60px oklch(0.72 0.20 195 / 0.8), 0 0 100px oklch(0.68 0.18 330 / 0.6), inset 0 2px 0 oklch(1 0 0 / 0.3)'
                  }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-200%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="relative z-10 flex items-center gap-4">
                    <Crown size={36} weight="duotone" className="animate-bounce" />
                    UPGRADE TO PRO
                    <ArrowRight size={36} weight="bold" className="group-hover:translate-x-2 transition-transform" />
                  </span>
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>

        {isHovered && isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-4 p-8"
            >
              <Lock size={80} weight="duotone" className="mx-auto text-accent animate-pulse" style={{
                filter: 'drop-shadow(0 0 20px oklch(0.68 0.18 330))'
              }} />
              <p className="text-3xl font-black uppercase tracking-wider text-accent neon-glow-accent">
                Click to Preview
              </p>
              <p className="text-lg text-foreground">
                See what you're missing...
              </p>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl border-4 border-accent bg-card shadow-[0_0_60px_oklch(0.68_0.18_330_/_0.6)]">
          <DialogHeader>
            <DialogTitle className="text-3xl uppercase tracking-wider text-accent neon-glow-accent flex items-center gap-3">
              <Code size={32} weight="duotone" />
              Strategy Creator Preview
            </DialogTitle>
            <DialogDescription className="text-base pt-4">
              This is what Pro tier users have access to — the most powerful strategy creation tool in crypto.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="aspect-video bg-black/80 border-3 border-primary/50 jagged-corner relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Brain size={80} weight="duotone" className="mx-auto text-primary animate-pulse" />
                  <p className="text-2xl font-bold text-primary">
                    15-second video preview would load here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Showing Monaco Editor, AI suggestions, backtesting, and sharing
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 bg-card/50 border-2 border-primary/30 p-6 jagged-corner-small">
              <h4 className="text-xl font-bold text-primary uppercase tracking-wider mb-4">
                What You Get With Pro:
              </h4>
              {[
                "Full Monaco code editor with syntax highlighting",
                "AI-powered code completion and suggestions",
                "Real-time backtesting with historical data",
                "Performance analytics and optimization tips",
                "One-click deploy to live trading",
                "Share strategies and earn royalties",
                "On-chain NFT proof of authorship",
                "Access to 200+ premium indicators"
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle size={24} weight="fill" className="text-primary shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setShowPreviewModal(false)}
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Button
                size="lg"
                onClick={() => {
                  setShowPreviewModal(false)
                  handleUpgradeClick()
                }}
                className="flex-1 bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-background jagged-corner border-3 border-primary uppercase tracking-wider font-bold text-lg"
                onMouseEnter={handleUpgradeHover}
              >
                <Rocket size={24} className="mr-3" />
                Upgrade to Pro Now
                <Lightning size={24} className="ml-3" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
