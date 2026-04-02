/**
 * Performance Utilities
 * Optimize mobile performance and integrate with telemetry system.
 */

import { trackMobilePerformance } from './analytics';
import {
  collectWebVitals,
  collectResourceTiming,
  capturePerformanceSnapshot,
  markPerformance,
  measureBetween,
  recordRouteTransition,
  getMemoryUsage,
  getNavigationTiming,
  rateWebVitals,
  initPerformanceMarks,
} from './perf-telemetry';

/**
 * Debounce function calls
 * Prevents excessive function calls
 * Returns both the debounced function and a cancel method
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  const executedFunction = (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
  
  const cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return Object.assign(executedFunction, { cancel });
}

/**
 * Throttle function calls
 * Limits function execution rate
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request Animation Frame wrapper
 * Ensures smooth 60fps animations
 * Returns both the throttled function and a cancel method
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let rafId: number | null = null;
  
  const executedFunction = (...args: Parameters<T>) => {
    if (rafId) {
      return;
    }
    
    rafId = requestAnimationFrame(() => {
      func(...args);
      rafId = null;
    });
  };
  
  const cancel = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
  
  return Object.assign(executedFunction, { cancel });
}

/**
 * Measure animation FPS
 * Track animation performance
 */
export class FPSMeter {
  private frames: number[] = [];
  private lastTime: number = performance.now();
  
  tick() {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;
    
    this.frames.push(1000 / delta);
    
    // Keep only last 60 frames
    if (this.frames.length > 60) {
      this.frames.shift();
    }
  }
  
  getFPS(): number {
    if (this.frames.length === 0) return 0;
    return Math.round(this.frames.reduce((a, b) => a + b, 0) / this.frames.length);
  }
  
  reset() {
    this.frames = [];
    this.lastTime = performance.now();
  }
}

/**
 * Measure gesture latency
 * Track time from gesture start to completion
 */
export class LatencyMeter {
  private startTime: number = 0;
  
  start() {
    this.startTime = performance.now();
  }
  
  end(): number {
    return performance.now() - this.startTime;
  }
}

/**
 * Lazy load images
 * Improves initial load time
 * Returns cleanup function to disconnect observer
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  placeholder?: string
): (() => void) | undefined {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.unobserve(img);
        }
      });
    });
    
    if (placeholder) {
      img.src = placeholder;
    }
    
    observer.observe(img);
    
    // Return cleanup function
    return () => {
      observer.disconnect();
    };
  } else {
    // Fallback for browsers without IntersectionObserver
    img.src = src;
    return undefined;
  }
}

/**
 * Preload critical resources
 * Improves perceived performance
 */
export function preloadResource(url: string, type: 'image' | 'script' | 'style') {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = type;
  document.head.appendChild(link);
}

/**
 * Check if device is low-end
 * Adjust features based on device capability
 */
export function isLowEndDevice(): boolean {
  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 1;
  if (cores < 4) return true;
  
  // Check device memory (if available)
  const memory = (navigator as any).deviceMemory;
  if (memory && memory < 4) return true;
  
  // Check connection speed
  const connection = (navigator as any).connection;
  if (connection) {
    const effectiveType = connection.effectiveType;
    if (effectiveType === 'slow-2g' || effectiveType === '2g') return true;
  }
  
  return false;
}

/**
 * Optimize animations for low-end devices
 * Reduce animation complexity
 */
export function getAnimationConfig() {
  const isLowEnd = isLowEndDevice();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return {
    enabled: !prefersReducedMotion,
    duration: isLowEnd ? 150 : 300,
    easing: isLowEnd ? 'ease-out' : 'ease-in-out',
    stiffness: isLowEnd ? 200 : 300,
    damping: isLowEnd ? 20 : 30,
  };
}

/**
 * Track Core Web Vitals
 * Monitor performance metrics
 */
