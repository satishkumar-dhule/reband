import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-all duration-[0.12s] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#00d084] text-black border border-[#00d084] hover:bg-[#00e895] hover:border-[#00e895]",
        destructive:
          "bg-transparent text-[var(--gh-danger-fg)] border border-[rgba(255,92,92,0.25)] hover:bg-[rgba(255,92,92,0.08)] hover:border-[var(--gh-danger-fg)]",
        outline:
          "border border-[var(--gh-border)] bg-transparent text-[var(--gh-fg-muted)] hover:border-[#3d4f6e] hover:text-[var(--gh-fg)]",
        secondary:
          "bg-[var(--gh-canvas-subtle)] text-[var(--gh-fg)] border border-[var(--gh-border)] hover:border-[#3d4f6e]",
        ghost:
          "bg-transparent text-[var(--gh-fg-muted)] border border-transparent hover:border-[var(--gh-border)] hover:text-[var(--gh-fg)]",
        link:
          "text-[var(--gh-accent-fg)] underline-offset-4 hover:underline border-0 bg-transparent",
      },
      size: {
        default: "px-[14px] py-[7px]",
        sm:      "px-3 py-1.5 text-[11px]",
        lg:      "px-5 py-2.5 text-sm",
        icon:    "h-9 w-9 p-0",
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
