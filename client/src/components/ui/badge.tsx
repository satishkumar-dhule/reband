import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Badge Component - GitHub-style labels with semantic colors
 * 
 * Variants:
 * - default: Primary accent (GitHub blue)
 * - secondary: Subtle background for less emphasis
 * - destructive: Red for danger/deletion states
 * - outline: Border-only style for neutral states
 * - success: Green for success/completion states
 * - warning: Yellow/amber for warnings/attention
 * - info: Blue for informational content
 * 
 * Sizes:
 * - sm: Compact size for inline use (text-xs, px-1.5 py-0.5)
 * - default: Standard size (text-xs, px-2.5 py-0.5)
 * - lg: Larger size for emphasis (text-sm, px-3 py-1)
 */
const badgeVariants = cva(
  "whitespace-nowrap inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--gh-focus-ring)] focus:ring-offset-2",
  {
    variants: {
      variant: {
        // GitHub accent blue - primary action/feature labels
        default: "border-transparent bg-[var(--gh-accent-fg)] text-[var(--gh-fg-on-emphasis)]",
        // Subtle gray - secondary/muted labels
        secondary: "border-transparent bg-[var(--gh-neutral-subtle)] text-[var(--gh-fg)]",
        // Danger red - destructive/error states
        destructive: "border-transparent bg-[var(--gh-danger-emphasis)] text-[var(--gh-fg-on-emphasis)]",
        // Outline style - neutral, border-only
        outline: "border border-[var(--gh-border)] text-[var(--gh-fg)]",
        // Success green - completion/success states
        success: "border-transparent bg-[var(--gh-success-emphasis)] text-[var(--gh-fg-on-emphasis)]",
        // Warning amber - attention/warning states
        warning: "border-transparent bg-[var(--gh-attention-emphasis)] text-[var(--gh-fg-on-emphasis)]",
        // Info blue - informational content
        info: "border-transparent bg-[var(--gh-accent-emphasis)] text-[var(--gh-fg-on-emphasis)]",
      },
      size: {
        sm: "text-[10px] px-1.5 py-0.5",
        default: "text-xs px-2.5 py-0.5",
        lg: "text-sm px-3 py-1",
      },
      // Dot indicator - shows a colored dot before the text
      dot: {
        true: "gap-1.5 pl-2",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      dot: false,
    },
    compoundVariants: [
      // Dot with specific colors
      {
        dot: true,
        variant: "default",
        className: "before:content-[''] before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:opacity-80",
      },
      {
        dot: true,
        variant: "secondary",
        className: "before:content-[''] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[var(--gh-fg-muted)]",
      },
      {
        dot: true,
        variant: "destructive",
        className: "before:content-[''] before:h-1.5 before:w-1.5 before:rounded-full before:bg-current",
      },
      {
        dot: true,
        variant: "success",
        className: "before:content-[''] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[var(--gh-success-fg)]",
      },
      {
        dot: true,
        variant: "warning",
        className: "before:content-[''] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[var(--gh-attention-fg)]",
      },
      {
        dot: true,
        variant: "info",
        className: "before:content-[''] before:h-1.5 before:w-1.5 before:rounded-full before:bg-current",
      },
      {
        dot: true,
        variant: "outline",
        className: "before:content-[''] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[var(--gh-border)]",
      },
    ],
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Show a colored dot indicator before the text */
  dot?: boolean
}

function Badge({ className, variant, size, dot, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size, dot }), className)} {...props} />
  )
}

export { Badge, badgeVariants }