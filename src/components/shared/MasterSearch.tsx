// FINAL ELITE FEATURES: Master Search (Cmd+K) + Discord Integration — 100% live app match — November 20, 2025

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlass, 
  House, 
  Terminal, 
  ChartLine, 
  Lightning, 
  Code, 
  Vault, 
  Users, 
  Robot,
  Gear,
  FileText,
  CaretRight,
  ArrowsClockwise,
  CurrencyCircleDollar
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { soundEffects } from '@/lib/soundEffects';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'navigation' | 'strategy' | 'log' | 'setting' | 'action';
  icon: any;
  action: () => void;
}

interface MasterSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MasterSearch({ isOpen, onClose }: MasterSearchProps) {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allResults: SearchResult[] = useMemo(() => [
    {
      id: 'nav-dashboard',
      title: 'Dashboard',
      description: 'Overview of your trading performance',
      category: 'navigation',
      icon: House,
      action: () => {
        window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'dashboard' }));
        onClose();
      }
    },
    {
      id: 'nav-bot-overview',
      title: 'Bot Overview',
      description: 'Monitor AI agent activity and status',
      category: 'navigation',
      icon: Terminal,
      action: () => {
        window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'bot-overview' }));
        onClose();
      }
    },
    {
      id: 'nav-multi-agent',
      title: 'AI Agents',
      description: 'Manage your multi-agent trading system',
      category: 'navigation',
      icon: Robot,
      action: () => {
        window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'multi-agent' }));
        onClose();
      }
    },
    {
      id: 'nav-analytics',
      title: 'Analytics',
      description: 'Deep dive into trading metrics',
      category: 'navigation',
      icon: ChartLine,
      action: () => {
        window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'analytics' }));
        onClose();
      }
    },
    {
      id: 'nav-trading',
      title: 'Trading Hub',
      description: 'Execute and manage trades',
      category: 'navigation',
      icon: Lightning,
      action: () => {
        window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'trading' }));
        onClose();
      }
    },
    {
      id: 'nav-strategy-builder',
      title: 'Strategy Builder',
      description: 'Create and backtest trading strategies',
      category: 'navigation',
      icon: Code,
      action: () => {
        window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'strategy-builder' }));
        onClose();
      }
    },
    {
      id: 'nav-vault',
      title: 'Vault',
      description: 'Secure asset management',
      category: 'navigation',
      icon: Vault,
      action: () => {
        window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'vault' }));
        onClose();
      }
    },
    {
      id: 'nav-community',
      title: 'Community',
      description: 'Connect with other traders',
      category: 'navigation',
      icon: Users,
      action: () => {
        window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'community' }));
        onClose();
      }
    },
    {
      id: 'nav-settings',
      title: 'Settings',
      description: 'Configure your account and preferences',
      category: 'navigation',
      icon: Gear,
      action: () => {
        window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'settings' }));
        onClose();
      }
    },
    {
      id: 'action-create-strategy',
      title: 'Create New Strategy',
      description: 'Start building a custom trading strategy',
      category: 'action',
      icon: Code,
      action: () => {
        window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'strategy-builder' }));
        onClose();
      }
    },
    {
      id: 'action-refresh-data',
      title: 'Refresh All Data',
      description: 'Force refresh trading data and analytics',
      category: 'action',
      icon: ArrowsClockwise,
      action: () => {
        window.location.reload();
        onClose();
      }
    },
    {
      id: 'action-view-logs',
      title: 'View System Logs',
      description: 'Check detailed bot activity logs',
      category: 'log',
      icon: FileText,
      action: () => {
        window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'bot-overview' }));
        onClose();
      }
    },
    {
      id: 'setting-api-keys',
      title: 'API Keys',
      description: 'Manage exchange API credentials',
      category: 'setting',
      icon: Gear,
      action: () => {
        window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'settings' }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('open-settings-api-tab')), 100);
        onClose();
      }
    },
    {
      id: 'setting-risk-limits',
      title: 'Risk Limits',
      description: 'Configure maximum position sizes',
      category: 'setting',
      icon: Gear,
      action: () => {
        window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'settings' }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('open-settings-risk-tab')), 100);
        onClose();
      }
    },
    {
      id: 'setting-discord',
      title: 'Discord Integration',
      description: 'Connect your Discord account',
      category: 'setting',
      icon: Users,
      action: () => {
        window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'settings' }));
        setTimeout(() => window.dispatchEvent(new CustomEvent('open-settings-community-tab')), 100);
        onClose();
      }
    },
    {
      id: 'strategy-dca',
      title: 'DCA Strategy',
      description: 'Dollar-cost averaging template',
      category: 'strategy',
      icon: CurrencyCircleDollar,
      action: () => {
        window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'strategy-builder' }));
        onClose();
      }
    },
    {
      id: 'strategy-momentum',
      title: 'Momentum Trading',
      description: 'Trend-following strategy template',
      category: 'strategy',
      icon: ChartLine,
      action: () => {
        window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'strategy-builder' }));
        onClose();
      }
    },
  ], [onClose]);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return allResults.slice(0, 8);
    
    const query = searchQuery.toLowerCase();
    return allResults.filter(result => 
      result.title.toLowerCase().includes(query) ||
      result.description.toLowerCase().includes(query) ||
      result.category.toLowerCase().includes(query)
    );
  }, [searchQuery, allResults]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredResults.length - 1));
        soundEffects.playHover();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        soundEffects.playHover();
      } else if (e.key === 'Enter' && filteredResults[selectedIndex]) {
        e.preventDefault();
        soundEffects.playClick();
        filteredResults[selectedIndex].action();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex, onClose]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'navigation': return 'text-cyan-400';
      case 'strategy': return 'text-purple-400';
      case 'log': return 'text-yellow-400';
      case 'setting': return 'text-pink-400';
      case 'action': return 'text-green-400';
      default: return 'text-muted-foreground';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[100]"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: -50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed z-[101] angled-corners-dual-tr-bl overflow-hidden',
              isMobile 
                ? 'inset-x-4 top-20' 
                : 'left-1/2 top-32 -translate-x-1/2 w-full max-w-2xl'
            )}
            style={{
              background: 'linear-gradient(135deg, oklch(0.10 0.02 280 / 0.95) 0%, oklch(0.12 0.03 280 / 0.92) 100%)',
              backdropFilter: 'blur(24px)',
              border: '1px solid oklch(0.72 0.20 195 / 0.3)',
              boxShadow: '0 0 40px oklch(0.72 0.20 195 / 0.3), inset 0 1px 0 oklch(0.72 0.20 195 / 0.15)',
            }}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <MagnifyingGlass size={24} className="text-primary" weight="bold" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-0 border-b border-primary/30 rounded-none px-0 text-lg focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/50"
                  style={{
                    boxShadow: 'none',
                  }}
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted/30 rounded border border-border/50 text-muted-foreground">
                  ESC
                </kbd>
              </div>

              <div className="max-h-[400px] overflow-y-auto scrollbar-thin space-y-1">
                {filteredResults.length > 0 ? (
                  filteredResults.map((result, index) => {
                    const Icon = result.icon;
                    const isSelected = index === selectedIndex;
                    
                    return (
                      <motion.button
                        key={result.id}
                        onClick={() => {
                          soundEffects.playClick();
                          result.action();
                        }}
                        onMouseEnter={() => {
                          setSelectedIndex(index);
                          soundEffects.playHover();
                        }}
                        className={cn(
                          'w-full flex items-center gap-4 p-3 rounded-lg transition-all text-left group',
                          isSelected 
                            ? 'bg-primary/10 border border-primary/30' 
                            : 'hover:bg-white/5 border border-transparent'
                        )}
                        whileHover={{ x: 4 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      >
                        <div 
                          className={cn(
                            'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                            isSelected ? 'bg-primary/20' : 'bg-muted/20'
                          )}
                        >
                          <Icon 
                            size={20} 
                            className={isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}
                            weight={isSelected ? 'fill' : 'regular'}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className={cn(
                              'text-sm font-semibold truncate',
                              isSelected ? 'text-foreground' : 'text-foreground/80'
                            )}>
                              {result.title}
                            </h4>
                            <span className={cn(
                              'text-xs uppercase tracking-wider font-semibold',
                              getCategoryColor(result.category)
                            )}>
                              {result.category}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {result.description}
                          </p>
                        </div>

                        {isSelected && (
                          <CaretRight size={16} className="text-primary flex-shrink-0" weight="bold" />
                        )}
                      </motion.button>
                    );
                  })
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <div className="text-muted-foreground">
                      <MagnifyingGlass size={48} className="mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No results found for "{searchQuery}"</p>
                    </div>
                    <Button
                      onClick={() => {
                        soundEffects.playClick();
                        window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'strategy-builder' }));
                        onClose();
                      }}
                      className="mx-auto"
                      variant="outline"
                    >
                      <Code size={16} className="mr-2" />
                      Create New Strategy
                    </Button>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 bg-muted/30 rounded border border-border/50">↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 bg-muted/30 rounded border border-border/50">↵</kbd>
                    Select
                  </span>
                </div>
                <span className="uppercase tracking-wider opacity-50">Master Search</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
