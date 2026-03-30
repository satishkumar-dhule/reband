import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-[var(--gh-canvas-subtle)] dark:hover:bg-[var(--gh-bg-muted)] hover:text-[var(--gh-fg)] dark:hover:text-[var(--gh-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gh-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--gh-canvas)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] data-[state=on]:bg-[var(--gh-accent-subtle)] dark:data-[state=on]:bg-[var(--gh-accent-subtle)] data-[state=on]:text-[var(--gh-accent-fg)] dark:data-[state=on]:text-[var(--gh-accent-fg)] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-[var(--gh-border)] bg-transparent shadow-sm",
      },
      size: {
        default: "h-11 px-3 min-w-[44px] min-h-[44px]",
        sm: "h-10 px-2.5 min-w-[40px] min-h-[40px]",
        lg: "h-12 px-4 min-w-[48px] min-h-[48px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ToggleProps
  extends React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>,
    VariantProps<typeof toggleVariants> {
  /**
   * Accessible label for the toggle.
   * Required for accessibility when no visible label is present.
   */
  "aria-label"?: string
}

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  ToggleProps
>(({ className, variant, size, "aria-label": ariaLabel, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    aria-label={ariaLabel}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
