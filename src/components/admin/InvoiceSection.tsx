// ═══════════════════════════════════════════════════════════════
// INVOICE SECTION — GOD MODE ONLY
// Track every transaction, calculate taxes, export for accountant
// November 27, 2025 — CREATOR EYES ONLY
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Receipt,
  Crown,
  MagnifyingGlass,
  Export,
  CheckCircle,
  ArrowsClockwise,
  CurrencyDollar,
  ChartLineUp,
  Calendar,
  Funnel,
  CaretDown,
  CaretUp,
  Download,
  Warning,
  ShieldCheck,
  X,
  Clock,
  Tag,
  User,
  Envelope
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { usePersistentAuth } from '@/lib/auth/usePersistentAuth'
import { isGodMode } from '@/lib/godMode'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface Invoice {
  id: string
  date: number
  userId: string
  userEmail: string
  userName: string
  type: 'subscription' | 'nft' | 'royalty' | 'one-time'
  tier?: string
  description: string
  amount: number
  taxCollected: number
  state?: string
  status: 'paid' | 'pending' | 'refunded' | 'failed'
  stripeId?: string
  metadata?: Record<string, unknown>
}

interface TaxBreakdown {
  totalRevenue: number
  totalTaxCollected: number
  netIncome: number
  estimatedTaxOwed: number
  byState: Record<string, { revenue: number; tax: number }>
  byMonth: Record<string, { revenue: number; tax: number; count: number }>
  byType: Record<string, { revenue: number; count: number }>
}

// ═══════════════════════════════════════════════════════════════
// TAX RATES (2025 US Federal + State averages)
// ═══════════════════════════════════════════════════════════════

const FEDERAL_TAX_BRACKETS = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
]

const SELF_EMPLOYMENT_TAX_RATE = 0.153 // 15.3% SE tax

// ═══════════════════════════════════════════════════════════════
// MOCK DATA (Replace with real Stripe webhook data)
// ═══════════════════════════════════════════════════════════════

