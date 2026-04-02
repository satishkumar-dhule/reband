/**
 * Performance Telemetry Module
 * 
 * Comprehensive Web Vitals tracking, custom performance marks,
 * resource timing measurement, and performance monitoring hooks.
 * 
 * This module runs in the browser and collects real-user performance
 * data that can be consumed by Playwright E2E tests and CI pipelines.
 */

// ============================================================
// Types & Interfaces
// ============================================================

export interface WebVitalsScore {
  lcp: number | null;       // Largest Contentful Paint (ms)
  fcp: number | null;       // First Contentful Paint (ms)
  cls: number | null;       // Cumulative Layout Shift
  inp: number | null;       // Interaction to Next Paint (ms)
  ttfb: number | null;      // Time to First Byte (ms)
  fid: number | null;       // First Input Delay (ms)
}

export interface ResourceTimingEntry {
  name: string;
  initiatorType: string;
  duration: number;
  transferSize: number;
  decodedBodySize: number;
  startTime: number;
  responseEnd: number;
}

export interface PerformanceMarkEntry {
  name: string;
  startTime: number;
  duration: number;
  detail?: Record<string, unknown>;
}

export interface RouteTimingEntry {
  from: string;
  to: string;
  startTime: number;
  endTime: number;
  duration: number;
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'prerender';
}

export interface LongTaskEntry {
  startTime: number;
  duration: number;
  name: string;
  attribution: string[];
}

export interface PerformanceSnapshot {
  timestamp: string;
  url: string;
  webVitals: WebVitalsScore;
  resourceCount: number;
  totalTransferSize: number;
  jsTransferSize: number;
  cssTransferSize: number;
  imageTransferSize: number;
  longTasks: LongTaskEntry[];
  memoryUsage: number | null;
  routeTimings: RouteTimingEntry[];
  customMarks: PerformanceMarkEntry[];
}

// ============================================================
// Web Vitals Collection
// ============================================================

/**
 * Collect current Web Vitals scores from the Performance API.
 * Returns a snapshot of all available Core Web Vitals metrics.
 */
export function collectWebVitals(): WebVitalsScore {
  const vitals: WebVitalsScore = {
    lcp: null,
    fcp: null,
    cls: null,
    inp: null,
    ttfb: null,
    fid: null,
  };

  // LCP - Largest Contentful Paint
  try {
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    if (lcpEntries.length > 0) {
      const lastEntry = lcpEntries[lcpEntries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
      vitals.lcp = lastEntry.renderTime || lastEntry.loadTime || 0;
    }
  } catch {
    // API not supported
  }

  // FCP - First Contentful Paint
  try {
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(e => e.name === 'first-contentful-paint');
    if (fcpEntry) {
      vitals.fcp = fcpEntry.startTime;
    }
  } catch {
    // API not supported
  }

  // CLS - Cumulative Layout Shift
  try {
    const layoutShiftEntries = performance.getEntriesByType('layout-shift') as (PerformanceEntry & { value?: number; hadRecentInput?: boolean })[];
    let clsValue = 0;
    for (const entry of layoutShiftEntries) {
      if (!entry.hadRecentInput && entry.value) {
        clsValue += entry.value;
      }
    }
    vitals.cls = clsValue;
  } catch {
    // API not supported
  }

  // INP - Interaction to Next Paint
  try {
    const eventEntries = performance.getEntriesByType('event') as (PerformanceEntry & { processingStart?: number; processingEnd?: number })[];
    let maxInp = 0;
    for (const entry of eventEntries) {
      const delay = (entry.processingStart || 0) - entry.startTime;
      if (delay > maxInp) maxInp = delay;
    }
    vitals.inp = maxInp > 0 ? maxInp : null;
  } catch {
    // API not supported
  }

  // TTFB - Time to First Byte (from navigation timing)
  try {
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
      vitals.ttfb = navEntries[0].responseStart;
    }
  } catch {
    // API not supported
  }

  // FID - First Input Delay (deprecated but still useful)
  try {
    const firstInputEntries = performance.getEntriesByType('first-input');
    if (firstInputEntries.length > 0) {
      const firstInput = firstInputEntries[0] as PerformanceEntry & { processingStart?: number };
      vitals.fid = (firstInput.processingStart || 0) - firstInput.startTime;
    }
  } catch {
    // API not supported
  }

  return vitals;
}

