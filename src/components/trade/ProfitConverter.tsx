import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowsLeftRight, TrendUp, Coins } from "@phosphor-icons/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useKV } from "@/hooks/useKVFallback";

import ProfitParticles from "./ProfitParticles";
import ConversionBeam from "./ConversionBeam";

interface ConversionStats {
  totalConverted: number;
  lastConversion: number;
  conversionCount: number;
}

export default function ProfitConverter() {
  const [isConverting, setIsConverting] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showBeam, setShowBeam] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [stats, setStats] = useKV<ConversionStats>("conversion-stats", {
    totalConverted: 0,
    lastConversion: 0,
    conversionCount: 0,
  });

  const currentProfit = 24.5;
  const profitThreshold = 20;
  const canConvert = currentProfit >= profitThreshold;

  const handleConvert = async () => {
    if (!canConvert) {
      toast.error("Insufficient Profit", {
        description: `Need ${profitThreshold}% profit to convert. Current: ${currentProfit}%`,
      });
      return;
    }

    setIsConverting(true);
    setShowBeam(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setShowBeam(false);

    await new Promise((resolve) => setTimeout(resolve, 200));

    const btcAmount = 0.00125 + Math.random() * 0.00075;
    setConvertedAmount(btcAmount);
    setShowParticles(true);

    setStats((current) => ({
      totalConverted: (current?.totalConverted || 0) + btcAmount,
      lastConversion: btcAmount,
      conversionCount: (current?.conversionCount || 0) + 1,
    }));

    toast.success("Profit Converted to BTC!", {
      description: `+${btcAmount.toFixed(8)} BTC secured in vault`,
    });
  };

  const handleParticlesComplete = () => {
    setShowParticles(false);
    setIsConverting(false);
  };

  return (
    <div className="holographic-card relative overflow-hidden">
      <AnimatePresence>
        {showBeam && <ConversionBeam isActive={showBeam} />}
      </AnimatePresence>

      <AnimatePresence>
        {showParticles && (
          <ProfitParticles
            isActive={showParticles}
            onComplete={handleParticlesComplete}
            amount={convertedAmount}
            type="btc"
          />
        )}
      </AnimatePresence>

      <div className="p-6 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 jagged-corner-small bg-secondary/30 border border-secondary">
            <Coins size={24} weight="duotone" className="text-secondary" />
          </div>
          <div>
            <h3 className="text-xl font-bold uppercase tracking-[0.15em] text-secondary hud-text">
              PROFIT CONVERTER
            </h3>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
              AUTO-CONVERT SOL PROFITS &gt;{profitThreshold}% TO BTC FOR HEDGING
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-[0.15em] hud-text">
                Current Profit
              </span>
              <span
                className={`text-lg font-bold hud-value ${currentProfit >= profitThreshold ? "text-secondary neon-glow-secondary" : "text-muted-foreground"}`}
              >
                {currentProfit.toFixed(2)}%
              </span>
            </div>

            <div className="space-y-1.5">
              <Progress
                value={(currentProfit / profitThreshold) * 100}
                className="h-3"
              />
              <p className="text-xs text-muted-foreground uppercase tracking-wide text-right">
                {currentProfit >= profitThreshold
                  ? "READY TO CONVERT!"
                  : `${(profitThreshold - currentProfit).toFixed(2)}% UNTIL CONVERSION`}
              </p>
            </div>
          </div>

          <motion.div
            animate={
              canConvert
                ? {
                    boxShadow: [
                      "0 0 0px rgba(20, 241, 149, 0)",
                      "0 0 20px rgba(20, 241, 149, 0.5)",
                      "0 0 0px rgba(20, 241, 149, 0)",
                    ],
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="jagged-corner"
          >
            <Button
              onClick={handleConvert}
              disabled={!canConvert || isConverting}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed h-12 font-bold uppercase tracking-[0.15em] jagged-corner border-2 border-secondary neon-glow-secondary"
            >
              {isConverting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <ArrowsLeftRight size={20} weight="bold" className="mr-2" />
                  </motion.div>
                  CONVERTING...
                </>
              ) : (
                <>
                  <ArrowsLeftRight size={20} weight="bold" className="mr-2" />
                  CONVERT TO BTC
                </>
              )}
            </Button>
          </motion.div>

          {stats && stats.conversionCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-3 pt-4 border-t-2 border-primary/30"
            >
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-[0.15em] hud-text">
                  Total BTC
                </div>
                <div className="text-sm font-bold text-secondary hud-value">
                  {stats.totalConverted.toFixed(8)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-[0.15em] hud-text">
                  Last
                </div>
                <div className="text-sm font-bold text-secondary hud-value">
                  {stats.lastConversion.toFixed(8)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-[0.15em] hud-text">
                  Count
                </div>
                <div className="text-sm font-bold text-secondary hud-value">
                  {stats.conversionCount}
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex items-start gap-2 p-3 jagged-corner-small bg-muted/30 border-2 border-primary/50">
            <TrendUp
              size={20}
              weight="duotone"
              className="text-secondary mt-0.5 flex-shrink-0"
            />
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              <strong className="text-foreground">AUTO-HEDGING:</strong> PROFITS
              ABOVE {profitThreshold}% TRIGGER AUTOMATIC BTC CONVERSION,
              PRESERVING GAINS AND REDUCING VOLATILITY EXPOSURE.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
