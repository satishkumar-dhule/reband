import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-3", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <div className="relative flex items-center min-h-11 min-w-11">
      <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(
          // Base styles - 18px visual size for visual clarity
          "peer h-[18px] w-[18px] shrink-0 rounded-full border-2 transition-all duration-150",
          // Border colors - light mode
          "border-[var(--gh-border)] bg-[var(--gh-canvas)]",
          // Focus state - GitHub focus ring
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gh-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--gh-canvas)]",
          // Checked state - light mode
          "data-[state=checked]:border-[var(--gh-accent-emphasis)] data-[state=checked]:bg-[var(--gh-canvas)]",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-40 disabled:data-[state=checked]:opacity-60",
          // Dark mode
          "dark:border-[var(--gh-border)] dark:bg-[var(--gh-canvas)]",
          "dark:data-[state=checked]:border-[var(--gh-accent-emphasis)] dark:data-[state=checked]:bg-[var(--gh-canvas)]",
          className
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <Circle className="h-2.5 w-2.5 fill-[var(--gh-accent-emphasis)] text-[var(--gh-accent-emphasis)] dark:fill-[var(--gh-accent-emphasis)] dark:text-[var(--gh-accent-emphasis)]" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
    </div>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
