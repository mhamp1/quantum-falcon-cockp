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
          <p className="text-xl text-muted-foreground uppercase tracking-wider">
            AI-POWERED AUTONOMOUS TRADING COCKPIT
          </p>
        </div>

        <div className="text-muted-foreground text-lg leading-relaxed max-w-xl mx-auto">
          <p className="mb-6">
            Advanced algorithmic trading platform powered by artificial intelligence.
            Monitor markets, deploy autonomous agents, and execute strategies with precision.
          </p>
          
          <ul className="space-y-3 text-left">
            <li className="flex items-center gap-3">
              <Lightning size={24} className="text-secondary" weight="fill" />
              <span>Real-time portfolio monitoring and analytics</span>
            </li>
            <li className="flex items-center gap-3">
              <Brain size={24} className="text-accent" weight="fill" />
              <span>AI-powered trading agents with autonomous execution</span>
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck size={24} className="text-primary" weight="fill" />
              <span>Secure vault for crypto asset management</span>
            </li>
          </ul>
        </div>

        <Button
          onClick={onAuthenticate}
          className="mt-8 px-12 py-6 text-lg uppercase tracking-widest neon-button hover:scale-105 transition-transform"
        >
          Enter Cockpit
        </Button>

        <p className="text-xs text-muted-foreground/60 mt-4">
          CLASSIFIED SYSTEM // AUTHORIZED ACCESS ONLY
        </p>
      </div>
    </div>
  );
}