const generateMockInvoices = (): Invoice[] => {
  const types: Invoice['type'][] = ['subscription', 'nft', 'royalty', 'one-time']
  const tiers = ['starter', 'trader', 'pro', 'elite', 'lifetime']
  const states = ['CA', 'TX', 'NY', 'FL', 'WA', 'NV', null]
  const statuses: Invoice['status'][] = ['paid', 'paid', 'paid', 'pending', 'refunded']
  
  const invoices: Invoice[] = []
  const now = Date.now()
  
  for (let i = 0; i < 50; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const amount = type === 'subscription' 
      ? [29, 79, 149, 299, 2999][Math.floor(Math.random() * 5)]
      : type === 'nft' 
        ? Math.floor(Math.random() * 500) + 50
        : type === 'royalty'
          ? Math.floor(Math.random() * 50) + 5
          : Math.floor(Math.random() * 200) + 20
    
    const state = states[Math.floor(Math.random() * states.length)]
    const taxRate = state ? 0.0725 : 0 // Average state sales tax
    
    invoices.push({
      id: `inv_${Date.now()}_${i}`,
      date: now - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000), // Last 90 days
      userId: `user_${Math.random().toString(36).slice(2, 10)}`,
      userEmail: `user${i}@example.com`,
      userName: `User ${i}`,
      type,
      tier: type === 'subscription' ? tiers[Math.floor(Math.random() * tiers.length)] : undefined,
      description: type === 'subscription' 
        ? `${tiers[Math.floor(Math.random() * tiers.length)].toUpperCase()} Subscription`
        : type === 'nft'
          ? 'Quantum Falcon NFT Mint'
          : type === 'royalty'
            ? 'Strategy Share Royalty'
            : 'One-time Purchase',
      amount,
      taxCollected: Math.round(amount * taxRate * 100) / 100,
      state: state || undefined,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      stripeId: `pi_${Math.random().toString(36).slice(2, 18)}`,
    })
  }
  
  return invoices.sort((a, b) => b.date - a.date)
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function InvoiceSection() {
  const { auth } = usePersistentAuth()
  const isMaster = isGodMode(auth)

  // State
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortField, setSortField] = useState<'date' | 'amount'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<string>('all')

  // Load invoices
  useEffect(() => {
    const loadInvoices = async () => {
      setIsLoading(true)
      try {
        // In production, fetch from your API/database
        // const response = await fetch('/api/invoices')
        // const data = await response.json()
        
        // For now, use mock data
        const stored = localStorage.getItem('qf-invoices')
        if (stored) {
          setInvoices(JSON.parse(stored))
        } else {
          const mockData = generateMockInvoices()
          setInvoices(mockData)
          localStorage.setItem('qf-invoices', JSON.stringify(mockData))
        }
      } catch (error) {
        console.error('[Invoices] Load failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isMaster) {
      loadInvoices()
    }
  }, [isMaster])

  // Filter and sort invoices
  const filteredInvoices = useMemo(() => {
    let result = [...invoices]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(inv => 
        inv.userEmail.toLowerCase().includes(query) ||
        inv.userName.toLowerCase().includes(query) ||
        inv.description.toLowerCase().includes(query) ||
        inv.id.toLowerCase().includes(query)
      )
    }

    // Type filter
    if (filterType !== 'all') {
      result = result.filter(inv => inv.type === filterType)
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter(inv => inv.status === filterStatus)
    }

    // Month filter
    if (selectedMonth !== 'all') {
      const [year, month] = selectedMonth.split('-').map(Number)
      result = result.filter(inv => {
        const d = new Date(inv.date)
        return d.getFullYear() === year && d.getMonth() === month - 1
      })
    }

    // Sort
    result.sort((a, b) => {
      const aVal = sortField === 'date' ? a.date : a.amount
      const bVal = sortField === 'date' ? b.date : b.amount
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    })

    return result
  }, [invoices, searchQuery, filterType, filterStatus, selectedMonth, sortField, sortDir])

  // Calculate tax breakdown
  const taxBreakdown = useMemo((): TaxBreakdown => {
    const paidInvoices = invoices.filter(inv => inv.status === 'paid')
    
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0)
    const totalTaxCollected = paidInvoices.reduce((sum, inv) => sum + inv.taxCollected, 0)
    const netIncome = totalRevenue // Before expenses
    
    // Calculate federal tax
    let federalTax = 0
    let remainingIncome = netIncome
    for (const bracket of FEDERAL_TAX_BRACKETS) {
      if (remainingIncome <= 0) break
      const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min)
      federalTax += taxableInBracket * bracket.rate
      remainingIncome -= taxableInBracket
    }
    
    // Self-employment tax
    const seTax = netIncome * SELF_EMPLOYMENT_TAX_RATE
    
    const estimatedTaxOwed = federalTax + seTax
    
    // By state
    const byState: Record<string, { revenue: number; tax: number }> = {}
    paidInvoices.forEach(inv => {
      const state = inv.state || 'Unknown'
      if (!byState[state]) byState[state] = { revenue: 0, tax: 0 }
      byState[state].revenue += inv.amount
      byState[state].tax += inv.taxCollected
    })
    
    // By month
    const byMonth: Record<string, { revenue: number; tax: number; count: number }> = {}
    paidInvoices.forEach(inv => {
      const d = new Date(inv.date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!byMonth[key]) byMonth[key] = { revenue: 0, tax: 0, count: 0 }
      byMonth[key].revenue += inv.amount
      byMonth[key].tax += inv.taxCollected
      byMonth[key].count++
    })
    
    // By type
    const byType: Record<string, { revenue: number; count: number }> = {}
    paidInvoices.forEach(inv => {
      if (!byType[inv.type]) byType[inv.type] = { revenue: 0, count: 0 }
      byType[inv.type].revenue += inv.amount
      byType[inv.type].count++
    })
    
    return { totalRevenue, totalTaxCollected, netIncome, estimatedTaxOwed, byState, byMonth, byType }
  }, [invoices])

  // Get available months
  const availableMonths = useMemo(() => {
    const months = new Set<string>()
    invoices.forEach(inv => {
      const d = new Date(inv.date)
      months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    })
    return Array.from(months).sort().reverse()
  }, [invoices])

  // Export to CSV
  const exportToCSV = useCallback(() => {
    const headers = ['Date', 'ID', 'User', 'Email', 'Type', 'Description', 'Amount', 'Tax', 'State', 'Status', 'Stripe ID']
    const rows = filteredInvoices.map(inv => [
      new Date(inv.date).toISOString(),
      inv.id,
      inv.userName,
      inv.userEmail,
      inv.type,
      inv.description,
      inv.amount.toFixed(2),
      inv.taxCollected.toFixed(2),
      inv.state || '',
      inv.status,
      inv.stripeId || '',
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quantum-falcon-invoices-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Invoices Exported', { description: `${filteredInvoices.length} invoices exported to CSV` })
  }, [filteredInvoices])

  // Mark as paid
  const markAsPaid = useCallback((invoiceId: string) => {
    setInvoices(prev => {
      const updated = prev.map(inv => 
        inv.id === invoiceId ? { ...inv, status: 'paid' as const } : inv
      )
      localStorage.setItem('qf-invoices', JSON.stringify(updated))
      return updated
    })
    toast.success('Invoice marked as paid')
  }, [])

  // Process refund
  const processRefund = useCallback((invoiceId: string) => {
    if (!confirm('Are you sure you want to process a refund? This will mark the invoice as refunded.')) return
    
    setInvoices(prev => {
      const updated = prev.map(inv => 
        inv.id === invoiceId ? { ...inv, status: 'refunded' as const } : inv
      )
      localStorage.setItem('qf-invoices', JSON.stringify(updated))
      return updated
    })
    toast.success('Refund processed')
  }, [])

  // Access denied for non-master users
  if (!isMaster) {
    return (
      <div className="cyber-card p-8 text-center">
        <ShieldCheck size={64} className="mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          This section is only available to the creator.
        </p>
      </div>
    )
  }

  // Tax season readiness
  const trackedPercent = invoices.length > 0 
    ? (invoices.filter(i => i.status !== 'pending').length / invoices.length) * 100 
    : 0

  return (
    <div className="space-y-6">
      {/* Header with Rainbow Border */}
      <div className="relative p-1 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 via-cyan-500 to-pink-500 animate-gradient-x">
        <div className="cyber-card p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown size={32} weight="fill" className="text-amber-400" />
              <div>
                <h2 className="text-2xl font-black uppercase tracking-wider">
                  Invoices & Taxes
                </h2>
                <p className="text-xs text-muted-foreground">
                  Creator eyes only — Track every dollar
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {trackedPercent >= 90 && (
                <Badge className="bg-green-500 text-black px-3 py-1">
                  <CheckCircle size={14} className="mr-1" />
                  TAX SEASON READY
                </Badge>
              )}
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download size={16} className="mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="cyber-card p-4 border-2 border-green-500/50">
          <div className="flex items-center gap-2 mb-2">
            <CurrencyDollar size={20} className="text-green-400" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Total Revenue
            </span>
          </div>
          <p className="text-3xl font-black text-green-400">
            ${taxBreakdown.totalRevenue.toLocaleString()}
          </p>
        </div>

        <div className="cyber-card p-4 border-2 border-cyan-500/50">
          <div className="flex items-center gap-2 mb-2">
            <Receipt size={20} className="text-cyan-400" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Tax Collected
            </span>
          </div>
          <p className="text-3xl font-black text-cyan-400">
            ${taxBreakdown.totalTaxCollected.toLocaleString()}
          </p>
        </div>

        <div className="cyber-card p-4 border-2 border-purple-500/50">
          <div className="flex items-center gap-2 mb-2">
            <ChartLineUp size={20} className="text-purple-400" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Net Income
            </span>
          </div>
          <p className="text-3xl font-black text-purple-400">
            ${taxBreakdown.netIncome.toLocaleString()}
          </p>
        </div>

        <div className="cyber-card p-4 border-2 border-amber-500/50">
          <div className="flex items-center gap-2 mb-2">
            <Warning size={20} className="text-amber-400" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Est. Tax Owed
            </span>
          </div>
          <p className="text-3xl font-black text-amber-400">
            ${Math.round(taxBreakdown.estimatedTaxOwed).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Federal + SE Tax ({((taxBreakdown.estimatedTaxOwed / taxBreakdown.netIncome) * 100 || 0).toFixed(1)}%)
          </p>
        </div>
      </div>

      {/* Revenue by Type */}
      <div className="cyber-card p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Tag size={18} className="text-primary" />
          Revenue by Type
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(taxBreakdown.byType).map(([type, data]) => (
            <div key={type} className="p-3 bg-muted/20 border border-muted rounded-lg">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                {type}
              </p>
              <p className="text-xl font-bold">${data.revenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{data.count} transactions</p>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="cyber-card p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-primary" />
          Monthly Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {Object.entries(taxBreakdown.byMonth).slice(0, 6).map(([month, data]) => (
            <div key={month} className="p-3 bg-muted/20 border border-muted rounded-lg">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                {new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
              <p className="text-lg font-bold text-primary">${data.revenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{data.count} sales</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="cyber-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Type Filter */}
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
              <SelectItem value="nft">NFT</SelectItem>
              <SelectItem value="royalty">Royalty</SelectItem>
              <SelectItem value="one-time">One-time</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>

          {/* Month Filter */}
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              {availableMonths.map(month => (
                <SelectItem key={month} value={month}>
                  {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (sortField === 'date') {
                setSortDir(d => d === 'desc' ? 'asc' : 'desc')
              } else {
                setSortField('date')
                setSortDir('desc')
              }
            }}
            className={sortField === 'date' ? 'border-primary' : ''}
          >
            Date {sortField === 'date' && (sortDir === 'desc' ? <CaretDown size={14} className="ml-1" /> : <CaretUp size={14} className="ml-1" />)}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (sortField === 'amount') {
                setSortDir(d => d === 'desc' ? 'asc' : 'desc')
              } else {
                setSortField('amount')
                setSortDir('desc')
              }
            }}
            className={sortField === 'amount' ? 'border-primary' : ''}
          >
            Amount {sortField === 'amount' && (sortDir === 'desc' ? <CaretDown size={14} className="ml-1" /> : <CaretUp size={14} className="ml-1" />)}
          </Button>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="cyber-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">
            {filteredInvoices.length} Invoices
          </h3>
          <Badge variant="outline">
            Total: ${filteredInvoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.amount : 0), 0).toLocaleString()}
          </Badge>
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="text-center py-8">
              <ArrowsClockwise size={32} className="animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground mt-2">Loading invoices...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No invoices found
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card border-b border-muted">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Description</th>
                  <th className="pb-3 pr-4 text-right">Amount</th>
                  <th className="pb-3 pr-4 text-right">Tax</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/50">
                {filteredInvoices.map((invoice) => (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-muted/20"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-muted-foreground" />
                        {new Date(invoice.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div>
                        <p className="font-medium">{invoice.userName}</p>
                        <p className="text-xs text-muted-foreground">{invoice.userEmail}</p>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant="outline" className="text-xs capitalize">
                        {invoice.type}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="truncate max-w-[150px]">{invoice.description}</p>
                    </td>
                    <td className="py-3 pr-4 text-right font-mono font-bold">
                      ${invoice.amount.toFixed(2)}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-muted-foreground">
                      ${invoice.taxCollected.toFixed(2)}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge className={cn(
                        'text-xs',
                        invoice.status === 'paid' && 'bg-green-500/20 text-green-400 border-green-500/50',
                        invoice.status === 'pending' && 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
                        invoice.status === 'refunded' && 'bg-red-500/20 text-red-400 border-red-500/50',
                      )}>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        {invoice.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsPaid(invoice.id)}
                            className="h-7 px-2 text-xs"
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Paid
                          </Button>
                        )}
                        {invoice.status === 'paid' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => processRefund(invoice.id)}
                            className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                          >
                            <X size={14} className="mr-1" />
                            Refund
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </ScrollArea>
      </div>

      {/* Tax Season Progress */}
      <div className="cyber-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            Tax Season Readiness
          </h3>
          <span className="text-sm font-mono">{trackedPercent.toFixed(0)}%</span>
        </div>
        <Progress value={trackedPercent} className="h-3" />
        <p className="text-xs text-muted-foreground mt-2">
          {invoices.filter(i => i.status === 'pending').length} pending invoices need attention
        </p>
      </div>
    </div>
  )
}

