/**
 * @deprecated Use unified/Button.tsx instead
 * 
 * This component is kept for backward compatibility with shadcn/ui components.
 * All new code should use the unified Button component from:
 * 
 *   import { Button } from '@/components/unified/Button';
 * 
 * The unified Button provides:
 * - More variants (primary, secondary, outline, ghost, danger, success)
 * - More sizes (xs, sm, md, lg, xl)
 * - Rounded options (default, lg, full)
 * - Loading state, icon support, fullWidth, animated options
 * - MotionButton, IconButton, and ButtonGroup components
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
// Note: For new code, import the unified Button:
// import { Button } from '@/components/unified/Button';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:shadow-md active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border border-border hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground border border-destructive-border hover:bg-destructive/90",
        outline: "border border-border bg-transparent hover:bg-muted/50 active:bg-muted/80",
        secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80",
        ghost: "border border-transparent hover:bg-muted/50 active:bg-muted/80",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-9 px-4 py-2",
        sm: "min-h-8 rounded-md px-3 text-xs",
        lg: "min-h-11 rounded-md px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type = "button", ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        type={asChild ? undefined : type}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }