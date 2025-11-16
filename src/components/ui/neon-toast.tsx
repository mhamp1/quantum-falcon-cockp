import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, Warning, Info, XCircle } from "@phosphor-icons/react"

export type ToastVariant = "success" | "warning" | "info" | "error"

export interface NeonToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ToastVariant
  title?: string
  description?: string
  icon?: React.ReactNode
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    borderColor: "border-l-primary",
    iconColor: "text-primary",
    shadowColor: "shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.3)]",
    glowClass: "neon-glow-primary",
  },
  warning: {
    icon: Warning,
    borderColor: "border-l-amber-500",
    iconColor: "text-amber-500",
    shadowColor: "shadow-[0_0_20px_#fbbf24_/_0.3]",
    glowClass: "",
  },
  info: {
    icon: Info,
    borderColor: "border-l-secondary",
    iconColor: "text-secondary",
    shadowColor: "shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)]",
    glowClass: "neon-glow-secondary",
  },
  error: {
    icon: XCircle,
    borderColor: "border-l-destructive",
    iconColor: "text-destructive",
    shadowColor: "shadow-[0_0_20px_oklch(0.65_0.25_25_/_0.3)]",
    glowClass: "neon-glow-destructive",
  },
}

const NeonToast = React.forwardRef<HTMLDivElement, NeonToastProps>(
  ({ className, variant = "info", title, description, icon, ...props }, ref) => {
    const config = variantConfig[variant]
    const Icon = icon ? () => icon : config.icon

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "relative overflow-hidden",
          "bg-gradient-to-br from-cyberpunk-dark/95 to-cyberpunk-darker/90",
          "backdrop-blur-md",
          "p-4",
          // Borders
          "border-t border-t-primary/50",
          "border-r border-r-primary/30",
          "border-b border-b-primary/30",
          config.borderColor,
          "border-l-[3px]",
          // Shadows and effects
          config.shadowColor,
          // Clip path
          "clip-path-[polygon(0_0,calc(100%-6px)_0,100%_6px,100%_100%,6px_100%,0_calc(100%-6px))]",
          // Animation
          "animate-in slide-in-from-right-full",
          className
        )}
        {...props}
      >
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-primary via-transparent to-transparent opacity-60" />
        
        {/* Content */}
        <div className="relative z-10 flex items-start gap-3">
          <div className={cn("flex-shrink-0 mt-0.5", config.iconColor, config.glowClass)}>
            <Icon size={20} weight="duotone" />
          </div>
          <div className="flex-1 min-w-0">
            {title && (
              <div className="font-bold text-sm uppercase tracking-wide text-foreground mb-1">
                {title}
              </div>
            )}
            {description && (
              <div className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
)
NeonToast.displayName = "NeonToast"

export { NeonToast }
