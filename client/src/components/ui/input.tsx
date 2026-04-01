import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * If true, shows error state styling
   */
  isInvalid?: boolean
  /**
   * If true, shows success state styling
   */
  isValid?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, autoComplete, isInvalid, isValid, ...props }, ref) => {
    return (
      <input
        type={type}
        autoComplete={autoComplete ?? (type === 'password' || type === 'email' ? 'on' : 'off')}
        aria-invalid={isInvalid}
        className={cn(
          // Base input styling with GitHub tokens
          "flex min-h-[44px] w-full rounded-md border bg-transparent px-3 py-2 text-base transition-all duration-200",
          // Use GitHub border token for borders
          "border-[var(--gh-border)]",
          // Background - subtle inset in light, darker in dark mode
          "dark:bg-[var(--gh-canvas-inset)]",
          // File input styling
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--gh-fg)]",
          // Placeholder with GitHub muted text token
          "placeholder:text-[var(--gh-fg-muted)]",
          // Desktop can use smaller text
          "sm:text-sm",

          // Focus visible ring using GitHub accent color
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--gh-focus-ring)] focus-visible:border-[var(--gh-accent-fg)]",
          // Focus within for nested inputs
          "focus-within:outline-none focus-within:ring-[3px] focus-within:ring-[var(--gh-focus-ring)] focus-within:border-[var(--gh-accent-fg)]",

          // Error state - use GitHub danger tokens
          isInvalid && "border-[var(--gh-danger-fg)]",
          isInvalid && "focus-visible:ring-[var(--gh-danger-fg)]",
          isInvalid && "focus-within:ring-[var(--gh-danger-fg)]",

          // Success state - use GitHub success tokens
          isValid && "border-[var(--gh-success-fg)]",
          isValid && "focus-visible:ring-[var(--gh-success-fg)]",
          isValid && "focus-within:ring-[var(--gh-success-fg)]",

          // Disabled styles
          "disabled:cursor-not-allowed disabled:opacity-50",
          "disabled:bg-[var(--gh-canvas-subtle)]",
          "disabled:dark:bg-[var(--gh-bg-muted)]",

          // Default border color
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
