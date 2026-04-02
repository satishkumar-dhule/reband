/**
 * React Performance Monitoring Hooks
 * 
 * Custom React hooks for tracking component render performance,
 * route transitions, data fetching, and user interactions.
 * 
 * These hooks integrate with the perf-telemetry module to provide
 * real-time performance monitoring in the DevPrep SPA.
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  markPerformance,
  measureBetween,
  recordRouteTransition,
  capturePerformanceSnapshot,
  collectWebVitals,
  rateWebVitals,
  getMemoryUsage,
  collectResourceTiming,
} from './perf-telemetry';

// Minimal inline tracker since perf-telemetry doesn't export trackDataFetch
function trackDataFetch(_url: string) {
  let startTime: number;
  return {
    start() { startTime = performance.now(); },
    end() { return performance.now() - (startTime ?? 0); },
  };
}

// ============================================================
// Hook: usePerformanceMark
// ============================================================

/**
 * Creates a performance mark when a component mounts.
 * Useful for tracking component initialization time.
 * 
 * @param markName - Name for the performance mark
 * @param detail - Optional metadata to attach to the mark
 */
export function usePerformanceMark(markName: string, detail?: Record<string, unknown>): void {
  useEffect(() => {
    markPerformance(markName, detail);
  }, [markName, JSON.stringify(detail || {})]);
}

// ============================================================
// Hook: useRenderTimer
// ============================================================

/**
 * Measures component render time and logs if it exceeds threshold.
 * 
 * @param threshold - Max acceptable render time in ms (default: 16ms = 1 frame)
 * @returns Object with render count and average render time
 */
export function useRenderTimer(threshold = 16): {
  renderCount: number;
  lastRenderTime: number;
  avgRenderTime: number;
  exceededThreshold: boolean;
} {
  const renderTimes = useRef<number[]>([]);
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    startTime.current = performance.now();
  });

  useEffect(() => {
    const renderTime = performance.now() - startTime.current;
    renderTimes.current.push(renderTime);
    renderCount.current++;

    // Keep only last 100 renders
    if (renderTimes.current.length > 100) {
      renderTimes.current = renderTimes.current.slice(-100);
    }

    if (renderTime > threshold) {
      markPerformance(`render:slow`, {
        component: 'unknown',
        duration: renderTime,
        threshold,
      });
    }
  });

  const avgRenderTime = renderTimes.current.length > 0
    ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length
    : 0;

  return {
    renderCount: renderCount.current,
    lastRenderTime: renderTimes.current[renderTimes.current.length - 1] || 0,
    avgRenderTime,
    exceededThreshold: (renderTimes.current[renderTimes.current.length - 1] || 0) > threshold,
  };
}

// ============================================================
// Hook: useRoutePerformance
// ============================================================

/**
 * Tracks SPA route transition performance.
 * Automatically records timing when the route changes.
 * 
 * @param route - Current route path
 * @returns Object with transition timing data
 */
export function useRoutePerformance(route: string): {
  transitionTime: number | null;
  fromRoute: string | null;
} {
  const previousRoute = useRef<string | null>(null);
  const transitionStart = useRef<number>(0);
  const [transitionTime, setTransitionTime] = useState<number | null>(null);
  const [fromRoute, setFromRoute] = useState<string | null>(null);

  useEffect(() => {
    if (previousRoute.current && previousRoute.current !== route) {
      const endTime = performance.now();
      const duration = endTime - transitionStart.current;

      recordRouteTransition(previousRoute.current, route, transitionStart.current, endTime, 'navigate');
      setTransitionTime(duration);
      setFromRoute(previousRoute.current);

      markPerformance(`route:complete:${route}`, {
        from: previousRoute.current,
        duration,
      });
      measureBetween(`route:start:${route}`, `route:complete:${route}`, `route:${previousRoute.current}→${route}`);
    }

    // Mark route start
    transitionStart.current = performance.now();
    markPerformance(`route:start:${route}`, { from: previousRoute.current });
    previousRoute.current = route;
  }, [route]);

  return { transitionTime, fromRoute };
}

// ============================================================
// Hook: useFetchPerformance
// ============================================================

