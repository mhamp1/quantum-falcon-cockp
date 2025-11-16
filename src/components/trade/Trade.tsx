import { useState } from "react";
import { ArrowsDownUp, Lightning, Clock } from "@phosphor-icons/react";
import { toast } from "sonner";

import { useKV } from "@/hooks/useKVFallback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import ProfitConverter from "./ProfitConverter";
import TradeExecutionEffect from "./TradeExecutionEffect";

interface TradeHistory {
  id: string;
  type: "dca" | "snipe";
  token: string;
  amount: string;
  price: string;
  profit: number;
  timestamp: number;
}

export default function Trade() {
  const [dcaAmount, setDcaAmount] = useState("");
  const [dcaInterval, setDcaInterval] = useState("1");
  const [snipeToken, setSnipeToken] = useState("");
  const [snipeBudget, setSnipeBudget] = useState("");
  const [history, setHistory] = useKV<TradeHistory[]>("trade-history", []);
  const [executingTrade, setExecutingTrade] = useState<"dca" | "snipe" | null>(
    null,
  );

  const executeDCA = () => {
    if (!dcaAmount || parseFloat(dcaAmount) <= 0) {
      toast.error("Invalid amount", {
        description: "Please enter a valid DCA amount",
      });
      return;
    }

    setExecutingTrade("dca");

    setTimeout(() => {
      const newTrade: TradeHistory = {
        id: Date.now().toString(),
        type: "dca",
        token: "SOL",
        amount: dcaAmount,
        price: "125.42",
        profit: 0,
        timestamp: Date.now(),
      };

      setHistory((current) => {
        if (!current) return [newTrade];
        return [newTrade, ...current].slice(0, 50);
      });

      toast.success("DCA Order Placed", {
        description: `Buying ${dcaAmount} SOL every ${dcaInterval}h`,
      });

      setDcaAmount("");
      setExecutingTrade(null);
    }, 1500);
  };

  const executeSnipe = () => {
    if (!snipeToken || !snipeBudget || parseFloat(snipeBudget) <= 0) {
      toast.error("Invalid parameters", {
        description: "Please fill in all fields",
      });
      return;
    }

    setExecutingTrade("snipe");

    setTimeout(() => {
      toast.success("Snipe Activated", {
        description: `Watching for ${snipeToken.toUpperCase()} with ${snipeBudget} SOL budget`,
      });

      setSnipeToken("");
      setSnipeBudget("");
      setExecutingTrade(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-[0.2em] uppercase hud-text">
          <span className="text-primary neon-glow">TRADING HUB</span>
        </h2>
        <p className="text-muted-foreground uppercase tracking-wide text-sm mt-2">
          CONFIGURE DCA STRATEGIES AND TOKEN SNIPING PARAMETERS
        </p>
      </div>

      <ProfitConverter />

      <Tabs defaultValue="dca" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card/80 backdrop-blur-md border-2 border-primary p-1 jagged-corner">
          <TabsTrigger
            value="dca"
            className="gap-2 jagged-corner-small data-[state=active]:bg-primary/30 data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:neon-glow"
          >
            <Clock size={18} weight="duotone" />
            <span className="font-bold uppercase tracking-wide">DCA</span>
          </TabsTrigger>
          <TabsTrigger
            value="snipe"
            className="gap-2 jagged-corner-small data-[state=active]:bg-primary/30 data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:neon-glow"
          >
            <Lightning size={18} weight="duotone" />
            <span className="font-bold uppercase tracking-wide">SNIPE</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dca" className="space-y-4 mt-4">
          <div className="holographic-card relative">
            <TradeExecutionEffect
              isActive={executingTrade === "dca"}
              type="dca"
            />
            <div className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 jagged-corner-small bg-primary/30 border border-primary">
                  <Clock size={24} weight="duotone" className="text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-[0.15em] text-primary hud-text">
                    DOLLAR COST AVERAGING
                  </h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                    SYSTEMATIC ACCUMULATION OF SOL AT REGULAR INTERVALS
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="dca-amount"
                    className="uppercase tracking-wide text-xs font-bold"
                  >
                    Amount (SOL)
                  </Label>
                  <Input
                    id="dca-amount"
                    type="number"
                    placeholder="0.00"
                    value={dcaAmount}
                    onChange={(e) => setDcaAmount(e.target.value)}
                    className="bg-muted/50 border-2 border-primary/50 focus:border-primary jagged-corner-small"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="dca-interval"
                    className="uppercase tracking-wide text-xs font-bold"
                  >
                    Interval (hours)
                  </Label>
                  <Input
                    id="dca-interval"
                    type="number"
                    placeholder="1"
                    value={dcaInterval}
                    onChange={(e) => setDcaInterval(e.target.value)}
                    className="bg-muted/50 border-2 border-primary/50 focus:border-primary jagged-corner-small"
                  />
                </div>
                <Button
                  onClick={executeDCA}
                  disabled={executingTrade !== null}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground jagged-corner border-2 border-primary neon-glow uppercase tracking-[0.15em] font-bold"
                >
                  <ArrowsDownUp size={20} weight="bold" className="mr-2" />
                  Start DCA Strategy
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="snipe" className="space-y-4 mt-4">
          <div className="holographic-card relative">
            <TradeExecutionEffect
              isActive={executingTrade === "snipe"}
              type="snipe"
            />
            <div className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 jagged-corner-small bg-secondary/30 border border-secondary">
                  <Lightning
                    size={24}
                    weight="duotone"
                    className="text-secondary"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-[0.15em] text-secondary hud-text">
                    TOKEN SNIPING
                  </h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                    AUTOMATICALLY BUY NEW TOKEN LAUNCHES BASED ON CRITERIA
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="snipe-token"
                    className="uppercase tracking-wide text-xs font-bold"
                  >
                    Token Symbol
                  </Label>
                  <Input
                    id="snipe-token"
                    type="text"
                    placeholder="e.g. BONK"
                    value={snipeToken}
                    onChange={(e) => setSnipeToken(e.target.value)}
                    className="bg-muted/50 border-2 border-secondary/50 focus:border-secondary jagged-corner-small"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="snipe-budget"
                    className="uppercase tracking-wide text-xs font-bold"
                  >
                    Budget (SOL)
                  </Label>
                  <Input
                    id="snipe-budget"
                    type="number"
                    placeholder="0.00"
                    value={snipeBudget}
                    onChange={(e) => setSnipeBudget(e.target.value)}
                    className="bg-muted/50 border-2 border-secondary/50 focus:border-secondary jagged-corner-small"
                  />
                </div>
                <Button
                  onClick={executeSnipe}
                  disabled={executingTrade !== null}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground jagged-corner border-2 border-secondary neon-glow-secondary uppercase tracking-[0.15em] font-bold"
                >
                  <Lightning size={20} weight="bold" className="mr-2" />
                  Activate Sniper
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="holographic-card scan-line-effect">
        <div className="p-6 relative z-10">
          <h3 className="text-xl font-bold uppercase tracking-[0.15em] text-primary hud-text mb-6">
            RECENT TRADES
          </h3>
          {!history || history.length === 0 ? (
            <p className="text-center text-muted-foreground uppercase tracking-wide py-8">
              NO TRADES YET. START A STRATEGY ABOVE!
            </p>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 10).map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-4 jagged-corner bg-muted/30 border-2 border-primary/30 hover:border-primary/60 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 jagged-corner-small flex items-center justify-center border-2 border-primary/50 bg-primary/20">
                      {trade.type === "dca" ? (
                        <Clock
                          size={20}
                          weight="duotone"
                          className="text-primary"
                        />
                      ) : (
                        <Lightning
                          size={20}
                          weight="duotone"
                          className="text-secondary"
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wide">
                        {trade.type}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {trade.amount} {trade.token}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-secondary hud-value">
                      ${trade.price}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
