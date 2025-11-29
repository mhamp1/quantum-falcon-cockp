// ═══════════════════════════════════════════════════════════════
// INVOICE SECTION — FINANCE COMMAND CENTER — GOD-TIER v2025.1.0
// Real-time revenue tracking, tax calculation, forecasting
// November 29, 2025 — CREATOR EYES ONLY — OPERATIONAL
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Receipt, Crown, MagnifyingGlass, CheckCircle, ArrowsClockwise,
  CurrencyDollar, ChartLineUp, Calendar, CaretDown, CaretUp,
  Download, Warning, ShieldCheck, X, Clock, Tag, TrendUp as TrendingUp,
  Users, Brain, ArrowUp, ArrowDown, Percent, Building
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
import { useKVSafe } from '@/hooks/useKVFallback'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, ReferenceLine
} from 'recharts'

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
  paymentMethod?: string
  last4?: string
  metadata?: Record<string, unknown>
}

interface TaxBreakdown {
  totalRevenue: number
  totalTaxCollected: number
  netIncome: number
  estimatedTaxOwed: number
  mrr: number
  ltv: number
  churnRate: number
  arpu: number
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

const SELF_EMPLOYMENT_TAX_RATE = 0.153

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function InvoiceSection() {
  const { auth } = usePersistentAuth()
  const isMaster = isGodMode(auth)

  // Use KV storage for persistent invoices
  const [invoices, setInvoices] = useKVSafe<Invoice[]>('qf-invoices-v4', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortField, setSortField] = useState<'date' | 'amount'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [activeUsers, setActiveUsers] = useState(0)

  // Listen for real-time Stripe webhook events
  useEffect(() => {
    const handleStripeInvoice = (e: CustomEvent<Invoice>) => {
      const newInvoice = e.detail
      setInvoices(prev => {
        const exists = prev?.some(inv => inv.stripeId === newInvoice.stripeId)
        if (exists) return prev
        const updated = [newInvoice, ...(prev || [])]
        return updated
      })
      toast.success('💰 New Payment Received!', {
        description: `+$${newInvoice.amount.toFixed(2)} from ${newInvoice.userEmail}`,
      })
    }

    window.addEventListener('stripe-invoice' as any, handleStripeInvoice)
    return () => window.removeEventListener('stripe-invoice' as any, handleStripeInvoice)
  }, [setInvoices])

  // Load active user count from localStorage
  useEffect(() => {
    try {
      const users = localStorage.getItem('qf-registered-users')
      if (users) {
        const parsed = JSON.parse(users)
        setActiveUsers(Array.isArray(parsed) ? parsed.length : 0)
      }
    } catch {
      setActiveUsers(0)
    }
  }, [])

  // Filter and sort invoices
  const filteredInvoices = useMemo(() => {
    let result = [...(invoices || [])]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(inv =>
        inv.userEmail.toLowerCase().includes(query) ||
        inv.userName.toLowerCase().includes(query) ||
        inv.description.toLowerCase().includes(query) ||
        inv.id.toLowerCase().includes(query)
      )
    }

    if (filterType !== 'all') {
      result = result.filter(inv => inv.type === filterType)
    }

    if (filterStatus !== 'all') {
      result = result.filter(inv => inv.status === filterStatus)
    }

    if (selectedMonth !== 'all') {
      const [year, month] = selectedMonth.split('-').map(Number)
      result = result.filter(inv => {
        const d = new Date(inv.date)
        return d.getFullYear() === year && d.getMonth() === month - 1
      })
    }

    result.sort((a, b) => {
      const aVal = sortField === 'date' ? a.date : a.amount
      const bVal = sortField === 'date' ? b.date : b.amount
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    })

    return result
  }, [invoices, searchQuery, filterType, filterStatus, selectedMonth, sortField, sortDir])

