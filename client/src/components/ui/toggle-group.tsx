"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"

import { cn } from "@/lib/utils"

const ToggleGroupContext = React.createContext<{
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}>({
  size: "default",
  variant: "default",
})

interface ToggleGroupProps {
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
  "aria-label"?: string;
  children?: React.ReactNode;
  type?: "single" | "multiple";
}

const ToggleGroup = React.forwardRef<
  HTMLDivElement,
  ToggleGroupProps
>(({ className, variant = "default", size = "default", children, "aria-label": ariaLabel, type = "single", ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    type={type}
    className={cn(
      "inline-flex items-center justify-center gap-1 rounded-md",
      "transition-colors duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
      className
    )}
    aria-label={ariaLabel}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
))

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

interface ToggleGroupItemProps {
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
  "aria-label"?: string;
  children?: React.ReactNode;
  value: string;
}

const ToggleGroupItem = React.forwardRef<
  HTMLButtonElement,
  ToggleGroupItemProps
>(({ className, children, variant = "default", size = "default", "aria-label": ariaLabel, value, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      value={value}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200",
        "hover:bg-[var(--gh-canvas-subtle)] dark:hover:bg-[var(--gh-bg-muted)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gh-focus-ring)] focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=on]:bg-[var(--gh-accent-subtle)] dark:data-[state=on]:bg-[var(--gh-accent-subtle)]",
        "data-[state=on]:text-[var(--gh-accent-fg)]",
        size === "default" ? "h-11 px-3 min-w-[44px] min-h-[44px]" : size === "sm" ? "h-10 px-2.5 min-w-[40px] min-h-[40px]" : "h-12 px-4 min-w-[48px] min-h-[48px]",
        variant === "outline" ? "border border-[var(--gh-border)] bg-transparent shadow-sm" : "",
        className
      )}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
})

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }
