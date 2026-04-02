import React from 'react';
import { typography } from '../tokens';
import styles from './Text.module.css';

export type TextVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'h5' 
  | 'h6' 
  | 'body1' 
  | 'body2' 
  | 'caption' 
  | 'overline' 
  | 'code';

export type TextColor = 'default' | 'muted' | 'accent' | 'error' | 'success';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Text variant/style
   * @default 'body1'
   */
  variant?: TextVariant;
  /**
   * Text color
   * @default 'default'
   */
  color?: TextColor;
  /**
   * Responsive sizing
   * @default false
   */
  responsive?: boolean;
  /**
   * Truncate text with ellipsis
   * @default false
   */
  truncate?: boolean;
  /**
   * Number of lines to show before truncating
   */
  lineClamp?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * HTML element to render (overrides variant default)
   */
  as?: keyof React.JSX.IntrinsicElements;
  /**
   * Accessible label for screen readers
   */
  ariaLabel?: string;
}

/**
 * Text Component
 * 
 * A versatile text component with multiple variants, colors, and responsive sizing.
 * Renders semantic HTML based on variant (h1-h6, p, span, code).
 */
const Text: React.FC<TextProps> = ({
  variant = 'body1',
  color = 'default',
  responsive = false,
  truncate = false,
  lineClamp,
  children,
  className = '',
  as,
  ariaLabel,
  style,
  ...props
}) => {
  // Determine HTML element based on variant
  const getElement = (): React.ElementType => {
    if (as) return as;
    
    switch (variant) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return variant;
      case 'code':
        return 'code';
      case 'overline':
        return 'span';
      default:
        return 'p';
    }
  };

  // Map variant to text style
  const getTextStyle = () => {
    const textStyle = typography.textStyles[variant];
    if (!textStyle) return {};
    
    const { fontFamily, ...rest } = textStyle;
    return rest;
  };

  // Get responsive font size
  const getResponsiveFontSize = () => {
    if (!responsive) return {};
    
    const deviceType = window.innerWidth < 768 ? 'mobile' : 
                      window.innerWidth < 1024 ? 'tablet' : 'desktop';
    
    const responsiveDevice = typography.responsive[deviceType];
    if (!responsiveDevice) return {};
    
    // Safely get the responsive size for this variant
    const responsiveSize = (responsiveDevice as Record<string, string | undefined>)[variant];
    if (!responsiveSize) return {};
    
    return { fontSize: responsiveSize };
  };

  // Combine classes
  const textClasses = [
    styles.text,
    styles[`variant-${variant}`],
    styles[`color-${color}`],
    responsive && styles.responsive,
    truncate && styles.truncate,
    lineClamp !== undefined && styles[`line-clamp-${lineClamp}`],
    className,
  ].filter(Boolean).join(' ');

  const Element = getElement();
  
  // Combine styles
  const combinedStyles = {
    ...getTextStyle(),
    ...getResponsiveFontSize(),
    ...style,
  };

  return (
    <Element
      className={textClasses}
      style={combinedStyles}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </Element>
  );
};

export default Text;