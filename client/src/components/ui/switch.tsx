import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  /**
   * Accessible label for the switch.
   * Required for accessibility when no visible label is present.
   */
  "aria-label"?: string
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, "aria-label": ariaLabel, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      // Base styles - GitHub-inspired
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
      // Border and background
      "border-2 border-transparent",
      // Unchecked state - uses GitHub neutral for better visibility in both modes
      "bg-[var(--gh-neutral-muted)] dark:bg-[var(--gh-neutral-emphasis)]",
      // Checked state - uses GitHub accent
      "data-[state=checked]:bg-[var(--gh-accent-emphasis)] data-[state=checked]:border-[var(--gh-accent-emphasis)]",
      // Focus styles - GitHub accent color
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gh-accent-fg)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--gh-canvas)]",
      // Disabled state
      "disabled:cursor-not-allowed disabled:opacity-50",
      // Smooth transitions with proper duration (150-300ms per UX guidelines)
      "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
      // Touch target - ensure minimum 44px hit area
      "min-h-[44px] min-w-[44px]",
      className
    )}
    aria-label={ariaLabel}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        // Thumb styling
        "pointer-events-none block h-5 w-5 rounded-full",
        // Background and shadow - uses GitHub colors
        "bg-white dark:bg-[var(--gh-fg-on-emphasis)]",
        "shadow-md ring-0",
        // Transform for animation - smooth slide with scale
        "transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
        // Checked/unchecked positions
        "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
        // Subtle scale effect on state change
        "data-[state=checked]:scale-110 data-[state=unchecked]:scale-100"
      )}
    />
  </SwitchPrimitives.Root>
))

Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
