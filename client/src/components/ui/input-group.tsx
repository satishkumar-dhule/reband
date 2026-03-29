import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        // Base container with GitHub tokens
        "group/input-group relative flex w-full items-center rounded-md border border-[var(--gh-border)] bg-transparent outline-none transition-all duration-200",
        // Height behavior
        "h-9 has-[>textarea]:h-auto has-[>textarea]:flex-col",

        // Variants based on alignment - inline start
        "has-[>[data-align=inline-start]]:[&>input]:pl-2",
        // Variants based on alignment - inline end  
        "has-[>[data-align=inline-end]]:[&>input]:pr-2",
        // Variants based on alignment - block start (top stacked)
        "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3",
        // Variants based on alignment - block end (bottom stacked)
        "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3",

        // Focus state using GitHub focus ring token
        "has-[[data-slot=input-group-control]:focus-visible]:border-[var(--gh-accent-fg)] has-[[data-slot=input-group-control]:focus-visible]:ring-2 has-[[data-slot=input-group-control]:focus-visible]:ring-[var(--gh-focus-ring)]",

        // Error state using GitHub danger tokens
        "has-[[data-slot][aria-invalid=true]]:border-[var(--gh-danger-emphasis)] has-[[data-slot][aria-invalid=true]]:ring-2 has-[[data-slot][aria-invalid=true]]:ring-[var(--gh-danger-subtle)]",
        // Dark mode error state
        "dark:has-[[data-slot][aria-invalid=true]]:border-[var(--gh-danger-fg)] dark:has-[[data-slot][aria-invalid=true]]:ring-[var(--gh-danger-subtle)]",

        // Dark mode border
        "dark:border-[var(--gh-border)]",

        className
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  // GitHub muted text token for addon
  "flex h-auto cursor-text select-none items-center justify-center gap-2 py-1.5 text-sm font-medium text-[var(--gh-fg-muted)] group-data-[disabled=true]/input-group:opacity-50",
  {
    variants: {
      align: {
        "inline-start":
          "order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem] rounded-l-[calc(var(--radius)-5px)]",
        "inline-end":
          "order-last pr-3 has-[>button]:mr-[-0.4rem] has-[>kbd]:mr-[-0.35rem] rounded-r-[calc(var(--radius)-5px)]",
        "block-start":
          "order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5 rounded-t-[calc(var(--radius)-5px)]",
        "block-end":
          "order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5 rounded-b-[calc(var(--radius)-5px)]",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
)

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus()
      }}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva(
  "flex items-center gap-2 text-sm shadow-none",
  {
    variants: {
      size: {
        xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5",
        "icon-xs":
          "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
        "icon-sm": "size-8 p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  }
)

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> &
  VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        // GitHub muted text for group text
        "flex items-center gap-2 text-sm text-[var(--gh-fg-muted)] [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none",
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  isInvalid,
  ...props
}: React.ComponentProps<"input"> & { isInvalid?: boolean }) {
  return (
    <Input
      data-slot="input-group-control"
      isInvalid={isInvalid}
      className={cn(
        // Remove border from inner input since container has it
        "flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent focus-visible:outline-none",
        className
      )}
      {...props}
    />
  )
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        // Remove border from inner textarea since container has it
        "flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent focus-visible:outline-none",
        className
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}