/**
 * Wraps fetch calls with performance tracking.
 * Returns a wrapped fetch function that records timing.
 * 
 * @param label - Label for the fetch operation
 * @returns Wrapped fetch function and timing info
 */
export function useFetchPerformance(label: string): {
  fetch: <T>(url: string, init?: RequestInit) => Promise<T>;
  lastDuration: number | null;
  totalFetches: number;
  averageDuration: number;
} {
  const durations = useRef<number[]>([]);
  const [lastDuration, setLastDuration] = useState<number | null>(null);

  const wrappedFetch = useCallback(async <T>(url: string, init?: RequestInit): Promise<T> => {
    const tracker = trackDataFetch(url);
    tracker.start();

    try {
      const response = await fetch(url, init);
      const data = await response.json() as T;
      const duration = tracker.end();

      if (duration !== null) {
        durations.current.push(duration);
        setLastDuration(duration);

        if (duration > 1000) {
          markPerformance(`fetch:slow:${label}`, { url, duration });
        }
      }

      return data;
    } catch (error) {
      tracker.end();
      throw error;
    }
  }, [label]);

  const totalFetches = durations.current.length;
  const averageDuration = totalFetches > 0
    ? durations.current.reduce((a, b) => a + b, 0) / totalFetches
    : 0;

  return {
    fetch: wrappedFetch,
    lastDuration,
    totalFetches,
    averageDuration,
  };
}

// ============================================================
// Hook: useWebVitalsMonitor
// ============================================================

/**
 * Monitors Web Vitals and triggers callbacks when thresholds are exceeded.
 * 
 * @param options - Configuration for monitoring
 * @returns Current Web Vitals scores
 */
export function useWebVitalsMonitor(options?: {
  onLcpSlow?: (value: number) => void;
  onClsHigh?: (value: number) => void;
  onInpSlow?: (value: number) => void;
  checkInterval?: number;
}): {
  lcp: number | null;
  fcp: number | null;
  cls: number | null;
  inp: number | null;
  ttfb: number | null;
  rating: string;
} {
  const [vitals, setVitals] = useState({
    lcp: null as number | null,
    fcp: null as number | null,
    cls: null as number | null,
    inp: null as number | null,
    ttfb: null as number | null,
    rating: 'good' as string,
  });

  useEffect(() => {
    const interval = options?.checkInterval || 5000;

    const check = () => {
      const current = collectWebVitals();
      const rating = rateWebVitals(current);

      // Trigger callbacks
      if (current.lcp !== null && current.lcp > 2500 && options?.onLcpSlow) {
        options.onLcpSlow(current.lcp);
      }
      if (current.cls !== null && current.cls > 0.1 && options?.onClsHigh) {
        options.onClsHigh(current.cls);
      }
      if (current.inp !== null && current.inp > 200 && options?.onInpSlow) {
        options.onInpSlow(current.inp);
      }

      setVitals({
        lcp: current.lcp,
        fcp: current.fcp,
        cls: current.cls,
        inp: current.inp,
        ttfb: current.ttfb,
        rating: rating.overall,
      });
    };

    // Initial check
    check();

    // Periodic checks
    const timer = setInterval(check, interval);
    return () => clearInterval(timer);
  }, [options?.checkInterval, options?.onLcpSlow, options?.onClsHigh, options?.onInpSlow]);

  return vitals;
}

// ============================================================
// Hook: useInteractionPerformance
// ============================================================

/**
 * Tracks the performance of user interactions (clicks, inputs, etc.).
 * 
 * @param interactionName - Name for the interaction
 * @returns Object with start/end tracking functions
 */
export function useInteractionPerformance(interactionName: string): {
  start: () => void;
  end: () => number | null;
  lastDuration: number | null;
} {
  const startTime = useRef<number>(0);
  const [lastDuration, setLastDuration] = useState<number | null>(null);

  const start = useCallback(() => {
    startTime.current = performance.now();
    markPerformance(`interaction:start:${interactionName}`);
  }, [interactionName]);

  const end = useCallback(() => {
    if (startTime.current === 0) return null;
    const duration = performance.now() - startTime.current;
    const markName = `interaction:end:${interactionName}`;
    markPerformance(markName, { duration });
    measureBetween(`interaction:start:${interactionName}`, markName, `interaction:${interactionName}`);
    setLastDuration(duration);
    startTime.current = 0;
    return duration;
  }, [interactionName]);

  return { start, end, lastDuration };
}