export function trackWebVitals() {
  // Initialize automatic performance marks
  initPerformanceMarks();

  // First Contentful Paint (FCP)
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        const fcp = entry.startTime;
        trackMobilePerformance('load_time', fcp, window.location.pathname);
      }
    }
  });
  
  try {
    observer.observe({ entryTypes: ['paint'] });
  } catch (e) {
    // Browser doesn't support this API
  }
  
  // Largest Contentful Paint (LCP)
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    const lcp = lastEntry.startTime;
    trackMobilePerformance('load_time', lcp, window.location.pathname);
  });
  
  try {
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    // Browser doesn't support this API
  }
}

// ============================================================
// Enhanced Performance Monitoring Hooks
// ============================================================

/**
 * Track page load performance with full breakdown.
 * Call this after page navigation completes.
 */
export function trackPageLoadPerformance(pageName?: string): {
  fcp: number;
  lcp: number;
  ttfb: number;
  domContentLoaded: number;
  totalLoad: number;
  rating: string;
} {
  const vitals = collectWebVitals();
  const navTiming = getNavigationTiming();
  const memory = getMemoryUsage();
  const rating = rateWebVitals(vitals);

  const result = {
    fcp: vitals.fcp || 0,
    lcp: vitals.lcp || 0,
    ttfb: vitals.ttfb || 0,
    domContentLoaded: navTiming ? navTiming.totalLoad : 0,
    totalLoad: navTiming ? navTiming.totalLoad : 0,
    rating: rating.overall,
  };

  // Track each metric
  if (vitals.fcp !== null) {
    trackMobilePerformance('load_time', vitals.fcp, pageName || window.location.pathname);
  }
  if (vitals.lcp !== null) {
    trackMobilePerformance('load_time', vitals.lcp, `${pageName || window.location.pathname}-lcp`);
  }
  if (memory !== null) {
    trackMobilePerformance('load_time', memory, `${pageName || window.location.pathname}-memory`);
  }

  return result;
}

/**
 * Monitor bundle load performance.
 * Tracks JS/CSS bundle sizes and load times.
 */
export function trackBundlePerformance(): {
  jsSize: number;
  cssSize: number;
  totalSize: number;
  resourceCount: number;
  slowestResources: { name: string; duration: number }[];
} {
  const resources = collectResourceTiming();
  
  return {
    jsSize: resources.jsTransferSize,
    cssSize: resources.cssTransferSize,
    totalSize: resources.totalTransferSize,
    resourceCount: resources.entries.length,
    slowestResources: resources.slowest.map(r => ({
      name: r.name,
      duration: r.duration,
    })),
  };
}

/**
 * Measure API response times from resource timing data.
 */
export function measureApiResponseTimes(): {
  averageLatency: number;
  maxLatency: number;
  minLatency: number;
  requestCount: number;
  slowestEndpoints: { name: string; duration: number }[];
} {
  const resources = collectResourceTiming();
  const apiEntries = resources.entries.filter(r =>
    r.name.includes('/api/') || r.name.includes('/data/') || r.name.endsWith('.json')
  );

  if (apiEntries.length === 0) {
    return { averageLatency: 0, maxLatency: 0, minLatency: 0, requestCount: 0, slowestEndpoints: [] };
  }

  const latencies = apiEntries.map(r => r.duration);
  const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;

  return {
    averageLatency: avg,
    maxLatency: Math.max(...latencies),
    minLatency: Math.min(...latencies),
    requestCount: apiEntries.length,
    slowestEndpoints: apiEntries
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map(r => ({ name: r.name, duration: r.duration })),
  };
}

/**
 * Track a route transition with performance marks.
 * Use this wrapper around SPA navigation.
 */
export function trackRouteTransition(from: string, to: string): () => void {
  const startTime = performance.now();
  markPerformance(`route:start:${to}`, { from });

  return () => {
    const endTime = performance.now();
    markPerformance(`route:end:${to}`, { from, duration: endTime - startTime });
    recordRouteTransition(from, to, startTime, endTime, 'navigate');
    measureBetween(`route:start:${to}`, `route:end:${to}`, `route:${from}→${to}`);
  };
}

