import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Robot, PaperPlaneRight, X, Minus, ChatText } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

function NeuralFalconIcon({ size = 42, className = '' }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 42 42" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g fill="none" stroke="none">
        <path 
          d="M21 8 L28 15 L34 12 L32 20 L38 24 L30 28 L32 35 L21 32 L10 35 L12 28 L4 24 L10 20 L8 15 L15 12 Z" 
          fill="#1E1E1E"
        />
        <path 
          d="M21 12 Q18 16 16 18 Q14 20 15 24 Q16 28 21 30 Q26 28 27 24 Q28 20 26 18 Q24 16 21 12 M18 18 H24 M21 15 V27 M17 21 H25 M19 16 L23 26 M23 16 L19 26" 
          stroke="#DC1FFF" 
          strokeWidth="1.8" 
          strokeLinecap="round" 
          opacity="0.9"
        />
        <path 
          d="M21 18 L24.5 24 L17.5 24 Z" 
          fill="#14F195" 
          opacity="0.9"
          className="neural-falcon-eye"
        />
        <circle 
          cx="21" 
          cy="21" 
          r="4" 
          fill="none" 
          stroke="#14F195" 
          strokeWidth="2"
          className="neural-falcon-eye"
        />
        <circle 
          cx="21" 
          cy="21" 
          r="18" 
          stroke="#DC1FFF" 
          strokeWidth="2" 
          opacity="0.4"
        />
        <circle 
          cx="21" 
          cy="21" 
          r="20" 
          stroke="#DC1FFF" 
          strokeWidth="3" 
          opacity="0.2"
        />
      </g>
    </svg>
  )
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

const defaultMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hello! I\'m your Quantum Falcon AI assistant. I can help you with trading strategies, market analysis, platform setup, and more. What would you like to know?',
    timestamp: Date.now()
  }
]

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useKV<boolean>('ai-assistant-open', false)
  const [isMinimized, setIsMinimized] = useKV<boolean>('ai-assistant-minimized', false)
  const [messages, setMessages] = useKV<Message[]>('ai-assistant-messages', defaultMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    }

    setMessages((prev) => [...(prev || defaultMessages), userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const userInput = input.trim()
      
      const promptText = `You are an AI trading assistant for Quantum Falcon, a sophisticated crypto trading bot platform with real-time market intelligence.

Context: Quantum Falcon features AI agents for market analysis, automated trading strategies, DCA (Dollar Cost Averaging), token sniping, portfolio tracking, and a BTC profit vault.

Live Market Data (for context):
- Bitcoin (BTC): $45,230 | 24h Change: +2.4%
- Solana (SOL): $98.50 | 24h Change: +5.7%
- Market Sentiment: Bullish with high volatility
- Top Trending: AI-related tokens gaining momentum
- DeFi TVL: $52.3B across all chains

Recent News Headlines:
- SEC approves spot Bitcoin ETF applications
- Major institutional adoption of Solana network
- DeFi protocols experiencing record trading volume
- New regulatory clarity boosts market confidence

User question: ${userInput}

Provide a helpful, insightful response incorporating live market data when relevant. Discuss trading strategies, market analysis, technical indicators, or platform features. Keep responses under 200 words. Be professional yet friendly with actionable insights.`

      const response = await window.spark.llm(promptText, 'gpt-4o-mini')

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      }

      setMessages((prev) => [...(prev || defaultMessages), assistantMessage])
    } catch (error) {
      toast.error('Failed to get response', {
        description: 'Please try again in a moment'
      })
      console.error('AI Assistant error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-[45] w-16 h-16 bg-gradient-to-br from-[#0A0E27] to-[#1A1F3A] rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group border-2 border-[#DC1FFF]/50 neural-falcon-orb"
        onClick={() => setIsOpen(true)}
        style={{
          boxShadow: '0 0 20px #DC1FFF, 0 0 40px #DC1FFF, 0 0 60px rgba(220, 31, 255, 0.4)'
        }}
      >
        <NeuralFalconIcon size={38} className="group-hover:scale-110 transition-transform" />
        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#14F195] rounded-full animate-pulse" style={{
          boxShadow: '0 0 8px #14F195'
        }} />
      </motion.button>
    )
  }

  if (isMinimized) {
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-6 right-6 z-[45]"
      >
        <div className="cyber-card p-2.5 flex items-center gap-2 cursor-pointer" onClick={() => setIsMinimized(false)}>
          <NeuralFalconIcon size={20} />
          <span className="text-xs font-bold uppercase tracking-wider">Neural AI Co-Pilot</span>
          <Button
            size="sm"
            variant="ghost"
            className="ml-1 h-5 w-5 p-0"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(false)
              setIsMinimized(false)
            }}
          >
            <X size={10} />
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      className="fixed bottom-6 right-6 z-[45] w-80 max-w-[calc(100vw-2rem)]"
      style={{ maxHeight: 'calc(100vh - 3rem)' }}
    >
      <div className="cyber-card overflow-hidden flex flex-col" style={{ height: '500px', maxHeight: 'calc(100vh - 3rem)' }}>
        <div className="p-2.5 border-b-2 border-primary/30 flex items-center justify-between bg-card/80 backdrop-blur flex-shrink-0">
          <div className="flex items-center gap-2">
            <NeuralFalconIcon size={20} />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider">Neural AI Co-Pilot</h3>
              <p className="text-[9px] uppercase tracking-wider opacity-70" style={{
                color: '#14F195',
                textShadow: '0 0 5px #14F195'
              }}>Solana-Native Intelligence</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0"
              onClick={() => setIsMinimized(true)}
            >
              <Minus size={10} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0"
              onClick={() => {
                setIsOpen(false)
                setIsMinimized(false)
              }}
            >
              <X size={10} />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 scrollbar-thin" ref={scrollRef} style={{ minHeight: 0 }}>
          <div className="space-y-2.5">
            {(messages || defaultMessages).map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground jagged-corner-small'
                      : 'bg-muted text-foreground jagged-corner-small border border-primary/30'
                  }`}
                >
                  <p className="text-xs leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-2 jagged-corner-small border border-primary/30">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-2.5 border-t-2 border-primary/30 bg-card/80 backdrop-blur flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1 jagged-corner-small border-primary/50 focus:border-primary text-xs h-8"
              autoComplete="off"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="jagged-corner-small h-8 w-8 p-0"
            >
              <PaperPlaneRight size={14} weight="duotone" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
