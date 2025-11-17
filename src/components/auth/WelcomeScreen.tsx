import { Brain, Lightning, ShieldCheck } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onAuthenticate: () => void;
}

export default function WelcomeScreen({ onAuthenticate }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 technical-grid opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl text-center space-y-8">
        <div className="inline-flex p-8 jagged-corner bg-primary/20 border-2 border-primary mx-auto">
          <Brain size={96} weight="duotone" className="text-primary neon-glow-primary" />
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-bold uppercase tracking-[0.2em] text-primary hud-text">
            QUANTUM FALCON
          </h1>
          <p className="text-xl text-secondary uppercase tracking-[0.15em] font-semibold">
            AI-POWERED AUTONOMOUS TRADING COCKPIT
          </p>
        </div>

        <div className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto">
          Experience the next generation of crypto trading with our advanced trading dashboard. Deploy autonomous AI agents, manage your portfolio, and monitor your investments in real-time.
        </div>

        <div className="pt-4">
          <Button
            onClick={onAuthenticate}
            size="lg"
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold uppercase tracking-wider text-lg px-12 py-6 neon-glow-secondary"
          >
            <Lightning size={24} weight="fill" className="mr-2" />
            AUTHENTICATE & ENTER
          </Button>
        </div>

        <div className="cyber-card-accent p-6 max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck size={24} className="text-accent" weight="duotone" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              KEY FEATURES
            </h3>
          </div>
          <ul className="space-y-3 text-left text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1">▸</span>
              <span>AI-powered autonomous trading agents</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1">▸</span>
              <span>Real-time portfolio monitoring and analytics</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1">▸</span>
              <span>Advanced risk management and alerts</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
