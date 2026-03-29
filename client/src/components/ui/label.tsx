"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  // Base styles - GitHub design tokens with proper dark mode support
  "text-sm font-medium leading-snug peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "text-[var(--gh-fg)] dark:text-[var(--gh-fg)]",
        muted: "text-[var(--gh-fg-muted)] dark:text-[var(--gh-fg-muted)]",
        destructive: "text-[var(--gh-danger-fg)] dark:text-[var(--gh-danger-fg)]",
        success: "text-[var(--gh-success-fg)] dark:text-[var(--gh-success-fg)]",
      },
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, variant, size, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      labelVariants({ variant, size }),
      // Focus visible ring for accessibility
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gh-accent-emphasis)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--gh-canvas)]",
      // Ensure cursor pointer for clickable labels
      "cursor-pointer",
      className
    )}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label, labelVariants }