/**
 * Create a performance measurement wrapper for async operations.
 * Returns a function that wraps any async operation with timing.
 */
export function createPerfWrapper<T>(operationName: string): (fn: () => Promise<T>) => Promise<T> {
  return async (fn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    markPerformance(`${operationName}:start`);
    try {
      const result = await fn();
      const duration = performance.now() - start;
      markPerformance(`${operationName}:end`, { duration });
      measureBetween(`${operationName}:start`, `${operationName}:end`, operationName);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      markPerformance(`${operationName}:error`, { duration, error: String(error) });
      throw error;
    }
  };
}

/**
 * Track data fetch performance for a specific endpoint.
 */
export function trackDataFetch(url: string): {
  start: () => void;
  end: () => number | null;
} {
  let startTime = 0;
  
  return {
    start: () => {
      startTime = performance.now();
      markPerformance(`fetch:start:${url}`);
    },
    end: () => {
      if (startTime === 0) return null;
      const duration = performance.now() - startTime;
      markPerformance(`fetch:end:${url}`, { duration });
      measureBetween(`fetch:start:${url}`, `fetch:end:${url}`, `fetch:${url}`);
      return duration;
    },
  };
}

/**
 * Get a complete performance report for the current page.
 * Useful for E2E test assertions and CI reporting.
 */
export function getPerformanceReport(pageName?: string) {
  const snapshot = capturePerformanceSnapshot();
  const bundlePerf = trackBundlePerformance();
  const apiPerf = measureApiResponseTimes();
  const navTiming = getNavigationTiming();
  const rating = rateWebVitals(snapshot.webVitals);

  return {
    page: pageName || window.location.pathname,
    timestamp: snapshot.timestamp,
    overallRating: rating.overall,
    webVitals: {
      ...snapshot.webVitals,
      ratings: rating.ratings,
    },
    navigation: navTiming,
    bundles: {
      jsSize: bundlePerf.jsSize,
      cssSize: bundlePerf.cssSize,
      totalSize: bundlePerf.totalSize,
      resourceCount: bundlePerf.resourceCount,
    },
    api: apiPerf,
    memory: snapshot.memoryUsage,
    longTasks: snapshot.longTasks.length,
    routeTransitions: snapshot.routeTimings.length,
  };
}

/**
 * Optimize scroll performance
 * Use passive event listeners
 */
export function addPassiveScrollListener(
  element: HTMLElement | Window,
  handler: EventListener
) {
  element.addEventListener('scroll', handler, { passive: true });
  
  return () => {
    element.removeEventListener('scroll', handler);
  };
}

/**
 * Batch DOM updates
 * Reduce layout thrashing
 */
export function batchDOMUpdates(updates: (() => void)[]) {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

/**
 * Memoize expensive computations
 * Cache results for better performance
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T
): T {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

/**
 * Check if element is in viewport
 * Useful for lazy loading
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Get optimal image size
 * Serve appropriate image resolution
 */
export function getOptimalImageSize(): 'small' | 'medium' | 'large' {
  const width = window.innerWidth;
  const dpr = window.devicePixelRatio || 1;
  const effectiveWidth = width * dpr;
  
  if (effectiveWidth < 640) return 'small';
  if (effectiveWidth < 1280) return 'medium';
  return 'large';
}

/**
 * Prefetch next page
 * Improve navigation speed
 */
export function prefetchPage(url: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Clear performance marks
 * Clean up after measurements
 */
export function clearPerformanceMarks(name?: string) {
  if (name) {
    performance.clearMarks(name);
    performance.clearMeasures(name);
  } else {
    performance.clearMarks();
    performance.clearMeasures();
  }
}
