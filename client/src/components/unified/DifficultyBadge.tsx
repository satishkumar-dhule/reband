/**
 * Unified Difficulty Badge Component
 * 
 * Consistent difficulty level display across the entire application
 * Replaces 15+ duplicate implementations
 * 
 * Used in: TestSession, CertificationExam, VoiceInterview, ReviewSession,
 * CertificationPractice, VoiceSession, TrainingMode, QuestionPanel, and more
 */

import { Zap, Target, Flame } from 'lucide-react';
import { memo } from 'react';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type DifficultyBadgeSize = 'xs' | 'sm' | 'md' | 'lg';
export type DifficultyBadgeVariant = 'solid' | 'soft' | 'outline' | 'minimal';

interface DifficultyBadgeProps {
  level: DifficultyLevel;
  size?: DifficultyBadgeSize;
  variant?: DifficultyBadgeVariant;
  showIcon?: boolean;
  showLabel?: boolean;
  uppercase?: boolean;
  className?: string;
}

const levelConfig = {
  beginner: {
    label: 'Beginner',
    icon: Zap,
    // Uses GitHub design system tokens: --gh-diff-beginner / --gh-diff-beginner-bg
    colors: {
      solid: 'bg-[var(--gh-diff-beginner)] text-white',
      soft: 'bg-[var(--gh-diff-beginner-bg)] text-[var(--gh-diff-beginner)]',
      outline: 'border-[var(--gh-diff-beginner)]/30 text-[var(--gh-diff-beginner)]',
      minimal: 'text-[var(--gh-diff-beginner)]'
    }
  },
  intermediate: {
    label: 'Intermediate',
    icon: Target,
    // Uses GitHub design system tokens: --gh-diff-intermediate / --gh-diff-intermediate-bg
    colors: {
      solid: 'bg-[var(--gh-diff-intermediate)] text-white',
      soft: 'bg-[var(--gh-diff-intermediate-bg)] text-[var(--gh-diff-intermediate)]',
      outline: 'border-[var(--gh-diff-intermediate)]/30 text-[var(--gh-diff-intermediate)]',
      minimal: 'text-[var(--gh-diff-intermediate)]'
    }
  },
  advanced: {
    label: 'Advanced',
    icon: Flame,
    // Uses GitHub design system tokens: --gh-diff-advanced / --gh-diff-advanced-bg
    colors: {
      solid: 'bg-[var(--gh-diff-advanced)] text-white',
      soft: 'bg-[var(--gh-diff-advanced-bg)] text-[var(--gh-diff-advanced)]',
      outline: 'border-[var(--gh-diff-advanced)]/30 text-[var(--gh-diff-advanced)]',
      minimal: 'text-[var(--gh-diff-advanced)]'
    }
  }
};

const sizeClasses = {
  xs: {
    text: 'text-[9px]',
    padding: 'px-1.5 py-0.5',
    icon: 'w-2.5 h-2.5'
  },
  sm: {
    text: 'text-[10px]',
    padding: 'px-2 py-0.5',
    icon: 'w-3 h-3'
  },
  md: {
    text: 'text-xs',
    padding: 'px-2 py-1',
    icon: 'w-3.5 h-3.5'
  },
  lg: {
    text: 'text-sm',
    padding: 'px-3 py-1.5',
    icon: 'w-4 h-4'
  }
};

export const DifficultyBadge = memo(function DifficultyBadge({
  level,
  size = 'md',
  variant = 'soft',
  showIcon = false,
  showLabel = true,
  uppercase = false,
  className = ''
}: DifficultyBadgeProps) {
  const config = levelConfig[level];
  const sizeConfig = sizeClasses[size];
  const Icon = config.icon;
  
  const colorClass = config.colors[variant];
  const borderClass = variant === 'outline' ? 'border' : '';
  const label = uppercase ? config.label.toUpperCase() : config.label;

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded font-medium
        ${sizeConfig.text} ${sizeConfig.padding}
        ${colorClass} ${borderClass}
        ${className}
      `}
    >
      {showIcon && <Icon className={sizeConfig.icon} />}
      {showLabel && label}
    </span>
  );
});

/**
 * Difficulty Indicator - Minimal dot indicator
 */
interface DifficultyIndicatorProps {
  level: DifficultyLevel;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DifficultyIndicator({
  level,
  size = 'md',
  className = ''
}: DifficultyIndicatorProps) {
  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  };

  // Uses GitHub design system tokens
  const colors = {
    beginner: 'bg-[var(--gh-diff-beginner)]',
    intermediate: 'bg-[var(--gh-diff-intermediate)]',
    advanced: 'bg-[var(--gh-diff-advanced)]'
  };

  return (
    <span
      className={`inline-block rounded-full ${dotSizes[size]} ${colors[level]} ${className}`}
      title={levelConfig[level].label}
    />
  );
}

/**
 * Difficulty Progress - Shows difficulty distribution
 */
interface DifficultyProgressProps {
  stats: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  total: number;
  size?: 'sm' | 'md';
  showLabels?: boolean;
  className?: string;
}

export function DifficultyProgress({
  stats,
  total,
  size = 'md',
  showLabels = true,
  className = ''
}: DifficultyProgressProps) {
  const beginnerPct = total > 0 ? (stats.beginner / total) * 100 : 0;
  const intermediatePct = total > 0 ? (stats.intermediate / total) * 100 : 0;
  const advancedPct = total > 0 ? (stats.advanced / total) * 100 : 0;

  const heightClass = size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className={className}>
      {showLabels && (
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Difficulty Distribution</span>
          <span>{total} total</span>
        </div>
      )}
      
      <div className={`flex ${heightClass} rounded-full overflow-hidden bg-muted`}>
        {beginnerPct > 0 && (
          <div
            className="bg-[var(--gh-diff-beginner)]"
            style={{ width: `${beginnerPct}%` }}
            title={`${stats.beginner} Beginner (${Math.round(beginnerPct)}%)`}
          />
        )}
        {intermediatePct > 0 && (
          <div
            className="bg-[var(--gh-diff-intermediate)]"
            style={{ width: `${intermediatePct}%` }}
            title={`${stats.intermediate} Intermediate (${Math.round(intermediatePct)}%)`}
          />
        )}
        {advancedPct > 0 && (
          <div
            className="bg-[var(--gh-diff-advanced)]"
            style={{ width: `${advancedPct}%` }}
            title={`${stats.advanced} Advanced (${Math.round(advancedPct)}%)`}
          />
        )}
      </div>

      {showLabels && (
        <div className="flex items-center gap-3 mt-2 text-xs">
          <div className="flex items-center gap-1">
            <DifficultyIndicator level="beginner" size="sm" />
            <span className="text-muted-foreground">{stats.beginner}</span>
          </div>
          <div className="flex items-center gap-1">
            <DifficultyIndicator level="intermediate" size="sm" />
            <span className="text-muted-foreground">{stats.intermediate}</span>
          </div>
          <div className="flex items-center gap-1">
            <DifficultyIndicator level="advanced" size="sm" />
            <span className="text-muted-foreground">{stats.advanced}</span>
          </div>
        </div>
      )}
    </div>
  );
}
