import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowsDownUp, Lightning, Clock } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface TradeHistory {
  id: string
  type: 'dca' | 'snipe'
  token: string
  amount: string
  price: string
  profit: number
  timestamp: number
}

export default function Trade() {
  const [dcaAmount, setDcaAmount] = useState('')
  const [dcaInterval, setDcaInterval] = useState('1')
  const [snipeToken, setSnipeToken] = useState('')
  const [snipeBudget, setSnipeBudget] = useState('')
  const [history, setHistory] = useKV<TradeHistory[]>('trade-history', [])

  const executeDCA = () => {
    if (!dcaAmount || parseFloat(dcaAmount) <= 0) {
      toast.error('Invalid amount', { description: 'Please enter a valid DCA amount' })
      return
    }

    const newTrade: TradeHistory = {
      id: Date.now().toString(),
      type: 'dca',
      token: 'SOL',
      amount: dcaAmount,
      price: '125.42',
      profit: 0,
      timestamp: Date.now()
    }

    setHistory((current) => {
      if (!current) return [newTrade]
      return [newTrade, ...current].slice(0, 50)
    })

    toast.success('DCA Order Placed', { 
      description: `Buying ${dcaAmount} SOL every ${dcaInterval}h`
    })
    
    setDcaAmount('')
  }

  const executeSnipe = () => {
    if (!snipeToken || !snipeBudget || parseFloat(snipeBudget) <= 0) {
      toast.error('Invalid parameters', { description: 'Please fill in all fields' })
      return
    }

    toast.success('Snipe Activated', { 
      description: `Watching for ${snipeToken.toUpperCase()} with ${snipeBudget} SOL budget`
    })
    
    setSnipeToken('')
    setSnipeBudget('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-wider uppercase mb-2">
          Trading Hub
        </h2>
        <p className="text-muted-foreground">
          Configure DCA strategies and token sniping parameters
        </p>
      </div>

      <Tabs defaultValue="dca" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-md border border-primary/30">
          <TabsTrigger value="dca" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Clock size={18} weight="duotone" />
            DCA
          </TabsTrigger>
          <TabsTrigger value="snipe" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Lightning size={18} weight="duotone" />
            Snipe
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dca" className="space-y-4 mt-4">
          <Card className="backdrop-blur-md bg-card/50 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={24} weight="duotone" className="text-primary" />
                Dollar Cost Averaging
              </CardTitle>
              <CardDescription>
                Systematic accumulation of SOL at regular intervals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dca-amount">Amount (SOL)</Label>
                <Input
                  id="dca-amount"
                  type="number"
                  placeholder="0.00"
                  value={dcaAmount}
                  onChange={(e) => setDcaAmount(e.target.value)}
                  className="bg-muted/50 border-border focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dca-interval">Interval (hours)</Label>
                <Input
                  id="dca-interval"
                  type="number"
                  placeholder="1"
                  value={dcaInterval}
                  onChange={(e) => setDcaInterval(e.target.value)}
                  className="bg-muted/50 border-border focus:border-primary"
                />
              </div>
              <Button 
                onClick={executeDCA}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <ArrowsDownUp size={20} weight="bold" className="mr-2" />
                Start DCA Strategy
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="snipe" className="space-y-4 mt-4">
          <Card className="backdrop-blur-md bg-card/50 border-accent/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightning size={24} weight="duotone" className="text-accent" />
                Token Sniping
              </CardTitle>
              <CardDescription>
                Automatically buy new token launches based on criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="snipe-token">Token Symbol</Label>
                <Input
                  id="snipe-token"
                  type="text"
                  placeholder="e.g. BONK"
                  value={snipeToken}
                  onChange={(e) => setSnipeToken(e.target.value)}
                  className="bg-muted/50 border-border focus:border-accent"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="snipe-budget">Budget (SOL)</Label>
                <Input
                  id="snipe-budget"
                  type="number"
                  placeholder="0.00"
                  value={snipeBudget}
                  onChange={(e) => setSnipeBudget(e.target.value)}
                  className="bg-muted/50 border-border focus:border-accent"
                />
              </div>
              <Button 
                onClick={executeSnipe}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Lightning size={20} weight="bold" className="mr-2" />
                Activate Sniper
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="backdrop-blur-md bg-card/50 border-primary/30">
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          {!history || history.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No trades yet. Start a strategy above!</p>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 10).map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3">
                    {trade.type === 'dca' ? (
                      <Clock size={20} weight="duotone" className="text-primary" />
                    ) : (
                      <Lightning size={20} weight="duotone" className="text-accent" />
                    )}
                    <div>
                      <p className="text-sm font-semibold">{trade.type.toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{trade.amount} {trade.token}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">${trade.price}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}