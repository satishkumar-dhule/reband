import React from 'react';
import { colors, typography, spacing, animations } from '../tokens';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'rating' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type RatingType = 'again' | 'hard' | 'good' | 'easy';
export type ButtonState = 'default' | 'hover' | 'active' | 'disabled' | 'loading';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant
   * @default 'primary'
   */
  variant?: ButtonVariant;
  /**
   * Button size
   * @default 'md'
   */
  size?: ButtonSize;
  /**
   * Rating type (only used when variant is 'rating')
   */
  ratingType?: RatingType;
  /**
   * Show loading spinner
   * @default false
   */
  loading?: boolean;
  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Icon to display before button text
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon to display after button text
   */
  rightIcon?: React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Accessible label for screen readers
   */
  ariaLabel?: string;
}

/**
 * Button Component
 * 
 * A versatile button component with multiple variants, sizes, and states.
 * Supports rating buttons for SRS functionality.
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  ratingType,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled = false,
  ariaLabel,
  ...props
}) => {
  // Determine if button is disabled
  const isDisabled = disabled || loading;
  
  // Get rating-specific styles
  const getRatingStyles = () => {
    if (variant !== 'rating' || !ratingType) return {};
    
    const ratingColors = {
      again: colors.srs.again,
      hard: colors.srs.hard,
      good: colors.srs.good,
      easy: colors.srs.easy,
    };
    
    return {
      backgroundColor: ratingColors[ratingType],
      '--rating-color': ratingColors[ratingType],
    };
  };

  // Combine classes
  const buttonClasses = [
    styles.button,
    styles[`variant-${variant}`],
    styles[`size-${size}`],
    fullWidth && styles['full-width'],
    loading && styles.loading,
    isDisabled && styles.disabled,
    variant === 'rating' && ratingType && styles[`rating-${ratingType}`],
    className,
  ].filter(Boolean).join(' ');

  // Generate accessible label
  const getAriaLabel = () => {
    if (ariaLabel) return ariaLabel;
    if (variant === 'rating' && ratingType) {
      return `Rate as ${ratingType}`;
    }
    return undefined;
  };

  return (
    <button
      className={buttonClasses}
      disabled={isDisabled}
      aria-label={getAriaLabel()}
      aria-busy={loading}
      data-variant={variant}
      data-size={size}
      data-rating-type={ratingType}
      style={variant === 'rating' ? getRatingStyles() : undefined}
      {...props}
    >
      {loading && (
        <span className={styles.spinner} aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles['spinner-icon']}
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="31.42"
              strokeDashoffset="10"
            />
          </svg>
        </span>
      )}
      
      {leftIcon && !loading && (
        <span className={styles['left-icon']} aria-hidden="true">
          {leftIcon}
        </span>
      )}
      
      <span className={styles.content}>
        {children}
      </span>
      
      {rightIcon && (
        <span className={styles['right-icon']} aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default Button;