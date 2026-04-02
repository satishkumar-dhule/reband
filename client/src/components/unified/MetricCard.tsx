/**
 * Unified MetricCard Component
 * 
 * Consistent metric/stat display across the entire application
 * Replaces 20+ duplicate implementations
 * 
 * Used in: Profile, BotActivity, StatsRedesigned, Badges, MobileHomeFocused,
 * MobileChannels, AllChannelsRedesigned, CertificationExam, and more
 */

import { ReactNode, memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '../mobile/SkeletonLoader';

export type MetricCardVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
export type MetricCardSize = 'sm' | 'md' | 'lg';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: number;
  trendLabel?: string;
  variant?: MetricCardVariant;
  size?: MetricCardSize;
  description?: string;
  animated?: boolean;
  isLoading?: boolean;
  className?: string;
  onClick?: () => void;
}

const variantClasses: Record<MetricCardVariant, { bg: string; text: string; iconBg: string }> = {
  default: {
    bg: 'bg-card border border-border',
    text: 'text-foreground',
    iconBg: 'bg-gh-accent-subtle'
  },
  success: {
    bg: 'bg-[var(--gh-success-fg)]/5 border-[var(--gh-success-fg)]/20',
    text: 'text-[var(--gh-success-fg)]',
    iconBg: 'bg-[var(--gh-success-fg)]/10'
  },
  warning: {
    bg: 'bg-[var(--gh-attention-fg)]/5 border-[var(--gh-attention-fg)]/20',
    text: 'text-[var(--gh-attention-fg)]',
    iconBg: 'bg-[var(--gh-attention-fg)]/10'
  },
  danger: {
    bg: 'bg-[var(--gh-danger-fg)]/5 border-[var(--gh-danger-fg)]/20',
    text: 'text-[var(--gh-danger-fg)]',
    iconBg: 'bg-[var(--gh-danger-fg)]/10'
  },
  info: {
    bg: 'bg-[var(--gh-accent-fg)]/5 border-[var(--gh-accent-fg)]/20',
    text: 'text-[var(--gh-accent-fg)]',
    iconBg: 'bg-[var(--gh-accent-fg)]/10'
  }
};

const sizeClasses: Record<MetricCardSize, { padding: string; value: string; label: string; icon: string }> = {
  sm: {
    padding: 'p-2',
    value: 'text-xl',
    label: 'text-xs',
    icon: 'w-8 h-8'
  },
  md: {
    padding: 'p-3',
    value: 'text-2xl',
    label: 'text-sm',
    icon: 'w-10 h-10'
  },
  lg: {
    padding: 'p-4',
    value: 'text-3xl',
    label: 'text-base',
    icon: 'w-12 h-12'
  }
};

export const MetricCard = memo(function MetricCard({
  label,
  value,
  icon,
  trend,
  trendLabel,
  variant = 'default',
  size = 'md',
  description,
  animated = true,
  isLoading = false,
  className = '',
  onClick
}: MetricCardProps) {
  const variantConfig = variantClasses[variant];
  const sizeConfig = sizeClasses[size];

  // Loading state - render skeleton content
  if (isLoading) {
    const loadingContent = (
      <div 
        className={`
          ${variantConfig.bg} rounded-xl border ${sizeConfig.padding}
          ${className}
        `}
        role="status"
        aria-busy="true"
        aria-label="Loading metric"
      >
        {/* Icon placeholder */}
        <Skeleton variant="rectangular" className={`${sizeConfig.icon} mb-3`} />
        
        {/* Value placeholder */}
        <Skeleton className={`${sizeConfig.value} w-16 mb-1`} />
        
        {/* Label placeholder */}
        <Skeleton className={`${sizeConfig.label} w-20`} />
        
        {/* Description placeholder */}
        {description && (
          <Skeleton className="text-xs w-24 mt-2" />
        )}
      </div>
    );

    if (animated) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {loadingContent}
        </motion.div>
      );
    }

    return loadingContent;
  }

  const content = (
    <div 
      className={`
        ${variantConfig.bg} rounded-md ${sizeConfig.padding}
        ${onClick ? 'cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2' : ''}
        ${className}
      `}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
    >
      {/* Icon */}
      {icon && (
        <div className={`${sizeConfig.icon} rounded-lg ${variantConfig.iconBg} flex items-center justify-center mb-3`}>
          <span className={variantConfig.text}>{icon}</span>
        </div>
      )}

      {/* Value */}
      <div className={`${sizeConfig.value} font-bold ${variantConfig.text}`}>
        {value}
      </div>

      {/* Label */}
      <div className={`${sizeConfig.label} text-muted-foreground mt-1`}>
        {label}
      </div>

      {/* Description */}
      {description && (
        <div className="text-xs text-muted-foreground/70 mt-1">
          {description}
        </div>
      )}

      {/* Trend */}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${
          trend >= 0 ? 'text-[var(--gh-success-fg)]' : 'text-[var(--gh-danger-fg)]'
        }`}>
          {trend >= 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span className="font-medium">
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
          {trendLabel && (
            <span className="text-muted-foreground ml-1">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
});

/**
 * Compact Metric Card - Horizontal layout for dense displays
 */
interface CompactMetricCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  variant?: MetricCardVariant;
  className?: string;
  onClick?: () => void;
}

export const CompactMetricCard = memo(function CompactMetricCard({
  label,
  value,
  icon,
  variant = 'default',
  className = '',
  onClick
}: CompactMetricCardProps) {
  const variantConfig = variantClasses[variant];

  return (
    <div 
      className={`
        ${variantConfig.bg} rounded-md p-2
        flex items-center gap-3
        ${onClick ? 'cursor-pointer hover:border-primary/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2' : ''}
        ${className}
      `}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
    >
      {icon && (
        <div className={`w-8 h-8 rounded-md ${variantConfig.iconBg} flex items-center justify-center flex-shrink-0`}>
          <span className={variantConfig.text}>{icon}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`text-lg font-bold ${variantConfig.text}`}>{value}</div>
      </div>
    </div>
  );
});

/**
 * Metric Grid - Layout helper for multiple metrics
 */
interface MetricGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function MetricGrid({
  children,
  columns = 3,
  className = ''
}: MetricGridProps) {
  const gridClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
}
