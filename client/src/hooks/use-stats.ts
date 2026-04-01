import { useState, useEffect, useRef } from 'react';
import { getChannelStats, api } from '../lib/questions-loader';
import type { ChannelDetailedStats } from '../types';

// Re-export for backward compatibility
export type ChannelStats = ChannelDetailedStats;

// Hook to get channel statistics with proper request cancellation
export function useChannelStats() {
  const [stats, setStats] = useState<ChannelDetailedStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Track the current request ID to detect stale responses
  const requestIdRef = useRef(0);

  useEffect(() => {
    // Increment request ID to track this specific request
    const currentRequestId = ++requestIdRef.current;

    // Try cache first (synchronous, always safe)
    const cached = getChannelStats();
    if (cached.length > 0) {
      if (currentRequestId === requestIdRef.current) {
        setStats(cached);
        setLoading(false);
      }
      return;
    }

    // Load from API
    api.stats.getAll()
      .then((result) => {
        if (currentRequestId === requestIdRef.current) {
          setStats(result);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return;
        if (currentRequestId === requestIdRef.current) {
          setError(err);
          setStats([]);
        }
      })
      .finally(() => {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
      });
  }, []);

  return { 
    stats, 
    loading, 
    error 
  };
}