  // Calculate comprehensive tax breakdown with business metrics
  const taxBreakdown = useMemo((): TaxBreakdown => {
    const invs = invoices || []
    const paidInvoices = invs.filter(inv => inv.status === 'paid')

    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0)
    const totalTaxCollected = paidInvoices.reduce((sum, inv) => sum + inv.taxCollected, 0)
    const netIncome = totalRevenue

    // Federal tax calculation
    let federalTax = 0
    let remainingIncome = netIncome
    for (const bracket of FEDERAL_TAX_BRACKETS) {
      if (remainingIncome <= 0) break
      const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min)
      federalTax += taxableInBracket * bracket.rate
      remainingIncome -= taxableInBracket
    }

    const seTax = netIncome * SELF_EMPLOYMENT_TAX_RATE
    const estimatedTaxOwed = federalTax + seTax

    // MRR (Monthly Recurring Revenue)
    const subscriptionRevenue = paidInvoices
      .filter(inv => inv.type === 'subscription')
      .reduce((sum, inv) => sum + inv.amount, 0)
    const mrr = subscriptionRevenue / Math.max(1, new Set(paidInvoices.map(i => new Date(i.date).toISOString().slice(0, 7))).size)

    // LTV (Lifetime Value) - avg revenue per user
    const uniqueUsers = new Set(paidInvoices.map(i => i.userId)).size
    const ltv = uniqueUsers > 0 ? totalRevenue / uniqueUsers : 0

    // ARPU (Average Revenue Per User)
    const arpu = uniqueUsers > 0 ? totalRevenue / uniqueUsers : 0

    // Churn rate (simplified - based on refunds)
    const refundedCount = invs.filter(inv => inv.status === 'refunded').length
    const churnRate = invs.length > 0 ? (refundedCount / invs.length) * 100 : 0

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

