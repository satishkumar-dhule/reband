/**
 * GitHub-Style Box Component
 * 
 * Provides consistent card/panel design following GitHub Primer design system.
 * Standard border-radius: 6px (rounded-md)
 * Border: 1px solid var(--color-border-default)
 * 
 * Usage:
 * - Use <Box> instead of inline divs with border/bg classes
 * - Supports all GitHub card variants (default, secondary, outline, highlight)
 * - Automatically includes proper hover/focus states
 */

import { ReactNode, ElementType, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export type BoxVariant = 'default' | 'secondary' | 'outline' | 'highlight' | 'danger';
export type BoxSize = 'sm' | 'md' | 'lg' | 'xl';
export type BoxRounded = 'default' | 'none' | 'sm' | 'md' | 'lg';

// GitHub border token reference
// --gh-border: #d0d7de (light) / #30363d (dark)

const variantStyles: Record<BoxVariant, string> = {
  default: 'bg-card border border-border',
  secondary: 'bg-muted border border-border', 
  outline: 'bg-transparent border border-border',
  highlight: 'bg-accent-subtle border-accent-fg text-accent-fg',
  danger: 'bg-danger-subtle border-danger-fg text-danger-fg',
};

const hoverStyles: Record<BoxVariant, string> = {
  default: 'hover:border-primary/40 hover:shadow-sm transition-colors',
  secondary: 'hover:border-primary/40 hover:bg-muted/80 transition-colors',
  outline: 'hover:border-primary/40 transition-colors',
  highlight: 'hover:border-accent-fg/60 transition-colors',
  danger: 'hover:border-danger-fg/60 transition-colors',
};

const sizeStyles: Record<BoxSize, string> = {
  sm: 'p-2',      // 8px
  md: 'p-3',      // 16px  
  lg: 'p-4',      // 24px
  xl: 'p-5',      // 32px
};

const roundedStyles: Record<BoxRounded, string> = {
  default: 'rounded-md', // GitHub standard: 6px
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
};

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Box variant (background + border style) */
  variant?: BoxVariant;
  /** Padding size */
  size?: BoxSize;
  /** Border radius override */
  rounded?: BoxRounded;
  /** Enable hover state */
  hoverable?: boolean;
  /** Enable focus ring */
  focusable?: boolean;
  /** Click handler for interactive boxes */
  onClick?: () => void;
  /** Render as different element */
  as?: ElementType;
  /** Content */
  children: ReactNode;
}

export const Box = forwardRef<HTMLDivElement, BoxProps>(function Box({
  variant = 'default',
  size,
  rounded = 'default',
  hoverable = false,
  focusable = false,
  onClick,
  as: Component = 'div',
  children,
  className,
  ...props
}, ref) {
  const baseStyles = variantStyles[variant];
  const sizeClass = size ? sizeStyles[size] : '';
  const roundedClass = roundedStyles[rounded];
  const hoverClass = hoverable ? hoverStyles[variant] : '';
  const focusClass = focusable ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2' : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';
  
  const isInteractive = onClick || hoverable;

  return (
    <Component
      ref={ref}
      className={cn(
        baseStyles,
        sizeClass,
        roundedClass,
        isInteractive && hoverClass,
        focusClass,
        clickableClass,
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
});

/**
 * Card component alias for Box (semantic naming)
 */
export const Card = Box;

/**
 * CardHeader - Consistent header section for Box/Card
 */
interface CardHeaderProps {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, icon, className }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
        <div className="flex-1 min-w-0">
          {typeof title === 'string' ? (
            <h3 className="font-semibold text-base leading-tight">{title}</h3>
          ) : title}
          {subtitle && (
            typeof subtitle === 'string' ? (
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            ) : subtitle
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0 ml-3">{action}</div>}
    </div>
  );
}

/**
 * CardFooter - Consistent footer section for Box/Card  
 */
interface CardFooterProps {
  children: ReactNode;
  className?: string;
  divider?: boolean;
}

export function CardFooter({ children, className = '', divider = true }: CardFooterProps) {
  return (
    <div className={`${divider ? 'pt-4 mt-4 border-t border-border/50' : ''} ${className}`}>
      {children}
    </div>
  );
}

export default Box;
