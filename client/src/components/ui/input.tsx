import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  isInvalid?: boolean
  isValid?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, autoComplete, isInvalid, isValid, ...props }, ref) => {
    return (
      <input
        type={type}
        autoComplete={autoComplete ?? (type === "password" || type === "email" ? "on" : "off")}
        aria-invalid={isInvalid}
        className={cn(
          "flex min-h-[36px] w-full rounded-md border px-3 py-2 text-[12.5px] transition-all duration-[0.12s]",
          "bg-[var(--gh-canvas-inset)] border-[var(--gh-border)]",
          "text-[var(--gh-fg)] placeholder:text-[var(--gh-fg-subtle)]",
          "file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-[var(--gh-fg)]",
          "focus-visible:outline-none focus-visible:border-[#00d084] focus-visible:ring-[3px] focus-visible:ring-[rgba(0,208,132,0.13)]",
          "focus-within:outline-none focus-within:border-[#00d084] focus-within:ring-[3px] focus-within:ring-[rgba(0,208,132,0.13)]",
          isInvalid && "border-[var(--gh-danger-fg)] focus-visible:border-[var(--gh-danger-fg)] focus-visible:ring-[rgba(255,92,92,0.15)]",
          isValid   && "border-[#00d084] focus-visible:ring-[rgba(0,208,132,0.13)]",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--gh-canvas-subtle)]",
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
