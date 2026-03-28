import React from 'react';
import { colors, typography, spacing, animations } from '../tokens';
import styles from './Badge.module.css';

export type BadgeType = 'xp' | 'level' | 'mastery' | 'streak' | 'notification';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Badge type
   * @default 'notification'
   */
  type?: BadgeType;
  /**
   * Badge size
   * @default 'md'
   */
  size?: BadgeSize;
  /**
   * Badge content (number for XP, level, streak, notification)
   */
  value?: number | string;
  /**
   * Badge label (for accessibility)
   */
  label?: string;
  /**
   * Mastery level (0-5, only for mastery type)
   */
  masteryLevel?: MasteryLevel;
  /**
   * Whether badge has animation
   * @default false
   */
  animate?: boolean;
  /**
   * Whether badge is new (glowing effect)
   * @default false
   */
  isNew?: boolean;
  /**
   * Maximum value to display (for large numbers)
   */
  maxValue?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Icon component
   */
  icon?: React.ReactNode;
}

/**
 * Badge Component
 * 
 * A versatile badge component for XP, level, mastery, streak, and notification displays.
 * Supports animations and various visual states.
 */
const Badge: React.FC<BadgeProps> = ({
  type = 'notification',
  size = 'md',
  value,
  label,
  masteryLevel = 0,
  animate = false,
  isNew = false,
  maxValue = 999,
  className = '',
  icon,
  children,
  ...props
}) => {
  // Format large numbers
  const formatValue = (val: number | string | undefined): string => {
    if (val === undefined) return '';
    if (typeof val === 'string') return val;
    
    if (val > maxValue) {
      return `${Math.floor(val / 1000)}k+`;
    }
    
    return val.toString();
  };

  // Get mastery color
  const getMasteryColor = (level: MasteryLevel): string => {
    const masteryColors = colors.srs.mastery;
    return masteryColors[level] || masteryColors[0];
  };

  // Get badge-specific styles
  const getBadgeStyles = () => {
    switch (type) {
      case 'xp':
        return {
          backgroundColor: colors.primary[500],
          color: colors.primary.contrastText,
        };
      case 'level':
        return {
          backgroundColor: colors.secondary[500],
          color: colors.secondary.contrastText,
        };
      case 'mastery':
        return {
          backgroundColor: getMasteryColor(masteryLevel),
          color: '#FFFFFF',
        };
      case 'streak':
        return {
          backgroundColor: colors.semantic.warning.main,
          color: colors.semantic.warning.contrastText,
        };
      case 'notification':
      default:
        return {
          backgroundColor: colors.semantic.error.main,
          color: colors.semantic.error.contrastText,
        };
    }
  };

  // Get accessible label
  const getAccessibleLabel = () => {
    if (label) return label;
    
    switch (type) {
      case 'xp':
        return `${value} experience points`;
      case 'level':
        return `Level ${value}`;
      case 'mastery':
        return `Mastery level ${masteryLevel}`;
      case 'streak':
        return `${value} day streak`;
      case 'notification':
        return `${value} notifications`;
      default:
        return 'Badge';
    }
  };

  // Combine classes
  const badgeClasses = [
    styles.badge,
    styles[`type-${type}`],
    styles[`size-${size}`],
    animate && styles.animate,
    isNew && styles['is-new'],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={badgeClasses}
      style={getBadgeStyles()}
      aria-label={getAccessibleLabel()}
      role="status"
      {...props}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      
      {(type === 'xp' || type === 'level' || type === 'streak' || type === 'notification') && (
        <span className={styles.value}>{formatValue(value)}</span>
      )}
      
      {type === 'mastery' && (
        <span className={styles.value}>{masteryLevel}</span>
      )}
      
      {children}
    </div>
  );
};

export default Badge;