import { ComponentProps } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { soundEffects } from "@/lib/soundEffects"
import { hapticFeedback } from "@/lib/hapticFeedback"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:translate-y-[1px] active:scale-[0.98] relative overflow-hidden cyber-button jagged-button",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_4px_16px_oklch(0.72_0.20_195_/_0.3),0_0_0_1px_oklch(0.72_0.20_195_/_0.2)] hover:bg-primary/90 hover:shadow-[0_6px_24px_oklch(0.72_0.20_195_/_0.4),0_0_0_1px_oklch(0.72_0.20_195_/_0.3)] hover:scale-[1.02]",
        destructive:
          "bg-destructive text-white shadow-[0_4px_16px_oklch(0.65_0.25_25_/_0.3),0_0_0_1px_oklch(0.65_0.25_25_/_0.2)] hover:bg-destructive/90 hover:shadow-[0_6px_24px_oklch(0.65_0.25_25_/_0.4),0_0_0_1px_oklch(0.65_0.25_25_/_0.3)] hover:scale-[1.02] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-2 border-primary/40 bg-background/80 backdrop-blur-sm shadow-[0_2px_8px_oklch(0_0_0_/_0.2),inset_0_1px_0_oklch(0.72_0.20_195_/_0.1)] hover:bg-accent/20 hover:text-accent-foreground hover:border-primary/60 hover:shadow-[0_4px_16px_oklch(0.72_0.20_195_/_0.2),inset_0_1px_0_oklch(0.72_0.20_195_/_0.15)] hover:scale-[1.02] dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_4px_16px_oklch(0.68_0.18_330_/_0.3),0_0_0_1px_oklch(0.68_0.18_330_/_0.2)] hover:bg-secondary/80 hover:shadow-[0_6px_24px_oklch(0.68_0.18_330_/_0.4),0_0_0_1px_oklch(0.68_0.18_330_/_0.3)] hover:scale-[1.02]",
        ghost:
          "hover:bg-accent/20 hover:text-accent-foreground hover:shadow-[0_2px_8px_oklch(0.68_0.18_330_/_0.15)] hover:scale-[1.02] dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  onClick,
  ...props
}: ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    soundEffects.playClick();
    hapticFeedback.light();
    onClick?.(e);
  };

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={handleClick}
      {...props}
    />
  )
}

export { Button, buttonVariants }
