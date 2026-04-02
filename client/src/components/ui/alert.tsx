import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-[var(--gh-accent-subtle)] border-[var(--gh-accent-fg)] text-[var(--gh-fg)]",
        info: "bg-[var(--gh-accent-subtle)] border-[var(--gh-accent-fg)] text-[var(--gh-fg)]",
        success: "bg-[var(--gh-success-subtle)] border-[var(--gh-success-fg)] text-[var(--gh-fg)]",
        warning: "bg-[var(--gh-attention-subtle)] border-[var(--gh-attention-fg)] text-[var(--gh-fg)]",
        destructive:
          "bg-[var(--gh-danger-subtle)] border-[var(--gh-danger-fg)] text-[var(--gh-danger-fg)] dark:border-[var(--gh-danger-fg)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const alertIconVariants = {
  default: "text-[var(--gh-accent-fg)]",
  info: "text-[var(--gh-accent-fg)]",
  success: "text-[var(--gh-success-fg)]",
  warning: "text-[var(--gh-attention-fg)]",
  destructive: "text-[var(--gh-danger-fg)]",
}

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertIcon = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { variant?: VariantProps<typeof alertVariants>['variant'] }
>(({ className, variant = "default", ...props }, ref) => (
  <span
    ref={ref}
    className={cn("flex-shrink-0", alertIconVariants[variant || "default"], className)}
    {...props}
  />
))
AlertIcon.displayName = "AlertIcon"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-semibold leading-none tracking-tight text-[var(--gh-fg)]", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-[var(--gh-fg-muted)] [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertIcon, AlertTitle, AlertDescription }
