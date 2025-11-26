import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ClockClockwise, 
  Download, 
  Trash, 
  FunnelSimple,
  CaretDown,
  CaretUp
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface ChangeLogEntry {
  id: string
  timestamp: number
  setting: string
  oldValue: string
  newValue: string
  category: string
}

export default function ChangeLog() {
  const [changeLog, setChangeLog] = useKV<ChangeLogEntry[]>('settings-change-log', [])
  const [filter, setFilter] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const categories = ['all', 'security', 'notifications', 'audio', 'trading', 'network', 'display', 'theme']

  const filteredLog = changeLog
    ? changeLog
        .filter(entry => filter === 'all' || entry.category === filter)
        .sort((a, b) => sortOrder === 'desc' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp)
    : []

  const exportToCSV = () => {
    if (!changeLog || changeLog.length === 0) {
      toast.error('No changes to export')
      return
    }

    const headers = ['Date', 'Time', 'Setting', 'Old Value', 'New Value', 'Category']
    const rows = changeLog.map(entry => {
      const date = new Date(entry.timestamp)
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        entry.setting,
        entry.oldValue,
        entry.newValue,
        entry.category
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quantum-falcon-changes-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Change log exported successfully')
  }

  const clearLog = () => {
    if (window.confirm('Are you sure you want to clear the entire change log? This cannot be undone.')) {
      setChangeLog([])
      toast.success('Change log cleared')
    }
  }

  const formatValue = (value: string): string => {
    if (value === 'true') return 'ENABLED'
    if (value === 'false') return 'DISABLED'
    if (!isNaN(Number(value)) && value.length < 10) return value
    if (value.length > 50) return value.substring(0, 47) + '...'
    return value
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 jagged-corner bg-accent/20 border-2 border-accent">
          <ClockClockwise size={24} weight="duotone" className="text-accent" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold uppercase tracking-wide">Change Log</h2>
          <p className="text-sm text-muted-foreground">Track all modifications to your settings</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={exportToCSV}
            disabled={!changeLog || changeLog.length === 0}
            className="border-primary text-primary hover:bg-primary/10"
          >
            <Download size={16} weight="duotone" className="mr-2" />
            Export CSV
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={clearLog}
            disabled={!changeLog || changeLog.length === 0}
          >
            <Trash size={16} weight="duotone" className="mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="cyber-card p-4">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <FunnelSimple size={16} weight="duotone" className="text-primary" />
            <span className="data-label text-xs">FILTER:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-all ${
                  filter === cat
                    ? 'bg-primary/20 border-2 border-primary text-primary'
                    : 'bg-muted/20 border border-muted/30 text-muted-foreground hover:border-primary/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="ml-auto flex items-center gap-2 px-3 py-1 bg-accent/20 border border-accent/30 text-accent hover:bg-accent/30 transition-all"
          >
            {sortOrder === 'desc' ? (
              <CaretDown size={14} weight="bold" />
            ) : (
              <CaretUp size={14} weight="bold" />
            )}
            <span className="text-xs font-bold uppercase tracking-wider">
              {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
            </span>
          </button>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          {!changeLog || changeLog.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="inline-flex p-4 bg-muted/20 border-2 border-muted/30 jagged-corner">
                <ClockClockwise size={48} weight="duotone" className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No changes recorded yet</p>
              <p className="text-xs text-muted-foreground">
                Settings modifications will appear here for audit and review
              </p>
            </div>
          ) : filteredLog.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-sm text-muted-foreground">
                No changes found for category: <span className="text-primary font-bold uppercase">{filter}</span>
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setFilter('all')}
                className="border-primary text-primary hover:bg-primary/10"
              >
                Show All Changes
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLog.map((entry, index) => {
                const date = new Date(entry.timestamp)
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    className="p-4 bg-background/60 border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/50 group-hover:w-2 transition-all" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_1fr_100px] gap-3 items-start">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Timestamp</p>
                        <p className="text-sm font-mono text-primary">
                          {date.toLocaleString([], { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Setting</p>
                        <p className="text-sm font-bold uppercase tracking-wide">{entry.setting}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Change</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-1 bg-destructive/20 border border-destructive/30 text-destructive text-xs font-mono">
                            {formatValue(entry.oldValue)}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="px-2 py-1 bg-primary/20 border border-primary/30 text-primary text-xs font-mono">
                            {formatValue(entry.newValue)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Category</p>
                        <span className="inline-block px-2 py-1 bg-accent/20 border border-accent/30 text-accent text-xs font-bold uppercase tracking-wider">
                          {entry.category}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        {filteredLog.length > 0 && (
          <div className="mt-4 pt-4 border-t border-primary/30 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing <span className="text-primary font-bold">{filteredLog.length}</span> of{' '}
              <span className="text-primary font-bold">{changeLog?.length || 0}</span> total changes
            </p>
            <p className="text-xs text-muted-foreground">
              Retention: Last 90 days • Auto-purged after 90 days
            </p>
          </div>
        )}
      </div>

      <div className="cyber-card-accent p-4">
        <div className="flex gap-3">
          <ClockClockwise size={20} weight="duotone" className="text-accent flex-shrink-0" />
          <div className="space-y-2 text-xs">
            <p className="font-bold uppercase tracking-wide">Privacy & Security</p>
            <p className="text-muted-foreground leading-relaxed">
              Change logs are stored locally and never leave your device. Sensitive data like passwords are
              automatically masked. Logs are retained for 90 days and then automatically purged for your privacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
