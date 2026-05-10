import React, { useRef, useEffect, useCallback } from 'react';

interface VirtualScrollProps {
  children: React.ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  threshold?: number;
}

/**
 * VirtualScroll component for efficient infinite scrolling
 * Uses intersection observer for optimal performance
 */
export const VirtualScroll: React.FC<VirtualScrollProps> = ({
  children,
  onLoadMore,
  hasMore,
  loading,
  threshold = 200
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        // Load more when sentinel comes into view
        if (
          entry.isIntersecting &&
          hasMore &&
          !loading &&
          !isLoadingRef.current
        ) {
          isLoadingRef.current = true;
          onLoadMore();

          // Reset loading flag after a delay
          setTimeout(() => {
            isLoadingRef.current = false;
          }, 1000);
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0.01,
      }
    );

    // Observe sentinel element
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, onLoadMore, threshold]);

  return (
    <div>
      {children}
      {hasMore && (
        <div
          ref={sentinelRef}
          className="sentinel"
          style={{ height: '20px' }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default VirtualScroll;
