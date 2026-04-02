"use client"

import { useMemo } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Info } from "lucide-react"

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-6",
        "has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className
      )}
      {...props}
    />
  )
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-3 font-medium",
        // GitHub design tokens for text colors
        "text-[var(--gh-fg)] dark:text-[var(--gh-fg)]",
        "data-[variant=legend]:text-base",
        "data-[variant=label]:text-sm",
        // Focus visible ring
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gh-accent-emphasis)] focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 [&>[data-slot=field-group]]:gap-4",
        className
      )}
      {...props}
    />
  )
}

const fieldVariants = cva(
  // Base styles - use data attribute for invalid state
  "group/field data-[invalid=true]:text-[var(--gh-danger-fg)] flex w-full gap-3",
  {
    variants: {
      orientation: {
        vertical: ["flex-col [&>*]:w-full [&>.sr-only]:w-auto"],
        horizontal: [
          "flex-row items-center",
          "[&>[data-slot=field-label]]:flex-auto",
          "has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px has-[>[data-slot=field-content]]:items-start",
        ],
        responsive: [
          "@md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto flex-col [&>*]:w-full [&>.sr-only]:w-auto",
          "@md/field-group:[&>[data-slot=field-label]]:flex-auto",
          "@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        ],
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  }
)

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "group/field-content flex flex-1 flex-col gap-1.5 leading-snug",
        className
      )}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  required,
  ...props
}: React.ComponentProps<typeof Label> & { required?: boolean }) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        // Base styles using GitHub design tokens
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug",
        "text-[var(--gh-fg)] dark:text-[var(--gh-fg)]",
        // Disabled state
        "group-data-[disabled=true]/field:opacity-50",
        // Focus visible ring for accessibility
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gh-accent-emphasis)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--gh-canvas)]",
        // Required indicator
        required && "after:content-['*'] after:ml-0.5 after:text-[var(--gh-danger-fg)]",
        className
      )}
      {...props}
    />
  )
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        // Base styles with GitHub tokens
        "flex w-fit items-center gap-2 text-sm font-medium leading-snug",
        "text-[var(--gh-fg)] dark:text-[var(--gh-fg)]",
        // Disabled state
        "group-data-[disabled=true]/field:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        // Base styles - GitHub muted text with dark mode support
        "text-sm font-normal leading-normal",
        "text-[var(--gh-fg-muted)] dark:text-[var(--gh-fg-muted)]",
        // Better text balance for horizontal layouts
        "group-has-[[data-orientation=horizontal]]/field:text-balance",
        // Link styling
        "[&>a:hover]:text-[var(--gh-accent-fg)] [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        // Base styles
        "relative -my-2 h-5 text-sm",
        // GitHub muted text
        "text-[var(--gh-fg-muted)] dark:text-[var(--gh-fg-muted)]",
        // Variant-specific styling
        "group-data-[variant=outline]/field-group:-mb-2",
        className
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="bg-[var(--gh-canvas)] text-[var(--gh-fg-muted)] dark:bg-[var(--gh-canvas)] dark:text-[var(--gh-fg-muted)] relative mx-auto block w-fit px-2"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>
}) {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors) {
      return null
    }

    if (errors?.length === 1 && errors[0]?.message) {
      return errors[0].message
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {errors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>
        )}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      data-slot="field-error"
      className={cn(
        // Base styles using GitHub danger tokens with dark mode support
        "flex items-start gap-1.5 text-sm font-normal",
        "text-[var(--gh-danger-fg)] dark:text-[var(--gh-danger-fg)]",
        // Animation for attention
        "animate-in fade-in slide-in-from-top-1 duration-200",
        className
      )}
      {...props}
    >
      <AlertCircle
        className="h-4 w-4 flex-shrink-0 mt-0.5"
        aria-hidden="true"
      />
      {content}
    </div>
  )
}

function FieldHelp({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  if (!children) {
    return null
  }

  return (
    <div
      data-slot="field-help"
      className={cn(
        // Base styles
        "flex items-center gap-1.5 text-sm",
        // GitHub muted text with dark mode
        "text-[var(--gh-fg-muted)] dark:text-[var(--gh-fg-muted)]",
        className
      )}
      {...props}
    >
      <Info
        className="h-4 w-4 flex-shrink-0"
        aria-hidden="true"
      />
      {children}
    </div>
  )
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldHelp,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
}
