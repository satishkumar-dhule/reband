/**
 * Unified Button Component
 * 
 * Consistent button styling across the entire application
 * Replaces 50+ duplicate button implementations
 * 
 * Used everywhere: All pages and components
 */

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonRounded = 'default' | 'lg' | 'full';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  rounded?: ButtonRounded;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  animated?: boolean;
  className?: string;
  children?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-gh-accent text-gh-fg-on-emphasis border border-gh-border-muted hover:bg-gh-accent-hover shadow-sm focus-visible:ring-gh-accent/50',
  secondary: 'bg-transparent text-gh-fg border border-gh-border hover:bg-gh-canvas-subtle focus-visible:ring-gh-accent/50',
  outline: 'bg-transparent text-gh-fg border border-gh-border hover:bg-gh-canvas-subtle focus-visible:ring-gh-accent/50',
  ghost: 'bg-transparent text-gh-fg hover:bg-gh-canvas-subtle focus-visible:ring-gh-accent/50',
  danger: 'bg-gh-danger-emphasis text-gh-fg-on-emphasis border border-gh-border-muted hover:bg-gh-danger-hover shadow-sm focus-visible:ring-gh-danger/50',
  success: 'bg-gh-success-emphasis text-gh-fg-on-emphasis border border-gh-border-muted hover:bg-gh-success-hover shadow-sm focus-visible:ring-gh-success/50'
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-[3px] text-xs',
  md: 'px-4 py-[5px] text-sm',
  lg: 'px-5 py-[9px] text-base',
  xl: 'px-8 py-4 text-lg'
};

const roundedClasses: Record<ButtonRounded, string> = {
  default: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      rounded = 'default',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      animated = true,
      className = '',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent/50 disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClass = variantClasses[variant];
    const sizeClass = sizeClasses[size];
    const roundedClass = roundedClasses[rounded];
    const widthClass = fullWidth ? 'w-full' : '';
    const animatedClass = animated ? 'active:scale-95' : '';

    const content = (
      <>
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!loading && icon && iconPosition === 'left' && icon}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </>
    );

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          ${baseClasses}
          ${variantClass}
          ${sizeClass}
          ${roundedClass}
          ${widthClass}
          ${animatedClass}
          ${className}
        `}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

/**
 * Motion Button - Animated button with Framer Motion
 */
interface MotionButtonProps extends Omit<ButtonProps, 'animated'> {
  whileHover?: any;
  whileTap?: any;
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
}

export const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      rounded = 'default',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className = '',
      disabled,
      children,
      whileHover = { scale: 1.02 },
      whileTap = { scale: 0.98 },
      initial,
      animate,
      exit,
      transition,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent/50 disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClass = variantClasses[variant];
    const sizeClass = sizeClasses[size];
    const roundedClass = roundedClasses[rounded];
    const widthClass = fullWidth ? 'w-full' : '';

    const content = (
      <>
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!loading && icon && iconPosition === 'left' && icon}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </>
    );

    return (
      <motion.button
        ref={ref}
        disabled={disabled || loading}
        whileHover={whileHover}
        whileTap={whileTap}
        initial={initial}
        animate={animate}
        exit={exit}
        transition={transition}
        className={`
          ${baseClasses}
          ${variantClass}
          ${sizeClass}
          ${roundedClass}
          ${widthClass}
          ${className}
        `}
        {...(props as any)}
      >
        {content}
      </motion.button>
    );
  }
);

MotionButton.displayName = 'MotionButton';

/**
 * Icon Button - Button with only an icon
 */
interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: ReactNode;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', rounded = 'default', className = '', ...props }, ref) => {
    const sizeMap = {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-14 h-14'
    };

    return (
      <Button
        ref={ref}
        size={size}
        rounded={rounded}
        className={`${sizeMap[size]} p-0 ${className}`}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

/**
 * Button Group - Group of related buttons
 */
interface ButtonGroupProps {
  children: ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function ButtonGroup({ children, className = '', orientation = 'horizontal' }: ButtonGroupProps) {
  const orientationClass = orientation === 'horizontal' ? 'flex-row' : 'flex-col';
  
  return (
    <div className={`inline-flex ${orientationClass} ${className}`}>
      {children}
    </div>
  );
}
