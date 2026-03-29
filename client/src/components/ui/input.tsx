import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * If true, shows error state styling
   */
  isInvalid?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, autoComplete, isInvalid, ...props }, ref) => {
    return (
      <input
        type={type}
        autoComplete={autoComplete ?? (type === 'password' || type === 'email' ? 'on' : 'off')}
        aria-invalid={isInvalid}
        className={cn(
          // Base input styling with GitHub tokens
          "flex min-h-[44px] w-full rounded-md border bg-transparent px-3 py-2 text-base transition-all duration-200",
          // Use GitHub border tokens for borders
          "border-[var(--gh-border)]",
          // Background - subtle inset in light, darker in dark mode
          "dark:bg-[var(--gh-bg-inset)]",
          // File input styling
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[var(--gh-fg)]",
          // Placeholder with GitHub muted text token
          "placeholder:text-[var(--gh-fg-muted)]",
          // Desktop can use smaller text
          "sm:text-sm",

          // Focus visible ring using GitHub focus token
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gh-focus-ring)] focus-visible:border-[var(--gh-accent-fg)]",
          // Focus within for nested inputs
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-[var(--gh-focus-ring)] focus-within:border-[var(--gh-accent-fg)]",

          // Error state - border color using GitHub danger token
          isInvalid && "border-[var(--gh-danger-emphasis)]",
          isInvalid && "focus-visible:ring-[var(--gh-danger-subtle)]",
          // Dark mode error states
          "dark:is-invalid:border-[var(--gh-danger-fg)]",

          // Disabled styles
          "disabled:cursor-not-allowed disabled:opacity-50",
          "disabled:bg-[var(--gh-canvas-subtle)]",
          "disabled:dark:bg-[var(--gh-bg-muted)]",

          // Default border color
          className
        )}
        style={{
          // GitHub border token
          '--tw-border-color': 'var(--gh-border)',
        } as React.CSSProperties}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
