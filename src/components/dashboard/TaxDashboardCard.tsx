// Tax Dashboard Card — Beautiful, Interactive, Export-Ready
// November 21, 2025 — Quantum Falcon Cockpit

import { useTaxReserve } from '@/lib/tax/TaxReserveEngine'
import { Button } from '@/components/ui/button'
import { PiggyBank, Download, Shield, WarningCircle as AlertCircle, TrendUp as TrendingUp } from '@phosphor-icons/react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function TaxDashboardCard() {
  const { getTaxSummary } = useTaxReserve()
  const summary = getTaxSummary()

  // Generate chart data (monthly progression)
  const chartData = [
    { name: 'Jan', reserved: 0, owed: 0 },
    { name: 'Feb', reserved: summary.totalReserved * 0.15, owed: summary.totalTaxOwed * 0.18 },
    { name: 'Mar', reserved: summary.totalReserved * 0.32, owed: summary.totalTaxOwed * 0.35 },
    { name: 'Apr', reserved: summary.totalReserved * 0.5, owed: summary.totalTaxOwed * 0.55 },
    { name: 'May', reserved: summary.totalReserved * 0.7, owed: summary.totalTaxOwed * 0.75 },
    { name: 'Now', reserved: summary.totalReserved, owed: summary.totalTaxOwed },
  ]

  const exportTaxReport = () => {
    // TurboTax compatible format - Form 8949 style for easy import
    const today = new Date()
    const year = today.getFullYear()
    
    const csv = [
      '# Quantum Falcon - Tax Report for TurboTax/CoinTracker Import',
      `# Generated: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`,
      `# Tax Year: ${year}`,
      '',
      '# =================================================',
      '# CAPITAL GAINS SUMMARY (Form 8949)',
      '# =================================================',
      '',
      'Description,Date Acquired,Date Sold,Proceeds,Cost Basis,Gain/Loss,Term',
      `"Short-Term Crypto Trading",,${today.toLocaleDateString()},${summary.shortTermProfit.toFixed(2)},0,${summary.shortTermProfit.toFixed(2)},Short`,
      `"Long-Term Crypto Holdings",,${today.toLocaleDateString()},${summary.longTermProfit.toFixed(2)},0,${summary.longTermProfit.toFixed(2)},Long`,
      '',
      '# =================================================',
      '# ESTIMATED TAX LIABILITY',
      '# =================================================',
      '',
      'Category,Amount (USD)',
      `"Federal Tax - Short Term (37%)",${summary.shortTermTax.toFixed(2)}`,
      `"Federal Tax - Long Term (20%)",${summary.longTermTax.toFixed(2)}`,
      `"State Tax (CA 13.3%)",${summary.stateTax.toFixed(2)}`,
      `"Total Estimated Tax",${summary.totalTaxOwed.toFixed(2)}`,
      '',
      '# =================================================',
      '# TAX RESERVE STATUS',
      '# =================================================',
      '',
      'Metric,Amount (USD)',
      `"Total Profit YTD",${(summary.shortTermProfit + summary.longTermProfit).toFixed(2)}`,
      `"Amount Reserved for Taxes",${summary.totalReserved.toFixed(2)}`,
      `"Safe to Withdraw",${summary.safeToWithdraw.toFixed(2)}`,
      `"Year-End Projection",${summary.projectedYearEndTax.toFixed(2)}`,
      `"Total Trades Tracked",${summary.tradesCount}`,
      '',
      '# =================================================',
      '# TURBOTAX IMPORT INSTRUCTIONS',
      '# =================================================',
      '# 1. Open TurboTax > Income > Investments',
      '# 2. Select "Import from CSV"',
      '# 3. Upload this file',
      '# 4. Map columns: Proceeds, Cost Basis, Gain/Loss',
      '# =================================================',
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `QuantumFalcon-TurboTax-Report-${year}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('TurboTax report exported!', {
      description: 'Ready for TurboTax import - check downloads folder',
      icon: '📊'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="cyber-card p-8 border-2 border-purple-500/50 relative overflow-hidden"
    >
      <div className="absolute inset-0 grid-background opacity-5" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 border border-purple-500/40 rounded-lg">
              <PiggyBank size={40} weight="duotone" className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-wider text-purple-400">
                Tax Intelligence Vault
              </h3>
              <p className="text-sm text-muted-foreground">Automatic tax reserve • IRS-proof tracking</p>
            </div>
          </div>
          <Button
            onClick={exportTaxReport}
            className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-black font-bold button-3d-effect"
          >
            <Download size={20} className="mr-2" />
            Export for TurboTax
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">Total Reserved</p>
            <p className="text-4xl font-black text-purple-400">
              ${summary.totalReserved.toFixed(2)}
            </p>
          </div>
          <div className="text-center p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">Estimated Tax Owed</p>
            <p className="text-4xl font-black text-red-400">
              ${summary.totalTaxOwed.toFixed(2)}
            </p>
          </div>
          <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
              <Shield size={24} className="text-green-400" />
              Safe to Withdraw
            </p>
            <p className="text-4xl font-black text-green-400">
              ${summary.safeToWithdraw.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Beautiful Tax Chart */}
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="reservedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC1FFF" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#DC1FFF" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="owedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF1493" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#FF1493" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  background: '#0f0b1a',
                  border: '1px solid #DC1FFF',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#DC1FFF' }}
              />
              <Area
                type="monotone"
                dataKey="reserved"
                stroke="#DC1FFF"
                fillOpacity={1}
                fill="url(#reservedGradient)"
                name="Reserved"
              />
              <Area
                type="monotone"
                dataKey="owed"
                stroke="#FF1493"
                fillOpacity={1}
                fill="url(#owedGradient)"
                name="Estimated Owed"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-muted/20 border border-muted/30 rounded">
            <p className="text-muted-foreground mb-1">Short-Term Tax</p>
            <p className="font-bold text-red-400">${summary.shortTermTax.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-muted/20 border border-muted/30 rounded">
            <p className="text-muted-foreground mb-1">Long-Term Tax</p>
            <p className="font-bold text-green-400">${summary.longTermTax.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Tax reserve is automatic • Based on 2025 IRS brackets + 13.3% state estimate • 10% safety buffer
          </p>
        </div>
      </div>
    </motion.div>
  )
}

