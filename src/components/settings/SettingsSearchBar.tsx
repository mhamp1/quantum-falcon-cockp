import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchResult {
  id: string
  label: string
  description: string
  tab: string
  section: string
}

interface SettingsSearchBarProps {
  onResultSelect: (tabId: string, sectionId: string) => void
}

export default function SettingsSearchBar({ onResultSelect }: SettingsSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const searchableSettings: SearchResult[] = useMemo(() => [
    { id: 'security-2fa', label: 'Two-Factor Authentication', description: '2FA protection for your account', tab: 'security', section: 'security-2fa' },
    { id: 'security-biometric', label: 'Biometric Auth', description: 'Fingerprint or Face ID login', tab: 'security', section: 'security-biometric' },
    { id: 'security-logout', label: 'Auto Logout', description: 'Automatic logout timer', tab: 'security', section: 'security-logout' },
    { id: 'security-sessions', label: 'View Sessions', description: 'Active login sessions', tab: 'security', section: 'security-sessions' },
    { id: 'security-password', label: 'Change Password', description: 'Update account password', tab: 'security', section: 'security-password' },
    { id: 'notifications-trade', label: 'Trade Alerts', description: 'Real-time trade notifications', tab: 'app', section: 'notifications' },
    { id: 'notifications-price', label: 'Price Alerts', description: 'Market price movement alerts', tab: 'app', section: 'notifications' },
    { id: 'notifications-push', label: 'Push Notifications', description: 'Browser push notifications', tab: 'app', section: 'notifications' },
    { id: 'audio-effects', label: 'Sound Effects', description: 'UI interaction sounds', tab: 'app', section: 'audio' },
    { id: 'audio-music', label: 'Ambient Music', description: 'Background audio', tab: 'app', section: 'audio' },
    { id: 'audio-volume', label: 'Volume Control', description: 'Adjust audio levels', tab: 'app', section: 'audio' },
    { id: 'trading-paper', label: 'Paper Trading', description: 'Simulated trading mode', tab: 'app', section: 'trading' },
    { id: 'trading-confirm', label: 'Confirm Trades', description: 'Require trade confirmation', tab: 'app', section: 'trading' },
    { id: 'trading-slippage', label: 'Slippage Tolerance', description: 'Trade execution slippage', tab: 'app', section: 'trading' },
    { id: 'network-rpc', label: 'RPC Endpoint', description: 'Network connection settings', tab: 'app', section: 'network' },
    { id: 'network-priority', label: 'Priority Fees', description: 'Faster transaction processing', tab: 'app', section: 'network' },
    { id: 'display-theme', label: 'Theme Style', description: 'Choose visual theme', tab: 'app', section: 'display' },
    { id: 'display-contrast', label: 'High Contrast', description: 'Accessibility mode', tab: 'app', section: 'display' },
    { id: 'display-animations', label: 'Animations', description: 'Motion effects', tab: 'app', section: 'display' },
    { id: 'display-compact', label: 'Compact Mode', description: 'Dense layout option', tab: 'app', section: 'display' },
    { id: 'api-phantom', label: 'Phantom Wallet', description: 'Connect Phantom wallet', tab: 'api', section: 'wallets' },
    { id: 'api-jupiter', label: 'Jupiter Aggregator', description: 'DEX aggregation', tab: 'api', section: 'dex' },
    { id: 'subscription-upgrade', label: 'Upgrade Plan', description: 'View subscription tiers', tab: 'subscription', section: 'tiers' },
    { id: 'legal-terms', label: 'Terms of Service', description: 'Platform terms and conditions', tab: 'legal', section: 'terms' },
    { id: 'legal-privacy', label: 'Privacy Policy', description: 'Data protection policy', tab: 'legal', section: 'privacy' },
    { id: 'legal-disclaimer', label: 'Risk Disclaimer', description: 'Trading risk information', tab: 'legal', section: 'disclaimer' },
    { id: 'profile-edit', label: 'Edit Profile', description: 'Update profile information', tab: 'profile', section: 'profile-edit' },
    { id: 'achievements-view', label: 'Achievements', description: 'View unlocked achievements', tab: 'achievements', section: 'achievements-list' },
  ], [])

  const filteredResults = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return []
    
    const term = searchTerm.toLowerCase()
    return searchableSettings.filter(setting => 
      setting.label.toLowerCase().includes(term) ||
      setting.description.toLowerCase().includes(term) ||
      setting.section.toLowerCase().includes(term)
    ).slice(0, 8)
  }, [searchTerm, searchableSettings])

  useEffect(() => {
    if (filteredResults.length > 0 && searchTerm.length >= 2) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [filteredResults, searchTerm])

  const handleSelect = (result: SearchResult) => {
    onResultSelect(result.tab, result.section)
    setSearchTerm('')
    setIsOpen(false)
    
    setTimeout(() => {
      const element = document.getElementById(result.section)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.classList.add('animate-pulse-glow')
        setTimeout(() => element.classList.remove('animate-pulse-glow'), 2000)
      }
    }, 300)
  }

  const handleClear = () => {
    setSearchTerm('')
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <div className="relative">
        <MagnifyingGlass 
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" 
          weight="duotone"
        />
        <Input 
          placeholder="Search settings... (2FA, theme, trading, etc.)" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => filteredResults.length > 0 && setIsOpen(true)}
          className="pl-10 pr-10 bg-background/60 border-primary/30 focus:border-primary transition-all neon-search"
          aria-label="Search settings"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X size={16} weight="bold" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && filteredResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <div className="cyber-card border-2 border-primary/50 overflow-hidden max-h-[400px] overflow-y-auto scrollbar-thin">
              <div className="p-2 space-y-1">
                {filteredResults.map((result) => (
                  <motion.button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-left p-3 bg-background/40 hover:bg-primary/20 border border-transparent hover:border-primary/50 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold uppercase tracking-wide text-xs mb-1 text-foreground group-hover:text-primary transition-colors">
                          {result.label}
                        </h4>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {result.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="text-[9px] px-2 py-1 bg-primary/20 border border-primary/30 text-primary uppercase tracking-wider">
                          {result.tab}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
              
              <div className="p-2 border-t border-primary/30 bg-primary/5">
                <p className="text-[9px] text-muted-foreground text-center uppercase tracking-wider">
                  {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found • Press Enter to select first
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && searchTerm.length > 0 && filteredResults.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-full left-0 right-0 mt-2 z-50"
        >
          <div className="cyber-card-accent border-2 border-accent/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              No settings found for "<span className="text-accent font-bold">{searchTerm}</span>"
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try searching for: 2FA, theme, trading, notifications
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
