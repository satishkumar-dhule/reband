import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "whitespace-nowrap inline-flex items-center gap-[5px] rounded text-[11px] font-medium transition-colors duration-[0.12s] focus:outline-none",
  {
    variants: {
      variant: {
        default:     "bg-[rgba(0,208,132,0.10)]   text-[#00d084]",
        secondary:   "bg-[var(--gh-neutral-subtle)] text-[var(--gh-fg-muted)]",
        destructive: "bg-[rgba(255,92,92,0.10)]   text-[#ff5c5c]",
        outline:     "border border-[var(--gh-border)] text-[var(--gh-fg-muted)] bg-transparent",
        success:     "bg-[rgba(0,208,132,0.10)]   text-[#00d084]",
        warning:     "bg-[rgba(245,166,35,0.10)]  text-[#f5a623]",
        info:        "bg-[rgba(79,168,255,0.10)]  text-[#4fa8ff]",
      },
      size: {
        sm:      "text-[10px] px-1.5 py-0.5",
        default: "px-2 py-0.5",
        lg:      "text-xs px-3 py-1",
      },
      dot: {
        true:  "pl-2",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      dot: false,
    },
    compoundVariants: [
      { dot: true, variant: "default",     className: "before:content-[''] before:h-[5px] before:w-[5px] before:rounded-full before:bg-[#00d084]" },
      { dot: true, variant: "success",     className: "before:content-[''] before:h-[5px] before:w-[5px] before:rounded-full before:bg-[#00d084]" },
      { dot: true, variant: "secondary",   className: "before:content-[''] before:h-[5px] before:w-[5px] before:rounded-full before:bg-[var(--gh-fg-muted)]" },
      { dot: true, variant: "destructive", className: "before:content-[''] before:h-[5px] before:w-[5px] before:rounded-full before:bg-[#ff5c5c]" },
      { dot: true, variant: "warning",     className: "before:content-[''] before:h-[5px] before:w-[5px] before:rounded-full before:bg-[#f5a623]" },
      { dot: true, variant: "info",        className: "before:content-[''] before:h-[5px] before:w-[5px] before:rounded-full before:bg-[#4fa8ff]" },
      { dot: true, variant: "outline",     className: "before:content-[''] before:h-[5px] before:w-[5px] before:rounded-full before:bg-[var(--gh-border)]" },
    ],
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, size, dot, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size, dot }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
