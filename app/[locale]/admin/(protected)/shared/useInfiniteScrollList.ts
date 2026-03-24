"use client";

import { useState, useMemo, useEffect, useRef } from "react";

const DEFAULT_PAGE_SIZE = 20;

/* **************************************************
 * useInfiniteScrollList
 *
 * Manages visible-count pagination via IntersectionObserver,
 * shared by MediaListClient and MediaSelector.
 * ************************************************** */
export function useInfiniteScrollList<T>(
  items: T[],
  { pageSize = DEFAULT_PAGE_SIZE, isActive = true }: { pageSize?: number; isActive?: boolean } = {},
) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const hasMore = visibleCount < items.length;

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || !isActive || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + pageSize, items.length));
        }
      },
      { rootMargin: "100px", threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isActive, items.length, pageSize]);

  function reset() {
    setVisibleCount(pageSize);
  }

  return { visibleItems, hasMore, sentinelRef, reset };
}
