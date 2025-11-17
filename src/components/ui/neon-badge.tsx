import * as React from "react";

import { cn } from "@/lib/utils";

export interface NeonBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "primary" | "secondary" | "accent" | "success" | "warning";
  glow?: boolean;
  pulse?: boolean;
}

const NeonBadge = React.forwardRef<HTMLDivElement, NeonBadgeProps>(
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
      primary: {
        bg: "bg-primary/10",
        border: "border-primary",
        text: "text-primary",
        shadow: glow ? "shadow-[0_0_10px_oklch(0.72_0.20_195_/_0.4)]" : "",
        glow: "neon-glow-primary",
      },
      secondary: {
        bg: "bg-secondary/10",
        border: "border-secondary",
        text: "text-secondary",
        shadow: glow ? "shadow-[0_0_10px_oklch(0.68_0.18_330_/_0.4)]" : "",
        glow: "neon-glow-secondary",
      },
      accent: {
        bg: "bg-gradient-to-r from-primary/10 to-secondary/10",
        border: "border-primary",
        text: "text-primary",
        shadow: glow
          ? "shadow-[0_0_10px_oklch(0.72_0.20_195_/_0.4),0_0_15px_oklch(0.68_0.18_330_/_0.3)]"
          : "",
        glow: "neon-glow-primary",
      },
      success: {
        bg: "bg-green-500/10",
        border: "border-green-500",
        text: "text-green-500",
        shadow: glow ? "shadow-[0_0_10px_#22c55e_/_0.4]" : "",
        glow: "",
      },
      warning: {
        bg: "bg-amber-500/10",
        border: "border-amber-500",
        text: "text-amber-500",
        shadow: glow ? "shadow-[0_0_10px_#fbbf24_/_0.4]" : "",
        glow: "",
      },
    };

    const style = variantStyles[variant];

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center gap-1.5 px-2.5 py-1",
          "border jagged-corner-small",
          "font-bold text-xs uppercase tracking-wider",
          "transition-all duration-300",
          // Variant styles
          style.bg,
          style.border,
          style.text,
          style.shadow,
          glow && style.glow,
          // Pulse animation
          pulse && "animate-pulse-slow",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
NeonBadge.displayName = "NeonBadge";

export { NeonBadge };
