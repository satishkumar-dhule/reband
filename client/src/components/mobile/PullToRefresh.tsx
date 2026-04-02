/**
 * Pull to Refresh Component - Mobile-First
 * Pattern: Instagram Feed, Twitter Timeline
 * 
 * Accessibility Features:
 * - Includes a visible refresh button for keyboard users
 * - Button appears at the top of the content area
 * - aria-live region announces refresh state to screen readers
 * - Respects prefers-reduced-motion for animations
 * 
 * Dark Mode: Uses GitHub Design System tokens for both light/dark
 */

import { ReactNode, useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate, useSpring, useReducedMotion, MotionValue } from 'framer-motion';
import { RefreshCw, ArrowUp } from 'lucide-react';
import { Haptics } from '../../lib/haptics';
import { trackPullToRefresh, trackHapticFeedback } from '../../lib/analytics';

// Progress circle component with animated stroke
function CircleProgress({ 
  progress, 
  color 
}: { 
  progress: MotionValue<number>; 
  color: string;
}) {
  const strokeDashoffset = useTransform(progress, [0, 1], [100.53, 0]);
  
  return (
    <motion.circle
      cx="20"
      cy="20"
      r="16"
      fill="none"
      strokeWidth="3"
      strokeLinecap="round"
      style={{ 
        stroke: color,
        strokeDasharray: '100.53',
        strokeDashoffset,
      }}
    />
  );
}

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
  disabled?: boolean;
}

