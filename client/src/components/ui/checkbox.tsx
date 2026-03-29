import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  "aria-invalid"?: boolean
  "aria-describedby"?: string
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, "aria-invalid": ariaInvalid, "aria-describedby": ariaDescribedBy, ...props }, ref) => (
  <div className="relative flex items-center justify-center min-h-11 min-w-11">
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        // Base styles - 18px visual size for visual clarity
        "peer h-[18px] w-[18px] shrink-0 rounded-md border-2 transition-all duration-150",
        // Border colors - light mode
        "border-[var(--gh-border)] bg-[var(--gh-canvas)]",
        // Focus state - GitHub focus ring
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gh-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--gh-canvas)]",
        // Checked state - light mode
        "data-[state=checked]:border-[var(--gh-accent-emphasis)] data-[state=checked]:bg-[var(--gh-accent-emphasis)] data-[state=checked]:text-[var(--gh-fg-on-emphasis)]",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:data-[state=checked]:opacity-60",
        // Dark mode
        "dark:border-[var(--gh-border)] dark:bg-[var(--gh-canvas)]",
        "dark:data-[state=checked]:border-[var(--gh-accent-emphasis)] dark:data-[state=checked]:bg-[var(--gh-accent-emphasis)] dark:data-[state=checked]:text-[var(--gh-fg-on-emphasis)]",
        // Error/invalid state
        ariaInvalid && "border-[var(--gh-danger-emphasis)] ring-2 ring-[var(--gh-danger-subtle)] dark:ring-[var(--gh-danger-subtle)]",
        ariaInvalid && "data-[state=checked]:bg-[var(--gh-danger-emphasis)] data-[state=checked]:border-[var(--gh-danger-emphasis)]",
        className
      )}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        <Check className="h-3.5 w-3.5 stroke-[3]" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  </div>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
