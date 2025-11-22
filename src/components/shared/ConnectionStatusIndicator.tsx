// Connection Status Indicator — Real-time Status Display
// November 21, 2025 — Quantum Falcon Cockpit

import { useConnectionStatus } from '@/hooks/useConnectionStatus'
import { Circle, Warning, CheckCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export default function ConnectionStatusIndicator() {
  const status = useConnectionStatus()

  const getStatusConfig = () => {
    switch (status.overall) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-primary',
          bgColor: 'bg-primary/20',
          borderColor: 'border-primary/50',
          label: 'All Systems Online',
          pulse: true,
        }
      case 'partial':
        return {
          icon: Warning,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/50',
          label: 'Partial Connection',
          pulse: false,
        }
      case 'disconnected':
        return {
          icon: Circle,
          color: 'text-destructive',
          bgColor: 'bg-destructive/20',
          borderColor: 'border-destructive/50',
          label: 'Disconnected',
          pulse: false,
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg border',
        config.bgColor,
        config.borderColor,
        'transition-all'
      )}
      title={`${config.label} | Wallet: ${status.wallet.connected ? 'Connected' : 'Disconnected'} | Market: ${status.marketFeed.connected ? 'Connected' : 'Disconnected'}`}
    >
      <Icon
        size={14}
        weight="fill"
        className={cn(config.color, config.pulse && 'animate-pulse')}
      />
      <span className="text-xs font-medium uppercase tracking-wider">
        {config.label}
      </span>
    </div>
  )
}

