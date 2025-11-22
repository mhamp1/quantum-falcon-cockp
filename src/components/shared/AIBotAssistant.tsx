// AI Helper Bot - Bottom-right floating orb with chat panel
// Purple-cyan gradient bubble, smooth animations
// FIX: AI Bot no longer covers aggression slider - intelligent repositioning

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PaperPlaneRight, Sparkle, Lightning, Robot } from '@phosphor-icons/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useKV } from '@github/spark/hooks';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLiveTradingData } from '@/hooks/useLiveTradingData';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: number;
}

const SUGGESTED_QUESTIONS = [
  "How do I create a strategy?",
  "What's the best aggression level?",
  "Explain the Multi-Agent System",
  "How to upgrade to PRO+?",
];

const BOT_RESPONSES: Record<string, string> = {
  default: "I'm your AI assistant for Quantum Falcon Cockpit! Ask me about strategies, agents, or trading features.",
  strategy: "Navigate to Strategy Builder to create custom trading strategies using our Monaco Editor with AI assistance!",
  aggression: "Bot aggression controls risk levels. 0-30 = Conservative, 30-70 = Moderate, 70-100 = Aggressive. Start with 50 for balanced trading.",
  agents: "The Multi-Agent System uses 3 specialized AI agents: Market Analyst (pattern detection), Strategy Engine (execution), and RL Optimizer (self-learning).",
  upgrade: "Upgrade to PRO+ for unlimited strategies, advanced AI features, and priority support! Click any 'UPGRADE TO PRO+' button to get started.",
};

export default function AIBotAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "👋 Hey! I'm your AI trading assistant. How can I help you today?",
      isBot: true,
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const isMobile = useIsMobile();
  const [showAggressionPanel] = useKV<boolean>('show-aggression-panel', false);

  const getOrbPosition = useMemo(() => {
    if (isMobile) {
      return {
        bottom: '90px',
        right: '16px',
        opacity: showAggressionPanel ? 0.8 : 1
      };
    }

    // FIX: AI Bot repositioning - move higher when aggression panel is open
    if (showAggressionPanel) {
      return {
        bottom: '32px',
        right: '32px', // Keep on right side, just move higher to avoid overlap
      };
    }

    return {
      bottom: '32px',
      right: '32px'
    };
  }, [isMobile, showAggressionPanel]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const liveData = useLiveTradingData();

  const getBotResponse = useCallback(async (userMessage: string): Promise<string> => {
    // Try to use real AI with live data
    try {
      const promptText = `You are an AI trading assistant for Quantum Falcon, a sophisticated crypto trading bot platform.

Context: Quantum Falcon features AI agents for market analysis, automated trading strategies, DCA (Dollar Cost Averaging), token sniping, portfolio tracking, and a BTC profit vault.

Live Trading Data:
- Portfolio Value: $${liveData.portfolioValue.toFixed(2)}
- Daily P&L: ${liveData.dailyPnL >= 0 ? '+' : ''}$${liveData.dailyPnL.toFixed(2)}
- Win Rate: ${liveData.winRate.toFixed(1)}%
- Active Trades: ${liveData.activeTrades}

User question: ${userMessage}

Provide a helpful, concise response (under 150 words). Be professional yet friendly with actionable insights.`;

      if (typeof window !== 'undefined' && window.spark?.llm) {
        const response = await window.spark.llm(promptText, 'gpt-4o-mini');
        return response || BOT_RESPONSES.default;
      }
    } catch (error) {
      console.warn('[AIBotAssistant] AI call failed, using fallback:', error);
    }

    // Fallback to pattern matching if AI unavailable
    const lower = userMessage.toLowerCase();
    if (lower.includes('strategy') || lower.includes('create') || lower.includes('build')) {
      return BOT_RESPONSES.strategy;
    }
    if (lower.includes('aggression') || lower.includes('risk') || lower.includes('level')) {
      return BOT_RESPONSES.aggression;
    }
    if (lower.includes('agent') || lower.includes('ai') || lower.includes('multi')) {
      return BOT_RESPONSES.agents;
    }
    if (lower.includes('upgrade') || lower.includes('pro') || lower.includes('premium')) {
      return BOT_RESPONSES.upgrade;
    }
    return BOT_RESPONSES.default;
  }, [liveData]);

  const handleSendMessage = useCallback(async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: messageText,
      isBot: false,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Get bot response (AI or fallback)
    setIsTyping(true);
    try {
      const response = await getBotResponse(messageText);
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: response,
        isBot: true,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('[AIBotAssistant] Error getting response:', error);
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: "I'm having trouble processing that right now. Please try again in a moment.",
        isBot: true,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, getBotResponse]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <motion.div 
      className="fixed z-[9999]"
      animate={getOrbPosition}
      transition={{ 
        type: 'spring', 
        damping: 25, 
        stiffness: 300,
        duration: 0.4 
      }}
    >
      {/* Floating Orb Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 shadow-2xl flex items-center justify-center cursor-pointer group relative"
            style={{
              boxShadow: '0 0 30px rgba(168, 85, 247, 0.5), 0 0 60px rgba(168, 85, 247, 0.3)',
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkle size={28} weight="fill" className="text-white" />
            </motion.div>
            
            {/* Pulse ring - extra visible when repositioned */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-purple-400"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Position indicator pulse when panel is open */}
            {showAggressionPanel && !isMobile && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-yellow-400"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.6 }}
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="absolute bottom-0 right-0 w-96 h-[600px] cyber-card-accent flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 border-b border-purple-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <Robot size={20} weight="fill" className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">AI Assistant</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-green-400">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.isBot
                        ? 'bg-purple-500/20 text-foreground border border-purple-500/30'
                        : 'bg-cyan-500/20 text-foreground border border-cyan-500/30'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <motion.div
                        className="w-2 h-2 bg-purple-400 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-purple-400 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-purple-400 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map((question, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(question)}
                      className="text-xs px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-purple-500/30 bg-black/30">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-black/50 border-purple-500/30"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  size="icon"
                  disabled={!inputValue.trim()}
                  className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600"
                >
                  <PaperPlaneRight size={18} weight="fill" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
