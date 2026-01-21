import { useState, useEffect, useCallback, useRef } from "react";
import { LeaderCard } from "./LeaderCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import type { Leader } from "@/types/database";

interface LeaderGridProps {
  leaders: Leader[];
  isLoading?: boolean;
  onLeaderClick?: (leader: Leader) => void;
  pageSize?: number;
}

function LeaderCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden w-full">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-4 space-y-3">
        <div>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </div>
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
    </div>
  );
}

export function LeaderGrid({ 
  leaders, 
  isLoading, 
  onLeaderClick,
  pageSize = 12 
}: LeaderGridProps) {
  const [displayCount, setDisplayCount] = useState(pageSize);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Reset display count when leaders change
  useEffect(() => {
    setDisplayCount(pageSize);
  }, [leaders, pageSize]);

  // Infinite scroll observer
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && displayCount < leaders.length && !isLoadingMore) {
      setIsLoadingMore(true);
      // Simulate loading delay for smooth UX
      setTimeout(() => {
        setDisplayCount((prev) => Math.min(prev + pageSize, leaders.length));
        setIsLoadingMore(false);
      }, 300);
    }
  }, [displayCount, leaders.length, isLoadingMore, pageSize]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    });

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [handleObserver]);

  const displayedLeaders = leaders.slice(0, displayCount);
  const hasMore = displayCount < leaders.length;

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <LeaderCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (leaders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No leaders found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 3-column grid on all devices with infinite scroll */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
        {displayedLeaders.map((leader) => (
          <LeaderCard
            key={leader.id}
            leader={leader}
            onClick={() => onLeaderClick?.(leader)}
          />
        ))}
      </div>

      {/* Infinite Scroll Loader */}
      {hasMore && (
        <div 
          ref={loaderRef} 
          className="flex items-center justify-center py-8"
        >
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading more leaders...</span>
            </div>
          )}
        </div>
      )}

      {/* Load count indicator */}
      {leaders.length > pageSize && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {displayedLeaders.length} of {leaders.length} leaders
        </div>
      )}
    </div>
  );
}
