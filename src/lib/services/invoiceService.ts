// ═══════════════════════════════════════════════════════════════
// INVOICE SERVICE — Real-time Revenue Tracking
// Logs all payments for tax tracking and analytics
// November 27, 2025 — Production Ready
// ═══════════════════════════════════════════════════════════════

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

export interface RevenueStats {
  totalRevenue: number
  totalTaxCollected: number
  totalTransactions: number
  byTier: Record<string, { revenue: number; count: number }>
  byType: Record<string, { revenue: number; count: number }>
  byMonth: Record<string, { revenue: number; count: number }>
  recentInvoices: Invoice[]
}

// ═══════════════════════════════════════════════════════════════
// STORAGE KEY
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'qf-invoices'
const STATS_KEY = 'qf-revenue-stats'

// ═══════════════════════════════════════════════════════════════
// INVOICE SERVICE
// ═══════════════════════════════════════════════════════════════

class InvoiceService {
  private invoices: Invoice[] = []
  private initialized = false

  constructor() {
    this.loadFromStorage()
  }

  // ─── LOAD FROM STORAGE ───
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        this.invoices = JSON.parse(stored)
      }
      this.initialized = true
    } catch (error) {
      console.error('[InvoiceService] Failed to load from storage:', error)
      this.invoices = []
    }
  }

  // ─── SAVE TO STORAGE ───
  private saveToStorage(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.invoices))
      this.updateStats()
    } catch (error) {
      console.error('[InvoiceService] Failed to save to storage:', error)
    }
  }

  // ─── UPDATE STATS ───
  private updateStats(): void {
    if (typeof window === 'undefined') return
    
    const paidInvoices = this.invoices.filter(i => i.status === 'paid')
    
    const stats: RevenueStats = {
      totalRevenue: paidInvoices.reduce((sum, i) => sum + i.amount, 0),
      totalTaxCollected: paidInvoices.reduce((sum, i) => sum + i.taxCollected, 0),
      totalTransactions: paidInvoices.length,
      byTier: {},
      byType: {},
      byMonth: {},
      recentInvoices: this.invoices.slice(0, 10),
    }

    // By tier
    paidInvoices.forEach(inv => {
      const tier = inv.tier || 'unknown'
      if (!stats.byTier[tier]) stats.byTier[tier] = { revenue: 0, count: 0 }
      stats.byTier[tier].revenue += inv.amount
      stats.byTier[tier].count++
    })

    // By type
    paidInvoices.forEach(inv => {
      if (!stats.byType[inv.type]) stats.byType[inv.type] = { revenue: 0, count: 0 }
      stats.byType[inv.type].revenue += inv.amount
      stats.byType[inv.type].count++
    })

    // By month
    paidInvoices.forEach(inv => {
      const d = new Date(inv.date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!stats.byMonth[key]) stats.byMonth[key] = { revenue: 0, count: 0 }
      stats.byMonth[key].revenue += inv.amount
      stats.byMonth[key].count++
    })

    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  }

  // ─── LOG INVOICE ───
  logInvoice(invoice: Invoice): Invoice {
    // Ensure unique ID
    if (!invoice.id) {
      invoice.id = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    }

    // Check for duplicates (by stripeId)
    if (invoice.stripeId) {
      const existing = this.invoices.find(i => i.stripeId === invoice.stripeId)
      if (existing) {
        console.log('[InvoiceService] Duplicate invoice detected, skipping:', invoice.stripeId)
        return existing
      }
    }

    // Add to beginning (newest first)
    this.invoices.unshift(invoice)
    this.saveToStorage()

    console.log('[InvoiceService] Invoice logged:', {
      id: invoice.id,
      type: invoice.type,
      amount: invoice.amount,
      status: invoice.status,
    })

    // Broadcast event for real-time updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('invoice-logged', { detail: invoice }))
    }

    return invoice
  }

  // ─── UPDATE INVOICE ───
  updateInvoice(id: string, updates: Partial<Invoice>): Invoice | null {
    const index = this.invoices.findIndex(i => i.id === id)
    if (index === -1) return null

    this.invoices[index] = { ...this.invoices[index], ...updates }
    this.saveToStorage()

    console.log('[InvoiceService] Invoice updated:', id)
    return this.invoices[index]
  }

  // ─── GET ALL INVOICES ───
  getInvoices(): Invoice[] {
    return [...this.invoices]
  }

  // ─── GET INVOICE BY ID ───
  getInvoice(id: string): Invoice | null {
    return this.invoices.find(i => i.id === id) || null
  }

  // ─── GET STATS ───
  getStats(): RevenueStats | null {
    if (typeof window === 'undefined') return null
    
    try {
      const stored = localStorage.getItem(STATS_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  // ─── MARK AS PAID ───
  markAsPaid(id: string): Invoice | null {
    return this.updateInvoice(id, { status: 'paid' })
  }

  // ─── PROCESS REFUND ───
  processRefund(id: string): Invoice | null {
    return this.updateInvoice(id, { status: 'refunded' })
  }

  // ─── EXPORT TO CSV ───
  exportToCSV(): string {
    const headers = ['Date', 'ID', 'User', 'Email', 'Type', 'Tier', 'Description', 'Amount', 'Tax', 'State', 'Status', 'Stripe ID']
    const rows = this.invoices.map(inv => [
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
    ])
    
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }

  // ─── CLEAR ALL (DANGEROUS) ───
  clearAll(): void {
    this.invoices = []
    this.saveToStorage()
    console.log('[InvoiceService] All invoices cleared')
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════

let invoiceService: InvoiceService | null = null

export function getInvoiceService(): InvoiceService {
  if (!invoiceService) {
    invoiceService = new InvoiceService()
  }
  return invoiceService
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function logPayment(data: {
  userId: string
  userEmail: string
  userName?: string
  type: Invoice['type']
  tier?: string
  description: string
  amount: number
  taxCollected?: number
  state?: string
  stripeId?: string
}): Invoice {
  return getInvoiceService().logInvoice({
    id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    date: Date.now(),
    userId: data.userId,
    userEmail: data.userEmail,
    userName: data.userName || 'User',
    type: data.type,
    tier: data.tier,
    description: data.description,
    amount: data.amount,
    taxCollected: data.taxCollected || 0,
    state: data.state,
    status: 'paid',
    stripeId: data.stripeId,
  })
}

export function logNFTMint(data: {
  userId: string
  userEmail: string
  nftName: string
  amount: number
  txId?: string
}): Invoice {
  return getInvoiceService().logInvoice({
    id: `inv_nft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    date: Date.now(),
    userId: data.userId,
    userEmail: data.userEmail,
    userName: 'NFT Buyer',
    type: 'nft',
    description: `NFT Mint: ${data.nftName}`,
    amount: data.amount,
    taxCollected: 0,
    status: 'paid',
    stripeId: data.txId,
  })
}

export function logRoyalty(data: {
  strategyId: string
  strategyName: string
  amount: number
  fromUserId: string
}): Invoice {
  return getInvoiceService().logInvoice({
    id: `inv_royalty_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    date: Date.now(),
    userId: 'creator',
    userEmail: 'creator@quantumfalcon.io',
    userName: 'Strategy Royalty',
    type: 'royalty',
    description: `Royalty: ${data.strategyName} (from ${data.fromUserId})`,
    amount: data.amount,
    taxCollected: 0,
    status: 'paid',
    metadata: { strategyId: data.strategyId, fromUserId: data.fromUserId },
  })
}

export default InvoiceService

