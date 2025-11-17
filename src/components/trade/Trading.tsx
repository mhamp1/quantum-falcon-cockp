import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowsDownUp, Lightning, Robot } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function Trading() {
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeToken, setTradeToken] = useState('SOL');

  const handleTrade = () => {
    toast.success('Trade executed successfully', {
      description: `${tradeAmount} ${tradeToken} processed`,
    });
    setTradeAmount('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b-2 border-primary/30">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold uppercase tracking-wider text-accent">
            Trading
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mt-1">
            ◆ Execute Trades & Strategies
          </p>
        </div>
      </div>

      <Tabs defaultValue="manual" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 border-2 border-primary/30">
          <TabsTrigger value="manual" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Manual Trade
          </TabsTrigger>
          <TabsTrigger value="dca" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            DCA Strategy
          </TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            AI Assistant
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <Card className="p-6 bg-card/50 border-2 border-accent/30 shadow-[0_0_30px_rgba(255,200,0,0.2)]">
            <div className="flex items-center gap-3 mb-6">
              <ArrowsDownUp size={24} weight="duotone" className="text-accent" />
              <h2 className="text-xl font-bold uppercase tracking-wider text-accent">
                Quick Trade
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="amount" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  placeholder="0.00"
                  className="mt-2 bg-muted/20 border-2 border-primary/30 focus:border-accent"
                />
              </div>

              <div>
                <Label htmlFor="token" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Token
                </Label>
                <Input
                  id="token"
                  value={tradeToken}
                  onChange={(e) => setTradeToken(e.target.value)}
                  placeholder="SOL"
                  className="mt-2 bg-muted/20 border-2 border-primary/30 focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <Button
                  onClick={handleTrade}
                  className="bg-accent/20 border-2 border-accent text-accent hover:bg-accent/30 shadow-[0_0_20px_rgba(255,200,0,0.3)]"
                >
                  <Lightning weight="duotone" size={20} />
                  Buy
                </Button>
                <Button
                  onClick={handleTrade}
                  className="bg-destructive/20 border-2 border-destructive text-destructive hover:bg-destructive/30"
                >
                  <Lightning weight="duotone" size={20} />
                  Sell
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="dca">
          <Card className="p-6 bg-card/50 border-2 border-primary/30">
            <div className="flex items-center gap-3 mb-6">
              <Robot size={24} weight="duotone" className="text-primary" />
              <h2 className="text-xl font-bold uppercase tracking-wider text-primary">
                Dollar Cost Averaging
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Schedule
                </Label>
                <Input
                  placeholder="Daily"
                  className="mt-2 bg-muted/20 border-2 border-primary/30"
                />
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Amount per Purchase
                </Label>
                <Input
                  placeholder="$100"
                  className="mt-2 bg-muted/20 border-2 border-primary/30"
                />
              </div>

              <Button className="w-full bg-primary/20 border-2 border-primary text-primary hover:bg-primary/30">
                Activate DCA Strategy
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card className="p-6 bg-card/50 border-2 border-accent/30">
            <div className="flex items-center gap-3 mb-6">
              <Robot size={24} weight="duotone" className="text-accent" />
              <h2 className="text-xl font-bold uppercase tracking-wider text-accent">
                AI Trading Assistant
              </h2>
            </div>

            <div className="p-4 bg-muted/20 border-2 border-accent/30 min-h-[200px] flex items-center justify-center">
              <p className="text-muted-foreground text-center">
                AI assistant chat interface placeholder
              </p>
            </div>

            <Input
              placeholder="Ask the AI assistant..."
              className="mt-4 bg-muted/20 border-2 border-accent/30"
            />
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="p-6 bg-card/50 border-2 border-primary/30">
        <h2 className="text-xl font-bold uppercase tracking-wider text-primary mb-4">
          Active Orders
        </h2>

        <div className="space-y-2">
          {[
            { pair: 'SOL/USDC', type: 'LIMIT BUY', price: '$95.00', amount: '10 SOL' },
            { pair: 'BTC/USDC', type: 'STOP LOSS', price: '$42,000', amount: '0.05 BTC' },
          ].map((order, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-muted/20 border border-primary/20"
            >
              <div className="flex items-center gap-4">
                <span className="font-bold">{order.pair}</span>
                <span className="text-xs uppercase text-accent">{order.type}</span>
                <span className="text-muted-foreground">{order.price}</span>
                <span className="text-muted-foreground">{order.amount}</span>
              </div>
              <Button size="sm" variant="destructive" className="border-2">
                Cancel
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
