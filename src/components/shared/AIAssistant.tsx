import { useState, useRef, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import Draggable from 'react-draggable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Robot, PaperPlaneRight, X, Minus, ChatText } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

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
  const dragRef = useRef(null)
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
      const promptText = `You are an AI trading assistant for Quantum Falcon, a sophisticated crypto trading bot platform. 

Context: Quantum Falcon features AI agents for market analysis, automated trading strategies, DCA (Dollar Cost Averaging), token sniping, portfolio tracking, and a BTC profit vault.

User question: ${userInput}

Provide a helpful, concise response about trading strategies, market insights, or platform features. Keep responses under 150 words. Be professional yet friendly.`

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
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        onClick={() => setIsOpen(true)}
        style={{
          boxShadow: '0 0 20px var(--primary), 0 0 40px var(--primary)'
        }}
      >
        <Robot size={28} weight="duotone" className="group-hover:scale-110 transition-transform" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
      </motion.button>
    )
  }

  if (isMinimized) {
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="cyber-card p-4 flex items-center gap-3 cursor-pointer" onClick={() => setIsMinimized(false)}>
          <Robot size={24} weight="duotone" className="text-primary" />
          <span className="text-sm font-bold uppercase tracking-wider">AI Assistant</span>
          <Button
            size="sm"
            variant="ghost"
            className="ml-4"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(false)
              setIsMinimized(false)
            }}
          >
            <X size={16} />
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <Draggable nodeRef={dragRef} handle=".drag-handle" bounds="body">
      <motion.div
        ref={dragRef}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
      >
        <div className="cyber-card overflow-hidden flex flex-col" style={{ height: '500px', maxHeight: '80vh' }}>
          <div className="drag-handle cursor-move p-4 border-b-2 border-primary/30 flex items-center justify-between bg-card/80 backdrop-blur hover:bg-card/90 transition-colors">
            <div className="flex items-center gap-3">
              <Robot size={24} weight="duotone" className="text-primary neon-glow-primary" />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider">AI Assistant</h3>
                <p className="text-xs text-muted-foreground">Drag to reposition</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(true)}
              >
                <Minus size={16} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsOpen(false)
                  setIsMinimized(false)
                }}
              >
                <X size={16} />
              </Button>
            </div>
          </div>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {(messages || defaultMessages).map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground jagged-corner-small'
                      : 'bg-muted text-foreground jagged-corner-small border border-primary/30'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 jagged-corner-small border border-primary/30">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t-2 border-primary/30 bg-card/80 backdrop-blur">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1 jagged-corner-small border-primary/50 focus:border-primary"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="jagged-corner-small"
            >
              <PaperPlaneRight size={18} weight="duotone" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
    </Draggable>
  )
}
