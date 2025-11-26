// Holographic Card — ULTIMATE v2025.1.0
// November 26, 2025 — Quantum Falcon Cockpit
// God Mode variant, 3D tilt, holographic scanlines, cyberpunk perfection

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Crown } from "@phosphor-icons/react"

export interface HolographicCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "accent" | "godmode"
  glow?: boolean
  pulse?: boolean
  holographic?: boolean
  tilt?: boolean
}

const HolographicCard = React.forwardRef<HTMLDivElement, HolographicCardProps>(
  ({ 
    className, 
    variant = "primary", 
    glow = true, 
    pulse = false, 
    holographic = true,
    tilt = true,
    children, 
    ...props 
  }, ref) => {
    const variantStyles = {
      primary: "border-l-[3px] border-l-primary border-t-primary/50 border-r-primary/30 border-b-primary/30",
      secondary: "border-l-[3px] border-l-secondary border-t-secondary/50 border-r-secondary/30 border-b-secondary/30",
      accent: "border-l-[3px] border-l-accent border-t-accent/50 border-r-accent/30 border-b-accent/30",
      godmode: "border-2 border-yellow-500/70"
    }

    const glowStyles = {
      primary: "shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.4)]",
      secondary: "shadow-[0_0_30px_oklch(0.68_0.18_330_/_0.4)]",
      accent: "shadow-[0_0_30px_#14F195_/_0.4]",
      godmode: "shadow-[0_0_50px_rgba(251,191,36,0.6),0_0_80px_rgba(236,72,153,0.3)]"
    }

    const gradientStyles = {
      primary: "from-primary/10 via-primary/5 to-transparent",
      secondary: "from-secondary/10 via-secondary/5 to-transparent",
      accent: "from-accent/10 via-accent/5 to-transparent",
      godmode: "from-yellow-400/20 via-pink-500/10 to-purple-600/10"
    }

    const scanlineColor = variant === 'godmode' ? '#FFD700' : '#00FFFF'

    const cardClasses = cn(
      // Base styles
      "relative overflow-hidden rounded-xl",
      "bg-gradient-to-br from-cyberpunk-dark/95 to-cyberpunk-darker/90",
      "backdrop-blur-xl",
      // Borders
      "border-t border-r border-b",
      variantStyles[variant],
      // Glow effect
      glow && glowStyles[variant],
      // Pulse animation
      pulse && "animate-pulse-glow",
      // Group for hover effects
      "group",
      className
    )

    const cardContent = (
      <>
        {/* Holographic Scanlines */}
        {holographic && (
          <motion.div
            className="absolute inset-0 opacity-20 pointer-events-none"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              background: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                ${scanlineColor}15 10px,
                ${scanlineColor}15 20px
              )`,
              backgroundSize: '200% 200%'
            }}
          />
        )}

        {/* Inner gradient overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br pointer-events-none",
          gradientStyles[variant]
        )} />

        {/* Top neon line */}
        <div className={cn(
          "absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-50",
          variant === 'godmode' ? 'text-yellow-400' : 'text-primary'
        )} />

        {/* Left gradient line */}
        <div className={cn(
          "absolute top-0 left-0 w-[2px] h-16 bg-gradient-to-b from-current to-transparent opacity-60",
          variant === 'godmode' ? 'text-yellow-400' : 'text-primary'
        )} />

        {/* Bottom right corner accent */}
        <div className={cn(
          "absolute bottom-0 right-0 w-16 h-[2px] bg-gradient-to-l from-current to-transparent opacity-40",
          variant === 'godmode' ? 'text-yellow-400' : 'text-secondary'
        )} />

        {/* Inner glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

        {/* Hover glow intensifier */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
          variant === 'godmode' 
            ? "bg-gradient-to-br from-yellow-400/10 via-transparent to-purple-500/10"
            : "bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"
        )} />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* God Mode Crown */}
        {variant === 'godmode' && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -top-4 -right-4 z-20"
          >
            <Crown 
              size={48} 
              weight="fill" 
              className="text-yellow-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]" 
            />
          </motion.div>
        )}

        {/* God Mode corner sparkles */}
        {variant === 'godmode' && (
          <>
            <div className="absolute top-2 left-2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-60" />
            <div className="absolute bottom-2 right-2 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-60" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-2 right-12 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1s' }} />
          </>
        )}
      </>
    )

    // Use motion.div for tilt effect
    if (tilt) {
      return (
        <motion.div
          ref={ref}
          whileHover={{ 
            rotateX: 5, 
            rotateY: -5, 
            scale: 1.02,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{ transformStyle: 'preserve-3d' }}
          className={cardClasses}
        >
          {cardContent}
        </motion.div>
      )
    }

    // Regular div without tilt
    return (
      <div
        ref={ref}
        className={cardClasses}
        {...props}
      >
        {cardContent}
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
    className={cn("flex flex-col space-y-2 p-6 pb-4", className)}
    {...props}
  />
))
HolographicCardHeader.displayName = "HolographicCardHeader"

const HolographicCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { variant?: "primary" | "secondary" | "accent" | "godmode" }
>(({ className, variant = "primary", ...props }, ref) => {
  const variantStyles = {
    primary: "from-cyan-400 to-primary",
    secondary: "from-purple-400 to-secondary",
    accent: "from-green-400 to-accent",
    godmode: "from-yellow-400 via-pink-400 to-purple-400"
  }

  return (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-black uppercase tracking-wider",
        "bg-gradient-to-r bg-clip-text text-transparent",
        variantStyles[variant],
        variant === 'godmode' && "drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]",
        className
      )}
      {...props}
    />
  )
})
HolographicCardTitle.displayName = "HolographicCardTitle"

const HolographicCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground uppercase tracking-wider opacity-80",
      className
    )}
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
    className={cn(
      "flex items-center p-6 pt-4 border-t border-white/10",
      className
    )}
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
