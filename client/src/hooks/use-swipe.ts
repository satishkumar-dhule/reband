/**
 * Custom hook for swipe gesture detection
 * Reusable across mobile components
 */

import { useRef, useCallback, useState } from 'react';
import { LIMITS } from '../lib/constants';

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

interface SwipeCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeOptions {
  minDistance?: number;
  /** Only detect horizontal swipes, never prevent vertical scroll (default: true) */
  horizontalOnly?: boolean;
}

/**
 * Hook for detecting swipe gestures on touch devices
 * Smart scroll handling: only intercepts horizontal swipes, allows natural vertical scroll
 * 
 * @param callbacks - Object containing callback functions for each swipe direction
 * @param options - Configuration options
 * @returns Touch event handlers to spread on the target element
 * 
 * @example
 * ```tsx
 * const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
 *   onSwipeLeft: () => nextSlide(),
 *   onSwipeRight: () => prevSlide(),
 * });
 * 
 * return (
 *   <div
 *     onTouchStart={onTouchStart}
 *     onTouchMove={onTouchMove}
 *     onTouchEnd={onTouchEnd}
 *   >
 *     Content
 *   </div>
 * );
 * ```
 */
export function useSwipe(
  callbacks: SwipeCallbacks,
  options: SwipeOptions = {}
): SwipeHandlers {
  const {
    minDistance = LIMITS.MIN_SWIPE_DISTANCE,
    horizontalOnly = true,
  } = options;

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  // Track if we've determined swipe direction to prevent conflicting preventDefault calls
  const [swipeDirectionLocked, setSwipeDirectionLocked] = useState<'horizontal' | 'vertical' | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.targetTouches.length === 0) return;
    touchEndX.current = null;
    touchEndY.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    setSwipeDirectionLocked(null);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.targetTouches.length === 0) return;
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;

    // Smart scroll handling: only prevent default for horizontal swipes
    // This allows natural vertical scrolling while enabling horizontal swipe detection
    if (horizontalOnly && touchStartX.current !== null && touchEndX.current !== null && touchStartY.current !== null) {
      const distanceX = Math.abs(touchStartX.current - touchEndX.current);
      const distanceY = Math.abs(touchStartY.current - touchEndY.current);
      
      // Lock direction once we have a clear direction (prevents flickering)
      if (swipeDirectionLocked === null && Math.max(distanceX, distanceY) > 20) {
        setSwipeDirectionLocked(distanceX > distanceY ? 'horizontal' : 'vertical');
      }
      
      // Only prevent default for horizontal swipes
      if (swipeDirectionLocked === 'horizontal' || (swipeDirectionLocked === null && distanceX > distanceY)) {
        e.preventDefault();
      }
    }
  }, [horizontalOnly, swipeDirectionLocked]);

  const onTouchEnd = useCallback(() => {
    if (
      touchStartX.current === null ||
      touchStartY.current === null ||
      touchEndX.current === null ||
      touchEndY.current === null
    ) {
      setSwipeDirectionLocked(null);
      return;
    }

    const distanceX = touchStartX.current - touchEndX.current;
    const distanceY = touchStartY.current - touchEndY.current;
    const absDistanceX = Math.abs(distanceX);
    const absDistanceY = Math.abs(distanceY);

    // Determine if swipe is primarily horizontal or vertical
    const isHorizontal = absDistanceX > absDistanceY;

    if (isHorizontal && absDistanceX > minDistance) {
      if (distanceX > 0) {
        callbacks.onSwipeLeft?.();
      } else {
        callbacks.onSwipeRight?.();
      }
    } else if (!isHorizontal && absDistanceY > minDistance) {
      if (distanceY > 0) {
        callbacks.onSwipeUp?.();
      } else {
        callbacks.onSwipeDown?.();
      }
    }

    // Reset
    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    touchEndY.current = null;
    setSwipeDirectionLocked(null);
  }, [callbacks, minDistance]);

  return { onTouchStart, onTouchMove, onTouchEnd };
}

/**
 * Simplified hook for horizontal swipe only
 */
export function useHorizontalSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  minDistance?: number
): SwipeHandlers {
  return useSwipe(
    { onSwipeLeft, onSwipeRight },
    { minDistance }
  );
}

/**
 * Simplified hook for vertical swipe only
 */
export function useVerticalSwipe(
  onSwipeUp: () => void,
  onSwipeDown: () => void,
  minDistance?: number
): SwipeHandlers {
  return useSwipe(
    { onSwipeUp, onSwipeDown },
    { minDistance }
  );
}

export default useSwipe;