export function PullToRefresh({ 
  onRefresh, 
  children, 
  threshold = 80,
  disabled = false 
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const pullDistance = useMotionValue(0);
  
  // Check for reduced motion preference
  const prefersReducedMotion = useReducedMotion();
  
  // Transform pull distance to various visual properties
  const rotation = useTransform(pullDistance, [0, threshold], [0, 360]);
  const opacity = useTransform(pullDistance, [0, threshold * 0.3], [0, 1]);
  const scale = useTransform(pullDistance, [0, threshold], [0.6, 1]);
  
  // Progress indicator (0-1)
  const progress = useTransform(pullDistance, [0, threshold], [0, 1]);
  const springProgress = useSpring(progress, {
    stiffness: 300,
    damping: 30,
  });
  
  // Determine if threshold has been reached (for "release" indicator)
  const isThresholdReached = useTransform(pullDistance, [0, threshold], [false, true]);

  const isAtTop = useCallback(() => {
    return window.scrollY === 0 || (containerRef.current?.scrollTop ?? 0) === 0;
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    if (isAtTop()) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
      setHasTriggered(false);
    }
  }, [disabled, isRefreshing, isAtTop]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    
    if (currentY <= startY.current) {
      return;
    }
    
    const distance = Math.max(0, currentY - startY.current);
    
    // Apply resistance curve for natural feel
    const resistedDistance = Math.pow(distance, 0.7);
    const clampedDistance = Math.min(resistedDistance, threshold * 1.5);
    
    // Use spring for smooth animation if reduced motion is preferred
    if (prefersReducedMotion) {
      pullDistance.set(clampedDistance);
    } else {
      pullDistance.set(clampedDistance);
    }
    
    // Trigger haptic feedback when threshold is reached
    if (resistedDistance >= threshold && !hasTriggered) {
      Haptics.impact();
      trackHapticFeedback('impact', 'pull_to_refresh_threshold');
      setHasTriggered(true);
    }
    
    if (distance > 10 && isAtTop()) {
      e.preventDefault();
    }
  }, [isPulling, disabled, isRefreshing, threshold, hasTriggered, prefersReducedMotion, pullDistance, isAtTop]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return;
    
    setIsPulling(false);
    const distance = pullDistance.get();
    const startTime = Date.now();
    
    if (distance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setAnnouncement('Refreshing content');
      
      // Animate to threshold position with spring physics
      await animate(pullDistance, threshold, {
        type: prefersReducedMotion ? 'tween' : 'spring',
        stiffness: prefersReducedMotion ? 0 : 300,
        damping: prefersReducedMotion ? 0 : 30,
      });
      
      try {
        await onRefresh();
        const duration = Date.now() - startTime;
        Haptics.success();
        trackHapticFeedback('success', 'pull_to_refresh');
        
        const page = window.location.pathname;
        trackPullToRefresh(page, duration, true);
        
        setAnnouncement('Content refreshed successfully');
      } catch (error) {
        const duration = Date.now() - startTime;
        Haptics.error();
        trackHapticFeedback('error', 'pull_to_refresh');
        
        const page = window.location.pathname;
        trackPullToRefresh(page, duration, false);
        
        setAnnouncement('Failed to refresh content');
      } finally {
        // Animate back to 0
        await animate(pullDistance, 0, {
          type: prefersReducedMotion ? 'tween' : 'spring',
          stiffness: prefersReducedMotion ? 0 : 300,
          damping: prefersReducedMotion ? 0 : 30,
        });
        
        setIsRefreshing(false);
        setTimeout(() => setAnnouncement(''), 1000);
      }
    } else {
      // Snap back
      await animate(pullDistance, 0, {
        type: prefersReducedMotion ? 'tween' : 'spring',
        stiffness: prefersReducedMotion ? 0 : 300,
        damping: prefersReducedMotion ? 0 : 30,
      });
    }
    
    startY.current = 0;
    setHasTriggered(false);
  }, [isPulling, disabled, threshold, isRefreshing, onRefresh, prefersReducedMotion, pullDistance]);

  const handleRefreshClick = useCallback(async () => {
    if (disabled || isRefreshing) return;
    
    setIsRefreshing(true);
    setAnnouncement('Refreshing content');
    const startTime = Date.now();
    
    try {
      await onRefresh();
      const duration = Date.now() - startTime;
      Haptics.success();
      trackHapticFeedback('success', 'keyboard_refresh');
      
      const page = window.location.pathname;
      trackPullToRefresh(page, duration, true);
      
      setAnnouncement('Content refreshed successfully');
    } catch (error) {
      const duration = Date.now() - startTime;
      Haptics.error();
      trackHapticFeedback('error', 'keyboard_refresh');
      
      const page = window.location.pathname;
      trackPullToRefresh(page, duration, false);
      
      setAnnouncement('Failed to refresh content');
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setAnnouncement(''), 1000);
    }
  }, [disabled, isRefreshing, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div 
      ref={containerRef} 
      className="relative h-full overflow-auto"
      data-component="PullToRefresh"
    >
      {/* Screen reader announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
      
      {/* Keyboard-accessible refresh button */}
      <div 
        className="sticky top-0 z-[1100] flex justify-center py-2"
        style={{ 
          backgroundColor: 'var(--gh-canvas-overlay, #fff)',
        }}
      >
        <button
          onClick={handleRefreshClick}
          disabled={disabled || isRefreshing}
          className="flex items-center gap-2 px-5 py-3 min-h-[44px] text-sm font-medium rounded-full transition-all duration-200"
          style={{ 
            backgroundColor: 'var(--gh-canvas-subtle, #f6f8fa)',
            color: 'var(--gh-fg, #1f2328)',
            border: '1px solid var(--gh-border, #d0d7de)',
          }}
          aria-label="Refresh content"
          aria-busy={isRefreshing}
        >
          <RefreshCw 
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          <span>{isRefreshing ? 'Refreshing…' : 'Refresh'}</span>
        </button>
      </div>
      
      {/* Pull indicator with progress ring */}
      <motion.div
        style={{ 
          y: pullDistance,
          opacity,
          scale,
          willChange: 'transform, opacity',
        }}
        className="absolute top-0 left-0 right-0 flex justify-center items-center h-20 -mt-20 z-10 pointer-events-none"
        aria-hidden="true"
      >
        <div className="relative flex items-center justify-center">
          {/* Progress ring background */}
          <svg 
            className="absolute w-10 h-10 -rotate-90"
            viewBox="0 0 40 40"
            aria-hidden="true"
          >
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              strokeWidth="3"
              style={{ 
                stroke: 'var(--gh-border, #d0d7de)',
              }}
            />
          </svg>
          
          {/* Progress ring fill */}
          <motion.svg 
            className="absolute w-10 h-10 -rotate-90"
            viewBox="0 0 40 40"
            aria-hidden="true"
          >
            {/* Background circle */}
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              strokeWidth="3"
              style={{ 
                stroke: 'var(--gh-border, #d0d7de)',
              }}
            />
            {/* Progress circle - using CSS variable for progress */}
            <CircleProgress 
              progress={springProgress} 
              color="var(--gh-accent-emphasis, #0969da)" 
            />
          </motion.svg>
          
          {/* Spinner/Arrow icon */}
          <motion.div
            style={{ rotate: isRefreshing ? undefined : rotation }}
            className="relative z-10"
          >
            {isRefreshing ? (
              <RefreshCw 
                className="w-6 h-6"
                style={{ color: 'var(--gh-accent-emphasis, #0969da)' }}
              />
            ) : (
              <motion.div
                animate={{ 
                  rotateY: hasTriggered ? 180 : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                <ArrowUp 
                  className="w-6 h-6"
                  style={{ 
                    color: hasTriggered 
                      ? 'var(--gh-success-emphasis, #1f883d)' 
                      : 'var(--gh-fg-muted, #636c76)',
                  }}
                />
              </motion.div>
            )}
          </motion.div>
        </div>
        
        {/* Release text indicator */}
        <motion.span
          className="ml-3 text-sm font-medium"
          style={{ 
            color: hasTriggered 
              ? 'var(--gh-success-emphasis, #1f883d)' 
              : 'var(--gh-fg-muted, #636c76)',
          }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ 
            opacity: pullDistance.get() > threshold * 0.5 ? 1 : 0,
            x: pullDistance.get() > threshold * 0.5 ? 0 : -10,
          }}
        >
          {hasTriggered ? 'Release to refresh' : 'Pull to refresh'}
        </motion.span>
      </motion.div>
      
      {/* Content */}
      <motion.div 
        style={{ 
          y: pullDistance,
          willChange: 'transform',
        }}
      >
        {children}
      </motion.div>
      
      {/* Reduced motion styles via CSS */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .PullToRefresh-spinner {
            animation: none !important;
          }
          .PullToRefresh-indicator {
            transition: none !important;
          }
        }
        
        /* Dark mode styles */
        @media (prefers-color-scheme: dark) {
          .PullToRefresh-button {
            background-color: var(--gh-canvas-overlay, #161b22) !important;
            color: var(--gh-fg, #e6edf3) !important;
            border-color: var(--gh-border, #30363d) !important;
          }
          .PullToRefresh-progress-bg {
            stroke: var(--gh-border, #30363d) !important;
          }
          .PullToRefresh-progress-fill {
            stroke: var(--gh-accent-fg, #58a6ff) !important;
          }
        }
        
        .dark .PullToRefresh-button {
          background-color: var(--gh-canvas-overlay, #161b22) !important;
          color: var(--gh-fg, #e6edf3) !important;
          border-color: var(--gh-border, #30363d) !important;
        }
        .dark .PullToRefresh-progress-bg {
          stroke: var(--gh-border, #30363d) !important;
        }
        .dark .PullToRefresh-progress-fill {
          stroke: var(--gh-accent-fg, #58a6ff) !important;
        }
      `}</style>
    </div>
  );
}
