import { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 border-2 bg-background/60 backdrop-blur-sm px-3 py-1 text-base shadow-[0_2px_8px_oklch(0_0_0_/_0.15),inset_0_1px_0_oklch(0.72_0.20_195_/_0.05)] transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm jagged-input",
        "focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-[3px] focus-visible:shadow-[0_4px_16px_oklch(0.72_0.20_195_/_0.2),inset_0_1px_0_oklch(0.72_0.20_195_/_0.1)] focus-visible:bg-background/80",
        "hover:border-primary/40 hover:shadow-[0_2px_12px_oklch(0_0_0_/_0.2),inset_0_1px_0_oklch(0.72_0.20_195_/_0.08)]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
