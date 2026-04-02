/**
 * Swipeable Card Component - Mobile-First
 * Pattern: WhatsApp, Gmail, Tinder
 * 
 * UI/UX Fixes Applied:
 * 1. Swipe gesture consistency - Natural drag with spring physics
 * 2. Visual feedback during swipe - Rotation, scale, threshold indicators
 * 3. Dark mode support - GitHub theme tokens, proper contrast
 * 4. Accessibility - Full keyboard support, aria-live announcements, focus management
 * 5. Animation smoothness - Spring transitions, reduced-motion support
 */

import { ReactNode, useRef, useState, useCallback, useEffect } from 'react';
import { motion, PanInfo, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Haptics } from '../../lib/haptics';
import { trackSwipeCard, trackHapticFeedback } from '../../lib/analytics';

interface SwipeAction {
  icon: ReactNode;
  label: string;
  color: string;
  onAction: () => void;
}

interface SwipeableCardProps {
  children: ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export function SwipeableCard({
  children,
  leftAction,
  rightAction,
  threshold = 100,
  className,
  disabled = false
}: SwipeableCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState('');
  
  // Motion values for smooth physics
  const x = useMotionValue(0);
  const isDraggingMotion = useMotionValue(0);
  
  // Spring physics for natural feel
  const springConfig = { stiffness: 300, damping: 30 };
  const springX = useSpring(x, springConfig);
  
  // FIX #1 & #2: Transform x position for visual feedback
  // Rotation based on swipe direction (natural tilt)
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  
  // Scale down slightly when dragging for depth effect
  const scale = useTransform(isDraggingMotion, [0, 1], [1, 0.98]);
  
  // Background opacity based on swipe distance
  const leftOpacity = useTransform(x, [0, threshold], [0, 1], { clamp: true });
  const rightOpacity = useTransform(x, [-threshold, 0], [1, 0], { clamp: true });
  
  // Threshold indicator - shows when threshold is reached
  const leftThresholdReached = useTransform(x, [threshold - 20, threshold], [0, 1], { clamp: true });
  const rightThresholdReached = useTransform(x, [-threshold, -threshold + 20], [1, 0], { clamp: true });

  // FIX #4: Keyboard accessibility
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;
    
    if (e.key === 'ArrowRight' && leftAction) {
      e.preventDefault();
      Haptics.medium();
      setAnnouncement(`${leftAction.label} triggered`);
      trackHapticFeedback('medium', 'swipe_card_right_keyboard');
      trackSwipeCard(window.location.pathname, 'right', leftAction.label, 0);
      leftAction.onAction();
    } else if (e.key === 'ArrowLeft' && rightAction) {
      e.preventDefault();
      Haptics.medium();
      setAnnouncement(`${rightAction.label} triggered`);
      trackHapticFeedback('medium', 'swipe_card_left_keyboard');
      trackSwipeCard(window.location.pathname, 'left', rightAction.label, 0);
      rightAction.onAction();
    } else if (e.key === 'Enter' || e.key === ' ') {
      // Allow focusing on card and pressing Enter to see instructions
      if (!containerRef.current?.contains(document.activeElement)) {
        containerRef.current?.focus();
      }
    }
  }, [leftAction, rightAction, disabled]);

  // FIX #1: Consistent swipe gesture handling
  const handleDragStart = useCallback(() => {
    isDraggingMotion.set(1);
  }, [isDraggingMotion]);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    isDraggingMotion.set(0);
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const page = window.location.pathname;
    
    // Swipe right (reveals left action)
    if (offset > threshold || velocity > 500) {
      if (leftAction) {
        Haptics.medium();
        trackHapticFeedback('medium', 'swipe_card_right');
        trackSwipeCard(page, 'right', leftAction.label, Math.abs(velocity));
        setAnnouncement(`${leftAction.label}`);
        leftAction.onAction();
      }
    }
    // Swipe left (reveals right action)
    else if (offset < -threshold || velocity < -500) {
      if (rightAction) {
        Haptics.medium();
        trackHapticFeedback('medium', 'swipe_card_left');
        trackSwipeCard(page, 'left', rightAction.label, Math.abs(velocity));
        setAnnouncement(`${rightAction.label}`);
        rightAction.onAction();
      }
    }
    
    // Reset position if no action triggered
    if ((offset > 0 && !leftAction) || (offset < 0 && !rightAction)) {
      x.set(0);
    }
  }, [threshold, leftAction, rightAction, x]);

  // FIX #5: Reduced motion support
  const prefersReducedMotion = typeof window !== 'undefined' 
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden rounded-lg" 
      role="group"
      aria-label="Swipeable card"
      data-component="SwipeableCard"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* FIX #4: Screen reader announcements */}
      <AnimatePresence>
        {announcement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sr-only"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {announcement}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIX #4: Keyboard instructions for screen readers */}
      <div className="sr-only">
        {leftAction && `Swipe right or press right arrow to ${leftAction.label}. `}
        {rightAction && `Swipe left or press left arrow to ${rightAction.label}.`}
      </div>

      {/* FIX #3: Dark mode support with GitHub theme tokens */}
      {/* Left action background */}
      {leftAction && (
        <motion.div
          style={{ opacity: leftOpacity }}
          className={cn(
            "absolute inset-0 flex items-center justify-start px-6",
            "bg-[var(--gh-success-emphasis)]",
            leftAction.color
          )}
          aria-hidden="true"
        >
          <motion.div
            style={{ scale: leftThresholdReached }}
            className={cn(
              "flex items-center gap-2 transition-transform",
              "text-[var(--gh-fg-on-emphasis)]"
            )}
          >
            {leftAction.icon}
            <span className="font-semibold">{leftAction.label}</span>
          </motion.div>
        </motion.div>
      )}
      
      {/* Right action background */}
      {rightAction && (
        <motion.div
          style={{ opacity: rightOpacity }}
          className={cn(
            "absolute inset-0 flex items-center justify-end px-6",
            "bg-[var(--gh-danger-emphasis)]",
            rightAction.color
          )}
          aria-hidden="true"
        >
          <motion.div
            style={{ scale: rightThresholdReached }}
            className={cn(
              "flex items-center gap-2 transition-transform",
              "text-[var(--gh-fg-on-emphasis)]"
            )}
          >
            <span className="font-semibold">{rightAction.label}</span>
            {rightAction.icon}
          </motion.div>
        </motion.div>
      )}
      
      {/* Card content */}
      <motion.div
        drag={prefersReducedMotion ? false : "x"}
        dragConstraints={prefersReducedMotion ? undefined : { left: -150, right: 150 }}
        dragElastic={prefersReducedMotion ? 0 : 0.3}
        dragMomentum={false}
        style={{ 
          x: prefersReducedMotion ? 0 : springX,
          rotate: prefersReducedMotion ? 0 : rotate,
          scale: prefersReducedMotion ? 1 : scale
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        // FIX #4: Focus styles using GitHub theme
        // touch-action: pan-y allows vertical scroll but prevents horizontal browser gestures
        className={cn(
          "relative bg-[var(--gh-canvas)] border border-[var(--gh-border)]",
          "hover:ring-2 hover:ring-[var(--gh-accent-fg)]/30",
          "focus-visible:ring-2 focus-visible:ring-[var(--gh-accent-fg)]",
          "focus-visible:outline-none",
          "transition-shadow duration-200",
          "cursor-grab active:cursor-grabbing",
          "touch-pan-y",
          className
        )}
        role="article"
        aria-label="Card content"
        tabIndex={0}
      >
        {children}
      </motion.div>

      {/* FIX #2: Visual threshold indicator dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
        {leftAction && (
          <motion.div
            style={{ 
              opacity: leftThresholdReached,
              backgroundColor: 'var(--gh-success-fg)'
            }}
            className="w-2 h-2 rounded-full"
          />
        )}
        {rightAction && (
          <motion.div
            style={{ 
              opacity: rightThresholdReached,
              backgroundColor: 'var(--gh-danger-fg)'
            }}
            className="w-2 h-2 rounded-full"
          />
        )}
      </div>
    </div>
  );
}
