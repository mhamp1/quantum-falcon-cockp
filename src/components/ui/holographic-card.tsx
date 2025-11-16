import * as React from "react"
import { cn } from "@/lib/utils"

export interface HolographicCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "accent"
  glow?: boolean
  pulse?: boolean
}

const HolographicCard = React.forwardRef<HTMLDivElement, HolographicCardProps>(
  ({ className, variant = "primary", glow = true, pulse = false, children, ...props }, ref) => {
    const variantStyles = {
      primary: "border-l-[3px] border-l-primary shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.3)]",
      secondary: "border-l-[3px] border-l-secondary shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)]",
      accent: "border-l-[3px] border-l-solana-green shadow-[0_0_20px_#14F195_/_0.3]",
    }

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "relative overflow-hidden",
          "bg-gradient-to-br from-cyberpunk-dark/95 to-cyberpunk-darker/85",
          "backdrop-blur-md",
          // Borders
          "border-t border-t-primary/50",
          "border-r border-r-primary/30",
          "border-b border-b-primary/30",
          variantStyles[variant],
          // Clip path for jagged corners
          "clip-path-[polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,8px_100%,0_calc(100%-8px))]",
          // Glow effect
          glow && "holographic-glow",
          // Pulse animation
          pulse && "animate-pulse-glow",
          className
        )}
        {...props}
      >
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-primary via-transparent to-transparent opacity-60" />
        
        {/* Right gradient line */}
        <div className="absolute top-0 right-0 w-[1px] h-10 bg-gradient-to-b from-primary to-transparent opacity-40" />
        
        {/* Inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }
)
HolographicCard.displayName = "HolographicCard"

const HolographicCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
HolographicCardHeader.displayName = "HolographicCardHeader"

const HolographicCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-display text-2xl font-bold leading-none tracking-[0.1em] uppercase",
      "text-primary neon-glow-primary",
      className
    )}
    {...props}
  />
))
HolographicCardTitle.displayName = "HolographicCardTitle"

const HolographicCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground uppercase tracking-wide", className)}
    {...props}
  />
))
HolographicCardDescription.displayName = "HolographicCardDescription"

const HolographicCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
HolographicCardContent.displayName = "HolographicCardContent"

const HolographicCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
HolographicCardFooter.displayName = "HolographicCardFooter"

export {
  HolographicCard,
  HolographicCardHeader,
  HolographicCardFooter,
  HolographicCardTitle,
  HolographicCardDescription,
  HolographicCardContent,
}