    return { totalRevenue, totalTaxCollected, netIncome, estimatedTaxOwed, mrr, ltv, churnRate, arpu, byState, byMonth, byType }
  }, [invoices])

  // Revenue forecasting
  const forecast = useMemo(() => {
    const byMonth = taxBreakdown.byMonth
    const months = Object.keys(byMonth).sort()
    const data = months.map(m => ({ month: m, revenue: byMonth[m].revenue }))

    if (data.length < 2) {
      return { historical: data, forecast: [], growthRate: '0' }
    }

    // Linear regression for forecast
    const n = data.length
    const xSum = data.reduce((sum, _, i) => sum + i, 0)
    const ySum = data.reduce((sum, d) => sum + d.revenue, 0)
    const xySum = data.reduce((sum, d, i) => sum + i * d.revenue, 0)
    const x2Sum = data.reduce((sum, _, i) => sum + i * i, 0)

    const slope = n > 1 ? (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum) : 0
    const intercept = (ySum - slope * xSum) / n

    // Next 6 months forecast
    const forecastData = []
    for (let i = 0; i < 6; i++) {
      const futureMonth = n + i
      const predicted = intercept + slope * futureMonth
      const date = new Date()
      date.setMonth(date.getMonth() + i + 1)
      forecastData.push({
        month: date.toISOString().slice(0, 7),
        revenue: Math.max(0, predicted),
        type: 'forecast'
      })
    }

    const growthRate = slope > 0 && ySum > 0 ? ((slope / (ySum / n)) * 100).toFixed(1) : '0'
    return { historical: data, forecast: forecastData, growthRate }
  }, [taxBreakdown.byMonth])

  // Get available months
  const availableMonths = useMemo(() => {
    const months = new Set<string>()
    ;(invoices || []).forEach(inv => {
      const d = new Date(inv.date)
      months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    })
    return Array.from(months).sort().reverse()
  }, [invoices])

  // Export to CSV
  const exportToCSV = useCallback(() => {
    const headers = ['Date', 'ID', 'User', 'Email', 'Type', 'Tier', 'Description', 'Amount', 'Tax', 'State', 'Status', 'Stripe ID', 'Payment Method', 'Last4']
    const rows = filteredInvoices.map(inv => [
      new Date(inv.date).toISOString(),
      inv.id,
      inv.userName,
      inv.userEmail,
      inv.type,
      inv.tier || '',
      inv.description,
      inv.amount.toFixed(2),
      inv.taxCollected.toFixed(2),
      inv.state || '',
      inv.status,
      inv.stripeId || '',
      inv.paymentMethod || '',
      inv.last4 || '',
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
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
      if (!prev) return prev
      return prev.map(inv =>
        inv.id === invoiceId ? { ...inv, status: 'paid' as const } : inv
      )
    })
    toast.success('Invoice marked as paid')
  }, [setInvoices])

  // Process refund
  const processRefund = useCallback((invoiceId: string) => {
    if (!confirm('Process refund? This will mark the invoice as refunded.')) return

    setInvoices(prev => {
      if (!prev) return prev
      return prev.map(inv =>
        inv.id === invoiceId ? { ...inv, status: 'refunded' as const } : inv
      )
    })
    toast.success('Refund processed')
  }, [setInvoices])

  // Toggle sort
  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  // Access denied
  if (!isMaster) {
    return (
      <div className="cyber-card p-12 text-center">
        <ShieldCheck size={80} className="mx-auto text-destructive mb-6" />
        <h2 className="text-4xl font-black uppercase text-destructive">CREATOR ACCESS ONLY</h2>
        <p className="text-muted-foreground mt-4">This section requires master key access.</p>
      </div>
    )
  }

  const trackedPercent = (invoices?.length || 0) > 0
    ? ((invoices || []).filter(i => i.status !== 'pending').length / (invoices?.length || 1)) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* God Mode Header — Solid Cyberpunk */}
      <div className="cyber-card p-8 rounded-xl border-2 border-cyan-500/50 bg-black/95">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Crown size={48} weight="fill" className="text-amber-400" />
            <div>
              <h2 className="text-4xl font-black uppercase tracking-wider text-cyan-400">
                FINANCE COMMAND CENTER
              </h2>
              <p className="text-muted-foreground mt-1">Every dollar tracked • Taxes calculated • IRS ready</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {trackedPercent >= 90 && (
              <Badge className="bg-green-500 text-black px-4 py-2 text-lg">
                <CheckCircle size={20} className="mr-2" />
                TAX SEASON READY
              </Badge>
            )}
            <Button onClick={exportToCSV} className="bg-cyan-600 hover:bg-cyan-500">
              <Download size={20} className="mr-2" />
              Export All
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="cyber-card p-6 border-2 border-green-500/50">
          <div className="flex items-center gap-2 mb-3">
            <CurrencyDollar size={24} className="text-green-400" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Total Revenue</span>
          </div>
          <p className="text-4xl font-black text-green-400">${taxBreakdown.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="cyber-card p-6 border-2 border-cyan-500/50">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={24} className="text-cyan-400" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">MRR</span>
          </div>
          <p className="text-4xl font-black text-cyan-400">${taxBreakdown.mrr.toFixed(0)}</p>
        </div>

        <div className="cyber-card p-6 border-2 border-purple-500/50">
          <div className="flex items-center gap-2 mb-3">
            <Users size={24} className="text-purple-400" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Churn Rate</span>
          </div>
          <p className="text-4xl font-black text-purple-400">{taxBreakdown.churnRate.toFixed(1)}%</p>
        </div>

        <div className="cyber-card p-6 border-2 border-yellow-500/50">
          <div className="flex items-center gap-2 mb-3">
            <Brain size={24} className="text-yellow-400" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">LTV</span>
          </div>
          <p className="text-4xl font-black text-yellow-400">${taxBreakdown.ltv.toFixed(0)}</p>
        </div>

        <div className="cyber-card p-6 border-2 border-red-500/50">
          <div className="flex items-center gap-2 mb-3">
            <Warning size={24} className="text-red-400" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Est. Tax Owed</span>
          </div>
          <p className="text-4xl font-black text-red-400">${Math.round(taxBreakdown.estimatedTaxOwed).toLocaleString()}</p>
        </div>
      </div>

      {/* Revenue Forecast Chart */}
      {forecast.historical.length > 0 && (
        <div className="cyber-card p-6 border-2 border-purple-500/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black uppercase text-purple-400">REVENUE FORECAST 2025-2026</h3>
            <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-green-500 to-cyan-500 text-black">
              +{forecast.growthRate}% MoM Growth
            </Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[...forecast.historical, ...forecast.forecast]}>
                <defs>
                  <linearGradient id="historicalFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#00FFFF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC1FFF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#DC1FFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
                <XAxis
                  dataKey="month"
                  stroke="#00FFFF"
                  tick={{ fill: '#00FFFF', fontSize: 12 }}
                  tickFormatter={(value) => new Date(value + '-01').toLocaleDateString('en-US', { month: 'short' })}
                />
                <YAxis
                  stroke="#DC1FFF"
                  tick={{ fill: '#DC1FFF', fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ background: 'rgba(0,0,0,0.9)', border: '2px solid #00FFFF', borderRadius: 8 }}
                  labelStyle={{ color: '#00FFFF' }}
                  formatter={(value: number) => [`$${value.toFixed(0)}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#00FFFF"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#historicalFill)"
                  dot={{ fill: '#00FFFF', r: 4 }}
                />
                <ReferenceLine
                  x={new Date().toISOString().slice(0, 7)}
                  stroke="#FFD700"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Revenue by Type */}
      <div className="cyber-card p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Tag size={18} className="text-primary" />
          Revenue by Type
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(taxBreakdown.byType).map(([type, data]) => (
            <div key={type} className="p-4 bg-muted/20 border border-muted rounded-xl">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{type}</p>
              <p className="text-2xl font-bold text-primary">${data.revenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{data.count} transactions</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="cyber-card p-4">
        <div className="flex flex-wrap items-center gap-4">
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSort('date')}
            className={sortField === 'date' ? 'border-primary' : ''}
          >
            Date {sortField === 'date' && (sortDir === 'desc' ? <CaretDown size={14} className="ml-1" /> : <CaretUp size={14} className="ml-1" />)}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSort('amount')}
            className={sortField === 'amount' ? 'border-primary' : ''}
          >
            Amount {sortField === 'amount' && (sortDir === 'desc' ? <CaretDown size={14} className="ml-1" /> : <CaretUp size={14} className="ml-1" />)}
          </Button>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="cyber-card p-4 border-2 border-cyan-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-cyan-400">{filteredInvoices.length} Invoices</h3>
          <Badge variant="outline" className="text-lg">
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
            <div className="text-center py-12 text-muted-foreground">
              <Receipt size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-xl">No invoices yet</p>
              <p className="text-sm mt-2">Invoices will appear here when payments are received via Stripe</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card border-b border-muted">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pr-4 cursor-pointer hover:text-cyan-400" onClick={() => toggleSort('date')}>
                    <div className="flex items-center gap-1">
                      Date
                      {sortField === 'date' && (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                    </div>
                  </th>
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Description</th>
                  <th className="pb-3 pr-4 text-right cursor-pointer hover:text-cyan-400" onClick={() => toggleSort('amount')}>
                    <div className="flex items-center justify-end gap-1">
                      Amount
                      {sortField === 'amount' && (sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                    </div>
                  </th>
                  <th className="pb-3 pr-4 text-right">Tax</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/50">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-muted/20 transition-colors">
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
                    <td className="py-3 pr-4 text-right font-mono font-bold text-green-400">
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
                        invoice.status === 'failed' && 'bg-red-500/20 text-red-400 border-red-500/50',
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
                            className="h-7 px-2 text-xs text-green-400 hover:text-green-300"
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
                  </tr>
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
          {(invoices || []).filter(i => i.status === 'pending').length} pending invoices need attention
        </p>
      </div>

      {/* God Mode Footer */}
      <div className="text-center py-8">
        <Badge className="text-2xl px-12 py-6 bg-cyan-500/20 text-cyan-400 border-2 border-cyan-500/50 font-black">
          CREATOR MODE — EVERY DOLLAR TRACKED • TAXES CALCULATED
        </Badge>
      </div>
    </div>
  )
}
