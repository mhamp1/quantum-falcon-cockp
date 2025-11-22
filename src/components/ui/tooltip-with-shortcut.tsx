// Tooltip with Keyboard Shortcut Hints
// November 21, 2025 — Quantum Falcon Cockpit

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'

interface TooltipWithShortcutProps {
  children: React.ReactNode
  content: string
  shortcut?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function TooltipWithShortcut({
  children,
  content,
  shortcut,
  side = 'top',
}: TooltipWithShortcutProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            className={cn(
              'z-50 overflow-hidden rounded-md border bg-card px-3 py-1.5 text-sm text-foreground shadow-md',
              'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
              'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
            )}
            sideOffset={5}
          >
            <div className="flex items-center gap-2">
              <span>{content}</span>
              {shortcut && (
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  {shortcut}
                </kbd>
              )}
            </div>
            <TooltipPrimitive.Arrow className="fill-card" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}

