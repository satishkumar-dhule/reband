/**
 * Performance Hooks
 * 
 * React hooks for optimizing rendering performance:
 * - useDeferredValue for deferring non-critical UI updates
 * - useRenderCount for debugging re-renders
 * - useStableCallback for stable function references
 */

import { useRef, useCallback, useEffect, useState } from 'react';

/**
 * Hook that returns a stable reference to a callback function.
 * Unlike useCallback, this doesn't need a dependency array.
 * The callback always has access to the latest closure values.
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  });
  
  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []) as T;
}

/**
 * Hook to track render count for debugging.
 * Returns the number of times the component has rendered.
 */
export function useRenderCount(): number {
  const countRef = useRef(0);
  countRef.current += 1;
  return countRef.current;
}

/**
 * Hook to track which props/state cause re-renders.
 * Logs to console when values change between renders.
 */
export function useRenderTracker(values: Record<string, any>, label: string = 'Component') {
  const prevValuesRef = useRef<Record<string, any>>({});
  
  useEffect(() => {
    const changed = Object.keys(values).filter(
      key => prevValuesRef.current[key] !== values[key]
    );
    
    if (changed.length > 0) {
      // Only log in development
      if (import.meta.env.DEV) {
        console.debug(`[${label}] Re-render triggered by:`, changed.join(', '));
      }
    }
    
    prevValuesRef.current = { ...values };
  });
}

/**
 * Hook for debounced state updates.
 * Useful for search inputs, resize handlers, etc.
 */
export function useDebouncedState<T>(initialValue: T, delay: number = 300) {
  const [immediateValue, setImmediateValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(immediateValue);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [immediateValue, delay]);
  
  return [immediateValue, setImmediateValue, debouncedValue] as const;
}

/**
 * Hook that returns true only after the component has mounted.
 * Useful for avoiding hydration mismatches and deferring heavy work.
 */
export function useIsMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  return isMounted;
}

/**
 * Hook that defers a computation until after the initial paint.
 * Useful for expensive calculations that aren't needed immediately.
 */
export function useDeferredComputation<T>(compute: () => T, deps: any[] = []): T | undefined {
  const [result, setResult] = useState<T>();
  
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setResult(compute());
    });
    
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  
  return result;
}
