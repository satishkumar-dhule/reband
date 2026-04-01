/**
 * GitHub-Style Card Components
 * 
 * Updated to follow GitHub Primer design system:
 * - Border-radius: 6px (rounded-md) - GitHub standard
 * - Border: 1px solid border color
 * - No shadows by default (GitHub style)
 * - Proper hover states for interactive cards
 */

import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** Enable hover state styling */
    hoverable?: boolean;
  }
>(({ className, hoverable = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // GitHub standard: rounded-md (6px), no shadow by default
      "rounded-md border border-border bg-card text-card-foreground",
      // Optional hover state
      hoverable && "hover:border-primary/40 transition-colors cursor-pointer",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    // Consistent spacing: mb-3 (GitHub standard), flex-start alignment
    className={cn("flex flex-col space-y-1.5 p-4 pb-0", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold text-base leading-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  // Consistent padding: p-4 (16px) for all cards
  <div ref={ref} className={cn("p-4", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    // Consistent spacing with divider
    className={cn("flex items-center p-4 pt-0 mt-3 border-t border-border/50", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
