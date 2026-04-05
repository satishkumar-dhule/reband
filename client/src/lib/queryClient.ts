import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Optimized QueryClient configuration for static-first architecture
// - staleTime: Infinity for static data (never refetches — data is immutable per build)
// - gcTime: 5 minutes (clear from memory if unused)
// - retry: 2 (brief retry for network hiccups on GitHub Pages)
// - refetchOnWindowFocus: false (static data doesn't change while page is open)
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: Infinity, // Static data is immutable — never stale
      gcTime: 5 * 60 * 1000, // 5 minutes — free memory if unused
      retry: 2, // Retry transient network failures
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    },
    mutations: {
      retry: 1,
    },
  },
});

// Build-time data path
const DATA_BASE = import.meta.env.BASE_URL.replace(/\/$/, '') + '/data';
const BUILD_VERSION = import.meta.env.VITE_BUILD_TIMESTAMP || Date.now().toString();

/**
 * Prefetch channels from static JSON (not API endpoint).
 * channels.json is ~7KB and contains all channel metadata + stats.
 */
export function prefetchChannels() {
  return queryClient.prefetchQuery({
    queryKey: ["channels"],
    queryFn: () => fetch(`${DATA_BASE}/channels.json?v=${BUILD_VERSION}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .catch(error => {
        console.error('Failed to prefetch channels:', error);
        throw error;
      }),
    staleTime: Infinity, // Static data — never refetch
  });
}

/**
 * Prefetch a specific channel's questions.
 * Use this for the current channel only — don't preload all channels.
 */
export function prefetchChannelQuestions(channelId: string) {
  return queryClient.prefetchQuery({
    queryKey: ["channel", channelId],
    queryFn: () => fetch(`${DATA_BASE}/${channelId}.json?v=${BUILD_VERSION}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
    staleTime: Infinity,
  });
}

/**
 * Pre-warm Monaco editor during idle time.
 * Uses requestIdleCallback to load Monaco when browser is idle.
 * This improves perceived performance when user navigates to coding challenge.
 */
export function prewarmMonacoEditor() {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(
      () => {
        // Pre-import Monaco but don't mount it yet
        import('@monaco-editor/react').catch(err => {
          console.warn('Failed to prewarm Monaco editor:', err);
        });
      },
      { timeout: 3000 }
    );
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      import('@monaco-editor/react').catch(err => {
        console.warn('Failed to prewarm Monaco editor:', err);
      });
    }, 3000);
  }
}

// ─── Idle-Time Prefetch of Static JSON Files ───

// Static JSON files to prefetch during idle time
const STATIC_JSON_FILES = [
  'channels.json',
  'learning-paths.json',
  'coding-challenges.json',
  'stats.json',
] as const;

/**
 * Prefetch a static JSON file using React Query.
 * Each file is cached with staleTime: Infinity since static data never changes per build.
 */
function prefetchStaticJson(filename: string): Promise<void> {
  const queryKey = ['static', filename.replace('.json', '')];
  
  return queryClient.prefetchQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`${DATA_BASE}/${filename}?v=${BUILD_VERSION}`);
      if (!res.ok) {
        // Don't throw for missing files - some may not exist in every build
        if (res.status === 404) {
          console.warn(`[Prefetch] Static file not found: ${filename}`);
          return null;
        }
        throw new Error(`HTTP ${res.status} fetching ${filename}`);
      }
      return res.json();
    },
    staleTime: Infinity, // Static data is immutable per build
  }).then(() => undefined).catch(() => undefined); // Ignore errors
}

/**
 * Prefetch all critical static JSON files during idle time.
 * Uses requestIdleCallback to avoid blocking main thread.
 * 
 * This warms the React Query cache so subsequent navigations are instant.
 * Only prefetches metadata files (channels, paths, stats) - NOT individual channel questions.
 * Individual channel data is loaded on-demand to avoid loading unnecessary data.
 * 
 * @param priority - If true, uses shorter timeout for higher priority
 */
export function prefetchAllStaticJson(priority = false): void {
  if (typeof window === 'undefined') return; // SSR guard
  
  const timeout = priority ? 1000 : 5000;
  
  const doPrefetch = () => {
    console.log('[Prefetch] Starting idle prefetch of static JSON files...');
    
    // Prefetch metadata files in parallel
    const prefetchPromises = STATIC_JSON_FILES.map(filename => 
      prefetchStaticJson(filename)
    );
    
    Promise.all(prefetchPromises)
      .then(() => {
        console.log('[Prefetch] Completed idle prefetch of static JSON files');
      })
      .catch(err => {
        console.warn('[Prefetch] Error during static prefetch:', err);
      });
  };
  
  if ('requestIdleCallback' in window) {
    requestIdleCallback(doPrefetch, { timeout });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(doPrefetch, priority ? 500 : 2000);
  }
}

/**
 * Prefetch a specific channel's questions during idle time.
 * Use this when user hovers/clicks on a channel card.
 * 
 * @param channelId - The channel ID to prefetch
 * @param priority - If true, uses shorter timeout
 */
export function prefetchChannelOnIdle(channelId: string, priority = false): void {
  if (typeof window === 'undefined') return;
  
  const timeout = priority ? 500 : 3000;
  
  const doPrefetch = () => {
    prefetchChannelQuestions(channelId).catch(err => {
      console.warn(`[Prefetch] Failed to prefetch channel ${channelId}:`, err);
    });
  };
  
  if ('requestIdleCallback' in window) {
    requestIdleCallback(doPrefetch, { timeout });
  } else {
    setTimeout(doPrefetch, priority ? 200 : 1000);
  }
}

/**
 * Combined cache warming on app idle.
 * Call this once when the app mounts to warm all caches.
 * Static JSON prefetch is skipped in development — data comes from the Express API there.
 */
export function warmCachesOnIdle(): void {
  // Static JSON only exists in the production / GitHub Pages build.
  // In dev mode the Express API serves all data, so skip the /data/ prefetch.
  if (!import.meta.env.DEV) {
    prefetchAllStaticJson();
  }

  // Pre-warm Monaco editor for coding challenges (always safe)
  prewarmMonacoEditor();
}
