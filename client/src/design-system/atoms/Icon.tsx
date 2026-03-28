import React from 'react';
import { LucideIcon, LucideProps } from 'lucide-react';
import styles from './Icon.module.css';

export type IconSize = 'sm' | 'md' | 'lg';
export type IconColor = 'default' | 'muted' | 'accent' | 'error' | 'success' | 'warning' | 'inherit';

export interface IconProps extends Omit<LucideProps, 'size' | 'color'> {
  /**
   * Lucide icon component
   */
  icon: LucideIcon;
  /**
   * Icon size
   * @default 'md'
   */
  size?: IconSize;
  /**
   * Icon color
   * @default 'default'
   */
  color?: IconColor;
  /**
   * Whether icon is decorative (hidden from screen readers)
   * @default true
   */
  decorative?: boolean;
  /**
   * Accessible label for screen readers (required if decorative is false)
   */
  ariaLabel?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Icon Component
 * 
 * A wrapper for Lucide React icons with size variants, colors, and accessibility support.
 * Icons are decorative by default and hidden from screen readers.
 */
const Icon: React.FC<IconProps> = ({
  icon: IconComponent,
  size = 'md',
  color = 'default',
  decorative = true,
  ariaLabel,
  className = '',
  ...props
}) => {
  // Map size to pixel values
  const sizeMap: Record<IconSize, number> = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  // Combine classes
  const iconClasses = [
    styles.icon,
    styles[`size-${size}`],
    styles[`color-${color}`],
    className,
  ].filter(Boolean).join(' ');

  // Accessibility attributes
  const accessibilityProps = decorative
    ? { 'aria-hidden': true }
    : {
        role: 'img',
        'aria-label': ariaLabel,
      };

  return (
    <IconComponent
      className={iconClasses}
      size={sizeMap[size]}
      strokeWidth={2}
      {...accessibilityProps}
      {...props}
    />
  );
};

export default Icon;