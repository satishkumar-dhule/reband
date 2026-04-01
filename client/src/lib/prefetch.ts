/**
 * Route Prefetch Utility
 * Prefetches route components on hover for instant navigation
 */

// Map of route paths to their lazy-loaded components
const routePrefetchMap: Record<string, () => Promise<any>> = {};

// Track prefetched routes to avoid duplicate requests
const prefetchedRoutes = new Set<string>();

/**
 * Register a route for prefetching
 * @param path - Route path (e.g., '/channels')
 * @param importFn - Dynamic import function for the route component
 */
export function registerRouteForPrefetch(
  path: string, 
  importFn: () => Promise<any>
): void {
  routePrefetchMap[path] = importFn;
}

/**
 * Prefetch a route component
 * @param path - Route path to prefetch
 */
export async function prefetchRoute(path: string): Promise<void> {
  if (prefetchedRoutes.has(path)) {
    return; // Already prefetched
  }

  const importFn = routePrefetchMap[path];
  if (!importFn) {
    return; // Route not registered
  }

  try {
    prefetchedRoutes.add(path);
    await importFn();
    console.log(`[Prefetch] Route prefetched: ${path}`);
  } catch (error) {
    console.warn(`[Prefetch] Failed to prefetch route ${path}:`, error);
    prefetchedRoutes.delete(path); // Allow retry on next hover
  }
}

/**
 * Create hover handler for prefetching
 * @param path - Route path to prefetch on hover
 * @returns Event handler object with onMouseEnter and onFocus
 */
export function createPrefetchHandler(path: string) {
  let prefetchTimeout: NodeJS.Timeout;

  return {
    onMouseEnter: () => {
      // Prefetch after a short delay to avoid prefetching on quick mouse movements
      prefetchTimeout = setTimeout(() => {
        prefetchRoute(path);
      }, 100);
    },
    onFocus: () => {
      // Also prefetch on focus for keyboard navigation
      prefetchRoute(path);
    },
    onMouseLeave: () => {
      // Clear timeout if mouse leaves before delay
      clearTimeout(prefetchTimeout);
    }
  };
}

/**
 * Prefetch critical routes on app load
 * Called after initial render to warm up the cache
 */
export function prefetchCriticalRoutes(): void {
  if (typeof window === 'undefined') return;

  // Use requestIdleCallback to avoid blocking main thread
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Prefetch most likely next routes
      const criticalRoutes = ['/channels', '/voice-interview', '/coding'];
      criticalRoutes.forEach(route => {
        prefetchRoute(route);
      });
    }, { timeout: 2000 });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      const criticalRoutes = ['/channels', '/voice-interview', '/coding'];
      criticalRoutes.forEach(route => {
        prefetchRoute(route);
      });
    }, 1000);
  }
}

/**
 * Prefetch data files for faster initial load
 * Prefetches essential JSON data files
 */
export function prefetchCriticalData(): void {
  if (typeof window === 'undefined') return;

  const criticalDataFiles = [
    '/data/channels.json',
    '/data/learning-paths.json'
  ];

  // Use link prefetch for better browser support
  criticalDataFiles.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'fetch';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}