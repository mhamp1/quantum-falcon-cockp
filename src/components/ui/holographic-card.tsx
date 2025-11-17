import * as React from "react";

import { cn } from "@/lib/utils";

export interface HolographicCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "accent";
  glow?: boolean;
  pulse?: boolean;
}

const HolographicCard = React.forwardRef<HTMLDivElement, HolographicCardProps>(
  (
    {
      className,
      variant = "primary",
      glow = true,
      pulse = false,
      children,
      ...props
    },
    ref,
  ) => {
    const variantStyles = {
      primary:
        "border-l-[3px] border-l-primary shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.3)]",
      secondary:
        "border-l-[3px] border-l-secondary shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)]",
      accent:
        "border-l-[3px] border-l-solana-green shadow-[0_0_20px_#14F195_/_0.3]",
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base cyber-card style with jagged corners
          "cyber-card jagged-corner",
          // Variant specific styles
          variantStyles[variant],
          // Glow effect
          glow && "holographic-glow",
          // Pulse animation
          pulse && "animate-pulse-glow",
          className,
        )}
        {...props}
      >
        {/* HUD Corner brackets */}
        <div className="hud-corner-tl"></div>
        <div className="hud-corner-tr"></div>
        <div className="hud-corner-bl"></div>
        <div className="hud-corner-br"></div>

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  },
);
HolographicCard.displayName = "HolographicCard";

const HolographicCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
HolographicCardHeader.displayName = "HolographicCardHeader";

const HolographicCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-display text-2xl font-bold leading-none tracking-[0.1em] uppercase",
      "text-primary neon-glow-primary",
      className,
    )}
    {...props}
  />
));
HolographicCardTitle.displayName = "HolographicCardTitle";

const HolographicCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground uppercase tracking-wide",
      className,
    )}
    {...props}
  />
));
HolographicCardDescription.displayName = "HolographicCardDescription";

const HolographicCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
HolographicCardContent.displayName = "HolographicCardContent";

const HolographicCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
HolographicCardFooter.displayName = "HolographicCardFooter";

export {
  HolographicCard,
  HolographicCardHeader,
  HolographicCardFooter,
  HolographicCardTitle,
  HolographicCardDescription,
  HolographicCardContent,
};
