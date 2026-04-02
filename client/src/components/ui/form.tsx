import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2 } from "lucide-react"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  if (!itemContext) {
    throw new Error("useFormField should be used within <FormItem>")
  }

  const fieldState = getFieldState(fieldContext.name, formState)

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue | null>(null)

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        ref={ref}
        className={cn(
          // Base spacing
          "space-y-2",
          // Ensure proper touch target minimum
          "min-h-[44px]",
          className
        )}
        {...props}
      />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    required?: boolean
  }
>(({ className, required, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      htmlFor={formItemId}
      className={cn(
        // Base styles - use GitHub design tokens for consistency
        "text-sm font-medium leading-snug",
        // Dark mode support - ensure proper contrast in both modes
        "dark:text-[var(--gh-fg)]",
        // Error state styling with GitHub danger tokens
        error && "text-[var(--gh-danger-fg)] dark:text-[var(--gh-danger-fg)]",
        // Focus visible ring for accessibility
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gh-accent-emphasis)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--gh-canvas)]",
        className
      )}
      {...props}
    >
      {props.children}
      {required && (
        <span
          aria-hidden="true"
          className="text-[var(--gh-danger-fg)] dark:text-[var(--gh-danger-fg)] ml-0.5"
        >
          *
        </span>
      )}
    </Label>
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      // Ensure proper focus styling - the input component should handle this
      data-invalid={error ? "true" : "false"}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn(
        // Base styles
        "text-[0.8rem]",
        // Use GitHub muted text token for consistency
        "text-[var(--gh-fg-muted)]",
        // Dark mode - ensure proper contrast
        "dark:text-[var(--gh-fg-muted)]",
        className
      )}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      role="alert"
      aria-live="polite"
      className={cn(
        // Base styles - flex for icon alignment
        "flex items-center gap-1.5 text-[0.8rem] font-medium",
        // Error state - use GitHub danger tokens for consistency
        error && [
          "text-[var(--gh-danger-fg)]",
          "dark:text-[var(--gh-danger-fg)]",
        ],
        // Success state (when no error but has children)
        !error && children && [
          "text-[var(--gh-success-fg)]",
          "dark:text-[var(--gh-success-fg)]",
        ],
        // Animation for attention
        "animate-in fade-in slide-in-from-top-1 duration-200",
        className
      )}
      {...props}
    >
      {error ? (
        <AlertCircle
          className="h-4 w-4 flex-shrink-0"
          aria-hidden="true"
        />
      ) : children ? (
        <CheckCircle2
          className="h-4 w-4 flex-shrink-0"
          aria-hidden="true"
        />
      ) : null}
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
