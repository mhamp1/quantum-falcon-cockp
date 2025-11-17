import { Brain, Lightning } from "@phosphor-icons/react";
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
        <div className="inline-flex p-8 cyber-card">
          <Brain size={120} weight="duotone" className="text-primary neon-glow-primary" />
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl font-bold uppercase tracking-[0.15em]">
            <span className="bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
              QUANTUM
            </span>{" "}
            <span className="bg-gradient-to-r from-destructive to-destructive bg-clip-text text-transparent">
              FALCON
            </span>
          </h1>
          <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold">
            AI-POWERED AUTONOMOUS TRADING COCKPIT
          </p>
        </div>

        <div className="max-w-xl mx-auto space-y-3 text-sm text-muted-foreground">
          <p>
            Access your{" "}
            <span className="text-primary font-semibold">
              advanced trading dashboard
            </span>
            , manage{" "}
            <span className="text-secondary font-semibold">AI agents</span>, and
            monitor your{" "}
            <span className="text-destructive font-semibold">portfolio</span> in
            real-time
          </p>
        </div>

        <div className="pt-4">
          <Button
            onClick={onAuthenticate}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-6 text-base font-bold uppercase tracking-[0.15em] neon-button"
          >
            <Lightning size={24} weight="fill" className="mr-2" />
            AUTHENTICATE SYSTEM
          </Button>
        </div>

        <div className="cyber-card-accent p-6 max-w-md mx-auto mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded bg-destructive/20 flex items-center justify-center">
              <span className="text-destructive font-bold text-sm">👑</span>
            </div>
            <h3 className="text-destructive font-bold uppercase tracking-wider text-sm">
              SYSTEM REQUIREMENTS
            </h3>
          </div>
          <ul className="space-y-2 text-left text-xs">
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                Valid Quantum Falcon license key
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                Email address for authentication
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                Access to 4 tier levels (Free, Pro, Elite, Lifetime)
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
