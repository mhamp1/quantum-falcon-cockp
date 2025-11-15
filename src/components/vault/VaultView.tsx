import { useState, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Vault, ArrowUp, TrendUp, CurrencyBtc, Lightning, ShieldCheck, ArrowsClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface VaultTransaction {
  id: string
  type: 'deposit' | 'withdrawal'
  amount: number
  timestamp: number
}

interface FloatingCoin {
  id: number
  x: number
  y: number
  delay: number
  duration: number
  rotation: number
}

export default function VaultView() {
  const [btcBalance, setBtcBalance] = useKV<number>('btc-vault-balance', 0.00234)
  const [solanaAccumulated, setSolanaAccumulated] = useKV<number>('solana-accumulated', 127.89)
  const [transactions, setTransactions] = useKV<VaultTransaction[]>('vault-transactions', [])
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawAddress, setWithdrawAddress] = useState('')
  const [floatingCoins, setFloatingCoins] = useState<FloatingCoin[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const coins: FloatingCoin[] = []
    for (let i = 0; i < 12; i++) {
      coins.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 15 + Math.random() * 10,
        rotation: Math.random() * 360
      })
    }
    setFloatingCoins(coins)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth * 2
    canvas.height = canvas.offsetHeight * 2
    ctx.scale(2, 2)

    let animationFrame: number
    const particles: Array<{ x: number; y: number; vx: number; vy: number; life: number }> = []

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (Math.random() < 0.02) {
        particles.push({
          x: Math.random() * canvas.width / 2,
          y: canvas.height / 2,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 3 - 1,
          life: 1
        })
      }

      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05
        p.life -= 0.01

        if (p.life <= 0) {
          particles.splice(i, 1)
          return
        }

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 3)
        gradient.addColorStop(0, `rgba(185, 242, 255, ${p.life * 0.8})`)
        gradient.addColorStop(1, `rgba(185, 242, 255, 0)`)
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationFrame)
  }, [])

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount)
    
    if (!amount || amount <= 0) {
      toast.error('Invalid amount', { description: 'Please enter a valid withdrawal amount' })
      return
    }

    if (!btcBalance || amount > btcBalance) {
      toast.error('Insufficient balance', { description: 'Amount exceeds available BTC' })
      return
    }

    if (!withdrawAddress || withdrawAddress.length < 26) {
      toast.error('Invalid address', { description: 'Please enter a valid BTC address' })
      return
    }

    setBtcBalance((current) => (current || 0) - amount)
    
    const newTransaction: VaultTransaction = {
      id: Date.now().toString(),
      type: 'withdrawal',
      amount,
      timestamp: Date.now()
    }

    setTransactions((current) => {
      if (!current) return [newTransaction]
      return [newTransaction, ...current].slice(0, 50)
    })

    toast.success('Withdrawal initiated', { 
      description: `${amount} BTC sent to ${withdrawAddress.slice(0, 8)}...${withdrawAddress.slice(-8)}`
    })
    
    setWithdrawAmount('')
    setWithdrawAddress('')
  }

  return (
    <div className="space-y-6">
      <div className="relative min-h-[500px] overflow-hidden cyber-card p-8 md:p-12">
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ mixBlendMode: 'screen' }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 pointer-events-none" />
        <div className="absolute inset-0 diagonal-stripes opacity-20 pointer-events-none" />
        
        {floatingCoins.map((coin) => (
          <motion.div
            key={coin.id}
            className="absolute w-16 h-16 md:w-24 md:h-24 pointer-events-none"
            style={{
              left: `${coin.x}%`,
              top: `${coin.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.sin(coin.id) * 20, 0],
              rotateY: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: coin.duration,
              delay: coin.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-primary/50 blur-lg opacity-60" />
              <div className="absolute inset-0 rounded-full bg-card border-4 border-primary flex items-center justify-center neon-glow">
                {coin.id % 3 === 0 ? (
                  <CurrencyBtc weight="fill" className="w-8 h-8 md:w-12 md:h-12 text-accent" />
                ) : (
                  <Lightning weight="fill" className="w-8 h-8 md:w-12 md:h-12 text-primary" />
                )}
              </div>
            </div>
          </motion.div>
        ))}

        <div className="relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-[0.15em] uppercase leading-tight">
              <span className="block text-foreground">REVOLUTIONIZING</span>
              <span className="block text-primary neon-glow-primary mt-2">CRYPTO WEALTH</span>
              <span className="block text-accent neon-glow-accent mt-2">ACCUMULATION</span>
            </h1>
          </motion.div>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            A new paradigm of autonomous trading, built for investors who value{' '}
            <span className="text-primary font-bold">speed</span>,{' '}
            <span className="text-accent font-bold">clarity</span>, and{' '}
            <span className="text-secondary font-bold">security</span>.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground jagged-corner border-2 border-primary neon-glow uppercase tracking-[0.15em] font-bold px-8 py-6 text-base group"
            >
              <Vault size={24} weight="duotone" className="mr-2 group-hover:animate-pulse" />
              Access Vault
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="jagged-corner border-2 border-primary text-primary hover:bg-primary/10 uppercase tracking-[0.15em] font-bold px-8 py-6 text-base"
            >
              <ShieldCheck size={24} weight="duotone" className="mr-2" />
              Learn How It Works
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          className="cyber-card-accent p-6 relative overflow-hidden group cursor-pointer"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Lightning size={40} weight="duotone" className="text-primary" />
              <div className="status-indicator" />
            </div>
            <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-bold mb-2">
              AUTO CONVERT SOL
            </h3>
            <p className="text-3xl font-black text-primary neon-glow-primary mb-1">
              {solanaAccumulated?.toFixed(2) || '0.00'}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Solana accumulated from trades
            </p>
          </div>
        </motion.div>

        <motion.div
          className="cyber-card-accent p-6 relative overflow-hidden group cursor-pointer"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-all" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <ArrowsClockwise size={40} weight="duotone" className="text-accent animate-pulse-glow" />
              <div className="hud-readout text-accent">ACTIVE</div>
            </div>
            <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-bold mb-2">
              CONVERSION RATE
            </h3>
            <p className="text-3xl font-black text-accent neon-glow-accent mb-1">
              AUTO
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Optimal market conversion to BTC
            </p>
          </div>
        </motion.div>

        <motion.div
          className="cyber-card-accent p-6 relative overflow-hidden group cursor-pointer"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-all" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <ShieldCheck size={40} weight="duotone" className="text-secondary" />
              <div className="status-indicator bg-secondary" style={{ boxShadow: '0 0 8px var(--secondary), 0 0 16px var(--secondary)' }} />
            </div>
            <h3 className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-bold mb-2">
              ZERO FEES
            </h3>
            <p className="text-3xl font-black text-secondary neon-glow-secondary mb-1">
              0%
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              No trading fees on conversions
            </p>
          </div>
        </motion.div>
      </div>

      <div className="cyber-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent" />
        <div className="p-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 jagged-corner bg-secondary/30 border-2 border-secondary neon-glow-secondary">
                  <CurrencyBtc size={32} weight="duotone" className="text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.15em] hud-text">
                    TOTAL BTC VAULT BALANCE
                  </p>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide mt-1">
                    Secured & Growing
                  </p>
                </div>
              </div>
              <p className="text-5xl md:text-6xl font-black text-secondary neon-glow-secondary hud-value mb-2">
                {btcBalance?.toFixed(6) || '0.000000'}
                <span className="text-2xl ml-2">BTC</span>
              </p>
              <p className="text-lg text-muted-foreground uppercase tracking-wide">
                ≈ ${((btcBalance || 0) * 45000).toFixed(2)} USD
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/30 jagged-corner-small border border-primary/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">24H</p>
                <p className="text-xl font-bold text-secondary">+0.00012</p>
              </div>
              <div className="text-center p-4 bg-muted/30 jagged-corner-small border border-primary/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">GAIN</p>
                <p className="text-xl font-bold text-secondary">+47.3%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="cyber-card">
        <div className="p-8 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 jagged-corner-small bg-primary/30 border-2 border-primary">
              <ArrowUp size={28} weight="duotone" className="text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold uppercase tracking-[0.15em] text-primary hud-text">WITHDRAW BTC</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                Transfer Bitcoin from vault to external wallet
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount" className="uppercase tracking-wide text-xs font-bold text-primary">
                Amount (BTC)
              </Label>
              <Input
                id="withdraw-amount"
                type="number"
                step="0.000001"
                placeholder="0.000000"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="bg-muted/50 border-2 border-primary/50 focus:border-primary jagged-corner-small h-12 text-lg font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="withdraw-address" className="uppercase tracking-wide text-xs font-bold text-primary">
                Destination Address
              </Label>
              <Input
                id="withdraw-address"
                type="text"
                placeholder="bc1q..."
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                className="bg-muted/50 border-2 border-primary/50 focus:border-primary jagged-corner-small font-mono text-sm h-12"
              />
            </div>
          </div>
          <Button 
            onClick={handleWithdraw}
            className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground jagged-corner border-2 border-primary neon-glow uppercase tracking-[0.15em] font-bold h-14 text-base"
          >
            <ArrowUp size={24} weight="bold" className="mr-2" />
            Initiate Secure Withdrawal
          </Button>
        </div>
      </div>

      <div className="cyber-card scan-line-effect">
        <div className="p-8 relative z-10">
          <h3 className="text-2xl font-bold uppercase tracking-[0.15em] text-primary hud-text mb-6">
            TRANSACTION HISTORY
          </h3>
          {!transactions || transactions.length === 0 ? (
            <div className="text-center py-12">
              <Vault size={64} weight="duotone" className="text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground uppercase tracking-wide">NO TRANSACTIONS YET</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((tx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-5 jagged-corner bg-muted/30 border-2 border-primary/30 hover:border-primary/60 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    {tx.type === 'deposit' ? (
                      <div className="w-12 h-12 jagged-corner-small bg-secondary/30 border-2 border-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <TrendUp size={20} weight="duotone" className="text-secondary" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 jagged-corner-small bg-destructive/30 border-2 border-destructive flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ArrowUp size={20} weight="duotone" className="text-destructive" />
                      </div>
                    )}
                    <div>
                      <p className="text-base font-bold uppercase tracking-wide">{tx.type}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {new Date(tx.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className={`text-lg font-bold hud-value ${tx.type === 'deposit' ? 'text-secondary neon-glow-secondary' : 'text-destructive neon-glow-destructive'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toFixed(6)} BTC
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}