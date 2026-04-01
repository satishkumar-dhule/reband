import { useEffect, useRef, RefObject } from 'react';

/**
 * Hook that locks body scroll when a modal/dialog is open.
 * 
 * This prevents the background content from scrolling while the user
 * interacts with modal content.
 * 
 * @param lock - Whether to lock scroll
 * 
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   useScrollLock(isOpen);
 *   // ... modal content
 * }
 * ```
 */
export function useScrollLock(lock: boolean): void {
  const scrollPosition = useRef(0);

  useEffect(() => {
    if (!lock) {
      // Restore scroll position when unlocking
      if (scrollPosition.current > 0) {
        window.scrollTo(0, scrollPosition.current);
      }
      return;
    }

    // Store current scroll position
    scrollPosition.current = window.scrollY;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition.current}px`;
    document.body.style.width = '100%';

    // Cleanup: restore scroll when component unmounts or lock changes
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      
      // Restore scroll position
      if (scrollPosition.current > 0) {
        window.scrollTo(0, scrollPosition.current);
      }
    };
  }, [lock]);
}
