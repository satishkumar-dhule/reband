/**
 * Skeleton Loader Component - Mobile-First
 * Pattern: Facebook, LinkedIn, Instagram
 * Uses GitHub theme colors for proper dark mode support
 * 
 * FIXES APPLIED:
 * 1. Skeleton animation smoothness - Custom shimmer with gradient overlay
 * 2. Dark mode support - Proper CSS variables for both light/dark
 * 3. Shape consistency - Consistent border-radius tokens
 * 4. Loading pattern variety - Multiple presets with staggered delays
 * 5. Accessibility - Full ARIA support with screen reader optimizations
 */

import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'wave' | 'none';
  /** Delay in ms for staggered animations (0-3) */
  delayIndex?: number;
}

/**
 * Base Skeleton Component
 * - Uses CSS custom properties for dark mode
 * - Provides smooth shimmer and pulse animations
 * - Accessible with proper ARIA attributes
 */
export function Skeleton({ 
  className, 
  variant = 'rectangular',
  animation = 'pulse',
  delayIndex = 0
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    rounded: 'rounded-md'
  };

  // Animation with staggered delays for natural loading effect
  const animationStyles: Record<string, string> = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  };

  // Add animation delay for wave to create staggered effect
  const getAnimationDelay = () => {
    if (animation === 'wave' && delayIndex > 0) {
      return { animationDelay: `${delayIndex * 150}ms` };
    }
    return {};
  };

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading content"
      className={cn(
        // Use neutral-muted for skeleton - works in both light/dark
        // Light mode: #8b949e (subtle gray)
        // Dark mode: #484f58 (visible but not distracting)
        'bg-[var(--gh-skeleton-bg,var(--gh-neutral-muted))] dark:bg-[var(--gh-skeleton-bg-dark,#30363d])]',
        variantClasses[variant],
        animationStyles[animation],
        className
      )}
      style={getAnimationDelay()}
    />
  );
}

// ============================================================================
// PRESET SKELETON COMPONENTS
// ============================================================================

/**
 * Skeleton Card - Mimics a content card with avatar and text
 * Perfect for list items, feed posts, notification items
 */
