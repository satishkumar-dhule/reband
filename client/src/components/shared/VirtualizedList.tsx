/**
 * Virtualized List Component
 * 
 * Renders only visible items in a scrollable container to improve performance
 * for large lists (search results, question lists, etc.).
 * 
 * Uses IntersectionObserver for efficient viewport detection.
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  containerClassName?: string;
  getKey: (item: T, index: number) => string;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 5,
  className,
  containerClassName,
  getKey,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const totalHeight = items.length * itemHeight;

  // Calculate visible range
  const { startIndex, endIndex } = useMemo(() => {
    if (containerHeight === 0) return { startIndex: 0, endIndex: 0 };
    
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length, start + visibleCount + overscan * 2);
    
    return { startIndex: start, endIndex: end };
  }, [scrollTop, containerHeight, itemHeight, items.length, overscan]);

  // Measure container on mount and resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    observer.observe(container);
    setContainerHeight(container.clientHeight);

    return () => observer.disconnect();
  }, []);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex).map((item, i) => {
      const actualIndex = startIndex + i;
      return (
        <div
          key={getKey(item, actualIndex)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: itemHeight,
            transform: `translateY(${actualIndex * itemHeight}px)`,
          }}
        >
          {renderItem(item, actualIndex)}
        </div>
      );
    });
  }, [items, startIndex, endIndex, itemHeight, renderItem, getKey]);

  return (
    <div
      ref={containerRef}
      className={containerClassName || 'overflow-y-auto'}
      onScroll={handleScroll}
      style={{ position: 'relative' }}
    >
      <div className={className} style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems}
      </div>
    </div>
  );
}

/**
 * Simple virtualized list using IntersectionObserver for lazy rendering.
 * Better for cases where items have variable heights.
 */
interface LazyListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  containerClassName?: string;
  getKey: (item: T, index: number) => string;
  batchSize?: number;
}

export function LazyList<T>({
  items,
  renderItem,
  containerClassName,
  getKey,
  batchSize = 20,
}: LazyListProps<T>) {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < items.length) {
          setVisibleCount((prev) => Math.min(prev + batchSize, items.length));
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleCount, items.length, batchSize]);

  // Reset when items change
  useEffect(() => {
    setVisibleCount(batchSize);
  }, [items.length, batchSize]);

  const visibleItems = items.slice(0, visibleCount);

  return (
    <div className={containerClassName}>
      {visibleItems.map((item, i) => (
        <div key={getKey(item, i)}>
          {renderItem(item, i)}
        </div>
      ))}
      {visibleCount < items.length && (
        <div ref={sentinelRef} style={{ height: 1 }} aria-hidden="true" />
      )}
    </div>
  );
}
