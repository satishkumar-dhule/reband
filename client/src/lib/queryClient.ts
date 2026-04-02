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