// ============================================================
// Custom Performance Marks
// ============================================================

/**
 * Create a custom performance mark with optional detail metadata.
 * Use this to mark important points in the application lifecycle.
 */
export function markPerformance(name: string, detail?: Record<string, unknown>): void {
  try {
    performance.mark(name, { detail });
  } catch {
    // Mark already exists or API not supported
  }
}

/**
 * Measure the duration between two performance marks.
 */
export function measureBetween(startMark: string, endMark: string, measureName?: string): number | null {
  try {
    const name = measureName || `${startMark}→${endMark}`;
    performance.measure(name, startMark, endMark);
    const entries = performance.getEntriesByName(name, 'measure');
    if (entries.length > 0) {
      return entries[entries.length - 1].duration;
    }
  } catch {
    // Marks don't exist or API not supported
  }
  return null;
}

/**
 * Get all custom performance marks.
 */
export function getPerformanceMarks(): PerformanceMarkEntry[] {
  try {
    return performance.getEntriesByType('mark').map(entry => ({
      name: entry.name,
      startTime: entry.startTime,
      duration: entry.duration,
      detail: (entry as PerformanceMark & { detail?: Record<string, unknown> }).detail,
    }));
  } catch {
    return [];
  }
}

/**
 * Clear all performance marks and measures.
 */
export function clearAllPerformanceMarks(): void {
  try {
    performance.clearMarks();
    performance.clearMeasures();
  } catch {
    // API not supported
  }
}

// ============================================================
// Resource Timing Measurement
// ============================================================

/**
 * Collect resource timing data for all loaded resources.
 * Categorizes by type (JS, CSS, images, fonts, API, etc.)
 */
export function collectResourceTiming(): {
  entries: ResourceTimingEntry[];
  byCategory: Record<string, { count: number; totalSize: number; avgDuration: number }>;
  slowest: ResourceTimingEntry[];
  totalTransferSize: number;
  jsTransferSize: number;
  cssTransferSize: number;
  imageTransferSize: number;
  fontTransferSize: number;
  apiTransferSize: number;
} {
  try {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const entries: ResourceTimingEntry[] = [];
    const byCategory: Record<string, { count: number; totalSize: number; totalDuration: number }> = {};
    let totalTransferSize = 0;
    let jsTransferSize = 0;
    let cssTransferSize = 0;
    let imageTransferSize = 0;
    let fontTransferSize = 0;
    let apiTransferSize = 0;

    for (const resource of resources) {
      const transferSize = resource.transferSize || 0;
      totalTransferSize += transferSize;

      // Categorize
      let category = 'other';
      if (resource.name.endsWith('.js') || resource.initiatorType === 'script') {
        category = 'javascript';
        jsTransferSize += transferSize;
      } else if (resource.name.endsWith('.css') || resource.initiatorType === 'link') {
        category = 'stylesheet';
        cssTransferSize += transferSize;
      } else if (resource.initiatorType === 'img' || /\.(png|jpg|jpeg|gif|svg|webp|avif|ico)/i.test(resource.name)) {
        category = 'image';
        imageTransferSize += transferSize;
      } else if (resource.initiatorType === 'css' || /\.(woff2?|ttf|eot|otf)/i.test(resource.name)) {
        category = 'font';
        fontTransferSize += transferSize;
      } else if (resource.name.includes('/api/') || resource.name.includes('/data/') || resource.name.endsWith('.json')) {
        category = 'api';
        apiTransferSize += transferSize;
      }

      if (!byCategory[category]) {
        byCategory[category] = { count: 0, totalSize: 0, totalDuration: 0 };
      }
      byCategory[category].count++;
      byCategory[category].totalSize += transferSize;
      byCategory[category].totalDuration += resource.duration;

      entries.push({
        name: resource.name,
        initiatorType: resource.initiatorType,
        duration: resource.duration,
        transferSize,
        decodedBodySize: resource.decodedBodySize,
        startTime: resource.startTime,
        responseEnd: resource.responseEnd,
      });
    }

    // Get slowest 10 resources
    const slowest = [...entries]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    // Calculate averages
    const categoryStats: Record<string, { count: number; totalSize: number; avgDuration: number }> = {};
    for (const [key, val] of Object.entries(byCategory)) {
      categoryStats[key] = {
        count: val.count,
        totalSize: val.totalSize,
        avgDuration: val.count > 0 ? val.totalDuration / val.count : 0,
      };
    }

    return {
      entries,
      byCategory: categoryStats,
      slowest,
      totalTransferSize,
      jsTransferSize,
      cssTransferSize,
      imageTransferSize,
      fontTransferSize,
      apiTransferSize,
    };
  } catch {
    return {
      entries: [],
      byCategory: {},
      slowest: [],
      totalTransferSize: 0,
      jsTransferSize: 0,
      cssTransferSize: 0,
      imageTransferSize: 0,
      fontTransferSize: 0,
      apiTransferSize: 0,
    };
  }
}