export function SkeletonCard() {
  return (
    <div 
      className="p-4 bg-card rounded-xl border border-border"
      role="status"
      aria-busy="true"
      aria-label="Loading card content"
    >
      <div className="flex items-start gap-4">
        <Skeleton 
          variant="circular" 
          className="w-12 h-12 flex-shrink-0" 
          animation="wave"
          delayIndex={0}
        />
        <div className="flex-1 space-y-3">
          <Skeleton 
            className="h-5 w-3/4" 
            animation="wave"
            delayIndex={1}
          />
          <Skeleton 
            className="h-4 w-full" 
            animation="wave"
            delayIndex={2}
          />
          <Skeleton 
            className="h-4 w-2/3" 
            animation="wave"
            delayIndex={3}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton List - For scrollable lists of items
 * Uses count prop for flexibility
 */
export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div 
      className="space-y-4"
      role="status"
      aria-busy="true"
      aria-label={`Loading ${count} list items`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton Text - For paragraph loading states
 * Progressive width reduction mimics real content
 */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div 
      className="space-y-3"
      role="status"
      aria-busy="true"
      aria-label="Loading text content"
    >
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          variant="text"
          animation={i === 0 ? 'wave' : 'pulse'}
          delayIndex={i}
          className={cn(
            "h-4",
            // Last line is typically shorter in real content
            i === lines - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton Avatar - Circular with staggered pulse
 * For profile sections, comment threads
 */
export function SkeletonAvatar({ 
  size = 'md',
  withText = false 
}: { 
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  };

  return (
    <div 
      role="status"
      aria-busy="true"
      aria-label="Loading user avatar"
      className="flex items-center gap-3"
    >
      <Skeleton 
        variant="circular" 
        className={sizeClasses[size]}
        animation="wave"
        delayIndex={0}
      />
      {withText && (
        <div className="space-y-2 flex-1">
          <Skeleton 
            className="h-4 w-24" 
            animation="wave"
            delayIndex={1}
          />
          <Skeleton 
            className="h-3 w-16" 
            animation="wave"
            delayIndex={2}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton Image - For media/card thumbnails
 * Maintains 16:9 or custom aspect ratio
 */
export function SkeletonImage({ 
  aspectRatio = '16/9' 
}: { 
  aspectRatio?: string;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading image"
      className="overflow-hidden rounded-lg"
      style={{ aspectRatio }}
    >
      <Skeleton 
        className="w-full h-full" 
        animation="wave"
      />
    </div>
  );
}

/**
 * Skeleton Button - For action loading states
 */
export function SkeletonButton({ 
  width = 'w-24' 
}: { 
  width?: string;
}) {
  return (
    <Skeleton 
      className={cn('h-10 rounded-lg', width)}
      animation="wave"
      delayIndex={0}
    />
  );
}

/**
 * Skeleton Form - For form field loading states
 */
export function SkeletonForm({ 
  fields = 3 
}: { 
  fields?: number;
}) {
  const fieldTypes = ['text', 'email', 'password', 'select', 'textarea'];
  
  return (
    <div 
      className="space-y-4"
      role="status"
      aria-busy="true"
      aria-label="Loading form fields"
    >
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton 
            className="h-4 w-24" 
            animation="wave"
            delayIndex={i}
          />
          <Skeleton 
            className="h-10 w-full rounded-md" 
            animation="wave"
            delayIndex={i + 1}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton Stats - For dashboard/stats cards
 */
export function SkeletonStats() {
  return (
    <div 
      className="grid grid-cols-2 gap-4"
      role="status"
      aria-busy="true"
      aria-label="Loading statistics"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div 
          key={i} 
          className="p-4 bg-card rounded-lg border border-border"
        >
          <Skeleton 
            className="h-8 w-16 mb-2" 
            animation="wave"
            delayIndex={i}
          />
          <Skeleton 
            className="h-3 w-20" 
            animation="wave"
            delayIndex={i + 2}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton Table Row - For table loading states
 */
export function SkeletonTableRow() {
  return (
    <div 
      className="flex items-center gap-4 p-3 border-b border-border"
      role="status"
      aria-busy="true"
      aria-label="Loading table row"
    >
      <Skeleton 
        variant="circular" 
        className="w-8 h-8" 
        animation="wave"
        delayIndex={0}
      />
      <Skeleton 
        className="h-4 flex-1" 
        animation="wave"
        delayIndex={1}
      />
      <Skeleton 
        className="h-4 w-20" 
        animation="wave"
        delayIndex={2}
      />
    </div>
  );
}

// ============================================================================
// MAIN SKELETON LOADER - Full page loading state
// ============================================================================

/**
 * Full Page Skeleton Loader
 * Comprehensive loading state for initial page loads
 */
export function SkeletonLoader() {
  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-background p-4"
      role="status"
      aria-busy="true"
      aria-label="Loading page content"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        {/* Profile Section */}
        <div className="flex flex-col items-center gap-3">
          <Skeleton 
            variant="circular" 
            className="w-20 h-20" 
            animation="wave"
            delayIndex={0}
          />
          <Skeleton 
            className="h-5 w-32" 
            animation="wave"
            delayIndex={1}
          />
          <Skeleton 
            className="h-4 w-24" 
            animation="wave"
            delayIndex={2}
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 w-full">
          {Array.from({ length: 3 }).map((_, i) => (
            <div 
              key={i} 
              className="flex flex-col items-center p-3 bg-card rounded-lg border border-border"
            >
              <Skeleton 
                className="h-6 w-8 mb-1" 
                animation="wave"
                delayIndex={i + 3}
              />
              <Skeleton 
                className="h-3 w-12" 
                animation="wave"
                delayIndex={i + 6}
              />
            </div>
          ))}
        </div>

        {/* Content Section */}
        <div className="w-full space-y-4">
          <Skeleton 
            className="h-32 w-full rounded-lg" 
            animation="wave"
            delayIndex={9}
          />
          
          <div className="space-y-2">
            <Skeleton 
              className="h-4 w-full" 
              animation="wave"
              delayIndex={10}
            />
            <Skeleton 
              className="h-4 w-3/4" 
              animation="wave"
              delayIndex={11}
            />
            <Skeleton 
              className="h-4 w-1/2" 
              animation="wave"
              delayIndex={12}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full">
          <Skeleton className="h-10 flex-1 rounded-lg" animation="wave" delayIndex={13} />
          <Skeleton className="h-10 flex-1 rounded-lg" animation="wave" delayIndex={14} />
        </div>

        {/* Screen reader announcement */}
        <span className="sr-only">
          Loading content, please wait...
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// SKELETON GROUP - For complex layouts with multiple skeleton elements
// ============================================================================

/**
 * SkeletonGroup - Wraps multiple skeletons for compound loading states
 * Provides consistent spacing and accessibility
 */
export function SkeletonGroup({
  children,
  className,
  label = "Loading content"
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div 
      role="status"
      aria-busy="true"
      aria-label={label}
      className={cn("space-y-4", className)}
    >
      {children}
      {/* Visual indicator for screen readers */}
      <span className="sr-only">
        {label}, please wait
      </span>
    </div>
  );
}

export default Skeleton;
