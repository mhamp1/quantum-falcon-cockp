import * as React from "react";

import { cn } from "@/lib/utils";

export interface NeonProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: "primary" | "secondary" | "accent";
  showLabel?: boolean;
  label?: string;
  animate?: boolean;
}

const NeonProgress = React.forwardRef<HTMLDivElement, NeonProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      variant = "primary",
      showLabel = false,
      label,
      animate = true,
      ...props
    },
    ref,
  ) => {
    const percentage = Math.min((value / max) * 100, 100);

    const variantStyles = {
      primary: {
        bar: "from-primary to-primary",
        shadow: "shadow-[0_0_10px_var(--primary),0_0_20px_var(--primary)]",
      },
      secondary: {
        bar: "from-secondary to-secondary",
        shadow: "shadow-[0_0_10px_var(--secondary),0_0_20px_var(--secondary)]",
      },
      accent: {
        bar: "from-primary to-secondary",
        shadow: "shadow-[0_0_10px_var(--primary),0_0_20px_var(--secondary)]",
      },
    };

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {showLabel && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              {label}
            </span>
            <span className="text-xs font-bold text-primary neon-glow-primary">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        <div className="neon-progress-bar h-2 rounded-full relative">
          <div
            className={cn(
              "neon-progress-fill h-full rounded-full relative",
              "bg-gradient-to-r",
              variantStyles[variant].bar,
              variantStyles[variant].shadow,
              animate && "transition-all duration-300 ease-out",
            )}
            style={{ width: `${percentage}%` }}
          >
            {animate && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer rounded-full" />
            )}
          </div>
        </div>
      </div>
    );
  },
);
NeonProgress.displayName = "NeonProgress";

export { NeonProgress };