// ============================================================
// Route Transition Timing
// ============================================================

const _routeTimings: RouteTimingEntry[] = [];

/**
 * Record a route transition timing.
 * Call this when navigation starts and ends.
 */
export function recordRouteTransition(
  from: string,
  to: string,
  startTime: number,
  endTime: number,
  navigationType: RouteTimingEntry['navigationType'] = 'navigate'
): void {
  _routeTimings.push({
    from,
    to,
    startTime,
    endTime,
    duration: endTime - startTime,
    navigationType,
  });

  // Keep only last 50 transitions
  if (_routeTimings.length > 50) {
    _routeTimings.shift();
  }
}

/**
 * Get all recorded route transitions.
 */
export function getRouteTimings(): RouteTimingEntry[] {
  return [..._routeTimings];
}

/**
 * Clear all recorded route transitions.
 */
export function clearRouteTimings(): void {
  _routeTimings.length = 0;
}

// ============================================================
// Long Task Detection
// ============================================================

/**
 * Collect long task entries (>50ms tasks that block the main thread).
 */
export function collectLongTasks(): LongTaskEntry[] {
  try {
    const entries = performance.getEntriesByType('longtask') as (PerformanceEntry & { attribution?: { name?: string }[] })[];
    return entries.map(entry => ({
      startTime: entry.startTime,
      duration: entry.duration,
      name: entry.name,
      attribution: entry.attribution?.map(a => a.name || 'unknown') || ['unknown'],
    }));
  } catch {
    return [];
  }
}

// ============================================================
// Memory Usage
// ============================================================

/**
 * Get current memory usage (Chrome-specific API).
 */
export function getMemoryUsage(): number | null {
  try {
    const perf = performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } };
    if (perf.memory) {
      return perf.memory.usedJSHeapSize;
    }
  } catch {
    // API not supported
  }
  return null;
}

// ============================================================
// Full Performance Snapshot
// ============================================================

/**
 * Capture a complete performance snapshot of the current page state.
 * This is the primary function consumed by E2E tests and CI pipelines.
 */
export function capturePerformanceSnapshot(): PerformanceSnapshot {
  const resourceTiming = collectResourceTiming();

  return {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    webVitals: collectWebVitals(),
    resourceCount: resourceTiming.entries.length,
    totalTransferSize: resourceTiming.totalTransferSize,
    jsTransferSize: resourceTiming.jsTransferSize,
    cssTransferSize: resourceTiming.cssTransferSize,
    imageTransferSize: resourceTiming.imageTransferSize,
    longTasks: collectLongTasks(),
    memoryUsage: getMemoryUsage(),
    routeTimings: getRouteTimings(),
    customMarks: getPerformanceMarks(),
  };
}

// ============================================================
// Lifecycle Marks (auto-injected)
// ============================================================

/**
 * Initialize automatic performance marks at key lifecycle points.
 * Call this once during app initialization.
 */