// ============================================================
// Hook: useMemoryMonitor
// ============================================================

/**
 * Monitors memory usage and alerts if it exceeds threshold.
 * 
 * @param threshold - Memory threshold in MB (default: 100MB)
 * @returns Current memory usage in MB
 */
export function useMemoryMonitor(threshold = 100): {
  memoryMB: number | null;
  exceeded: boolean;
} {
  const [memoryMB, setMemoryMB] = useState<number | null>(null);

  useEffect(() => {
    const check = () => {
      const mem = getMemoryUsage();
      if (mem !== null) {
        const mb = mem / 1024 / 1024;
        setMemoryMB(mb);

        if (mb > threshold) {
          markPerformance('memory:high', {
            usageMB: mb,
            threshold,
          });
        }
      }
    };

    check();
    const timer = setInterval(check, 10000);
    return () => clearInterval(timer);
  }, [threshold]);

  return {
    memoryMB,
    exceeded: memoryMB !== null && memoryMB > threshold,
  };
}

// ============================================================
// Hook: useResourceMonitor
// ============================================================

/**
 * Monitors resource loading and identifies slow or large resources.
 * 
 * @returns Resource loading summary
 */
export function useResourceMonitor(): {
  totalResources: number;
  totalSize: number;
  jsSize: number;
  cssSize: number;
  slowestResource: { name: string; duration: number } | null;
} {
  const [resources, setResources] = useState({
    totalResources: 0,
    totalSize: 0,
    jsSize: 0,
    cssSize: 0,
    slowestResource: null as { name: string; duration: number } | null,
  });

  useEffect(() => {
    const check = () => {
      const data = collectResourceTiming();
      setResources({
        totalResources: data.entries.length,
        totalSize: data.totalTransferSize,
        jsSize: data.jsTransferSize,
        cssSize: data.cssTransferSize,
        slowestResource: data.slowest.length > 0
          ? { name: data.slowest[0].name, duration: data.slowest[0].duration }
          : null,
      });
    };

    // Check after initial load
    const timer = setTimeout(check, 2000);
    return () => clearTimeout(timer);
  }, []);

  return resources;
}

// ============================================================
// Hook: usePerformanceSnapshot
// ============================================================

/**
 * Provides on-demand performance snapshot capability.
 * 
 * @returns Function to capture snapshot and latest snapshot data
 */
export function usePerformanceSnapshot(): {
  capture: () => ReturnType<typeof capturePerformanceSnapshot>;
  lastSnapshot: ReturnType<typeof capturePerformanceSnapshot> | null;
} {
  const [lastSnapshot, setLastSnapshot] = useState<ReturnType<typeof capturePerformanceSnapshot> | null>(null);

  const capture = useCallback(() => {
    const snapshot = capturePerformanceSnapshot();
    setLastSnapshot(snapshot);
    return snapshot;
  }, []);

  return { capture, lastSnapshot };
}

// ============================================================
// HOC: withPerformanceTracking
// ============================================================

/**
 * Higher-order component that wraps any component with performance tracking.
 * Automatically marks component mount and measures render time.
 * 
 * @param WrappedComponent - The component to wrap
 * @param componentName - Display name for the component
 */
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
): React.FC<P> {
  const TrackedComponent: React.FC<P> = (props) => {
    usePerformanceMark(`mount:${componentName}`, { component: componentName });

    const renderMetrics = useRenderTimer(32); // 32ms = 2 frames

    useEffect(() => {
      if (renderMetrics.exceededThreshold) {
        markPerformance(`render:slow:${componentName}`, {
          duration: renderMetrics.lastRenderTime,
          threshold: 32,
          renderCount: renderMetrics.renderCount,
        });
      }
    }, [renderMetrics.lastRenderTime, componentName]);

    return React.createElement(WrappedComponent, props);
  };

  TrackedComponent.displayName = `PerfTracked(${componentName})`;
  return TrackedComponent;
}
