import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.ComponentProps<"textarea"> {
  /**
   * Optional character limit to display
   */
  maxLength?: number
  /**
   * Show character count display
   */
  showCount?: boolean
  /**
   * Custom error message to display
   */
  error?: string
  /**
   * Label for accessibility
   */
  label?: string
  /**
   * Helper text below the textarea
   */
  helperText?: string
  /**
   * Whether to allow resize
   */
  resizable?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      maxLength,
      showCount,
      error,
      label,
      helperText,
      resizable = true,
      id,
      aria-describedby,
      ...props
    },
    ref
  ) => {
    const textareaId = id || React.useId()
    const helperId = `${textareaId}-helper`
    const errorId = `${textareaId}-error`
    const countId = `${textareaId}-count`

    const [isFocused, setIsFocused] = React.useState(false)

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false)
      props.onBlur?.(e)
    }

    const characterCount = props.value
      ? String(props.value).length
      : props.defaultValue
      ? String(props.defaultValue).length
      : 0

    const isOverLimit = maxLength && characterCount > maxLength
    const isNearLimit = maxLength && !isOverLimit && characterCount >= maxLength * 0.9

    // Build aria-describedby
    const describedBy = [
      aria-describedby,
      error && errorId,
      helperText && helperId,
      showCount && maxLength && countId,
    ]
      .filter(Boolean)
      .join(" ") || undefined

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-[var(--gh-fg)] mb-1.5"
          >
            {label}
            {props.required && (
              <span className="text-[var(--gh-danger-fg)] ml-0.5" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          <textarea
            id={textareaId}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            aria-label={label ? undefined : props["aria-label"]}
            maxLength={maxLength}
            className={cn(
              // Base styles - mobile-first with 44px min-height for touch target
              "flex min-h-[80px] w-full rounded-md border px-3 py-2 text-base",
              // Font and text styling
              "font-sans text-[var(--gh-fg)] placeholder:text-[var(--gh-fg-muted)]",
              // Background - transparent to let canvas show through
              "bg-transparent",
              // Border styling - GitHub tokens
              "border-[var(--gh-border)]",
              // Focus states - GitHub focus ring
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gh-accent-fg)] focus-visible:border-[var(--gh-accent-fg)]",
              // Transition for smooth interactions
              "transition-all duration-[var(--gh-duration-fast,150ms)]",
              // Disabled state
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--gh-canvas-subtle)]",
              // Resize handle styling
              resizable ? "resize-y" : "resize-none",
              // Error state
              error && [
                "border-[var(--gh-danger-fg)]",
                "focus-visible:ring-[var(--gh-danger-fg)]",
                "focus-visible:border-[var(--gh-danger-fg)]",
              ],
              // Desktop can use smaller text
              "sm:text-sm",
              className
            )}
            {...props}
          />

          {/* Custom resize handle styling for WebKit browsers */}
          <style>{`
            textarea::-webkit-resizer {
              background-color: var(--gh-fg-muted);
              -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 21v-6m0-3V3m18 6v-3m0 3V3m-9 9h6m3-3h-6m0 3V3m-3 18h6m-3-3h-6'/%3E%3C/svg%3E");
              -webkit-mask-size: 12px;
              -webkit-mask-position: center;
              -webkit-mask-repeat: no-repeat;
              mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 21v-6m0-3V3m18 6v-3m0 3V3m-9 9h6m3-3h-6m0 3V3m-3 18h6m-3-3h-6'/%3E%3C/svg%3E");
              mask-size: 12px;
              mask-position: center;
              mask-repeat: no-repeat;
              opacity: 0.4;
            }
            textarea::-webkit-resizer:hover {
              opacity: 0.7;
            }
            textarea::-moz-resizer {
              background-color: var(--gh-fg-muted);
              border: none;
            }
            @media (prefers-color-scheme: dark) {
              textarea::-webkit-resizer {
                opacity: 0.5;
              }
            }
          `}</style>
        </div>

        {/* Character count display */}
        {showCount && maxLength && (
          <div
            id={countId}
            className={cn(
              "mt-1 text-xs text-right transition-colors duration-150",
              isOverLimit && "text-[var(--gh-danger-fg)] font-medium",
              isNearLimit && !isOverLimit && "text-[var(--gh-attention-fg)]",
              !isNearLimit && !isOverLimit && "text-[var(--gh-fg-muted)]"
            )}
            aria-live="polite"
          >
            {characterCount.toLocaleString()} / {maxLength.toLocaleString()}
          </div>
        )}

        {/* Error message */}
        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-sm text-[var(--gh-danger-fg)] flex items-center gap-1"
            role="alert"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </p>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <p
            id={helperId}
            className="mt-1.5 text-sm text-[var(--gh-fg-muted)]"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