export function initPerformanceMarks(): void {
  // Mark app start
  markPerformance('app:init');

  // Mark when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      markPerformance('dom:ready');
    });
  } else {
    markPerformance('dom:ready');
  }

  // Mark when page is fully loaded
  window.addEventListener('load', () => {
    markPerformance('page:loaded');

    // Measure time from app init to page load
    const duration = measureBetween('app:init', 'page:loaded', 'app:init→page:loaded');
    if (duration !== null) {
      markPerformance('perf:app-to-load', { duration });
    }
  });

  // Mark when first paint occurs
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-paint') {
          markPerformance('paint:first', { time: entry.startTime });
        }
        if (entry.name === 'first-contentful-paint') {
          markPerformance('paint:fcp', { time: entry.startTime });
        }
      }
    });
    observer.observe({ entryTypes: ['paint'] });
  } catch {
    // API not supported
  }

  // Mark when LCP occurs
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        markPerformance('paint:lcp', { time: lastEntry.startTime });
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch {
    // API not supported
  }

  // Mark long tasks
  try {
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        markPerformance('longtask', {
          startTime: entry.startTime,
          duration: entry.duration,
        });
      }
    });
    longTaskObserver.observe({ entryTypes: ['longtask'] });
  } catch {
    // API not supported
  }
}

// ============================================================
// Navigation Timing Helper
// ============================================================

/**
 * Get detailed navigation timing breakdown.
 */
export function getNavigationTiming(): {
  dns: number;
  tcp: number;
  ttfb: number;
  download: number;
  domProcessing: number;
  totalLoad: number;
} | null {
  try {
    const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (!nav) return null;

    return {
      dns: nav.domainLookupEnd - nav.domainLookupStart,
      tcp: nav.connectEnd - nav.connectStart,
      ttfb: nav.responseStart - nav.requestStart,
      download: nav.responseEnd - nav.responseStart,
      domProcessing: nav.domComplete - nav.responseEnd,
      totalLoad: nav.loadEventEnd - nav.startTime,
    };
  } catch {
    return null;
  }
}

// ============================================================
// Performance Rating
// ============================================================

export interface PerformanceRating {
  score: 'good' | 'needs-improvement' | 'poor';
  metric: string;
  value: number;
  thresholds: { good: number; poor: number };
}

/**
 * Rate a performance metric against Core Web Vitals thresholds.
 */
export function rateMetric(metric: string, value: number): PerformanceRating {
  const thresholds: Record<string, { good: number; poor: number }> = {
    lcp: { good: 2500, poor: 4000 },
    fcp: { good: 1800, poor: 3000 },
    cls: { good: 0.1, poor: 0.25 },
    inp: { good: 200, poor: 500 },
    ttfb: { good: 800, poor: 1800 },
    fid: { good: 100, poor: 300 },
  };

  const t = thresholds[metric];
  if (!t) {
    return { score: 'good', metric, value, thresholds: { good: 0, poor: 0 } };
  }

  let score: PerformanceRating['score'];
  if (metric === 'cls') {
    // CLS: lower is better
    score = value <= t.good ? 'good' : value <= t.poor ? 'needs-improvement' : 'poor';
  } else {
    // Time-based: lower is better
    score = value <= t.good ? 'good' : value <= t.poor ? 'needs-improvement' : 'poor';
  }

  return { score, metric, value, thresholds: t };
}

/**
 * Rate all Web Vitals and return a summary.
 */
export function rateWebVitals(vitals: WebVitalsScore): {
  overall: 'good' | 'needs-improvement' | 'poor';
  ratings: PerformanceRating[];
} {
  const ratings: PerformanceRating[] = [];

  if (vitals.lcp !== null) ratings.push(rateMetric('lcp', vitals.lcp));
  if (vitals.fcp !== null) ratings.push(rateMetric('fcp', vitals.fcp));
  if (vitals.cls !== null) ratings.push(rateMetric('cls', vitals.cls));
  if (vitals.inp !== null) ratings.push(rateMetric('inp', vitals.inp));
  if (vitals.ttfb !== null) ratings.push(rateMetric('ttfb', vitals.ttfb));
  if (vitals.fid !== null) ratings.push(rateMetric('fid', vitals.fid));

  // Overall score: worst individual rating
  const scoreOrder = ['good', 'needs-improvement', 'poor'] as const;
  let worstIndex = 0;
  for (const r of ratings) {
    const idx = scoreOrder.indexOf(r.score);
    if (idx > worstIndex) worstIndex = idx;
  }

  return {
    overall: scoreOrder[worstIndex],
    ratings,
  };
}
