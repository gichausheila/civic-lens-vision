import { LeaderCard } from "./LeaderCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Leader } from "@/types/database";

interface LeaderGridProps {
  leaders: Leader[];
  isLoading?: boolean;
  onLeaderClick?: (leader: Leader) => void;
}

function LeaderCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <div>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-1" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>
    </div>
  );
}

export function LeaderGrid({ leaders, isLoading, onLeaderClick }: LeaderGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {leaders.map((leader) => (
        <LeaderCard
          key={leader.id}
          leader={leader}
          onClick={() => onLeaderClick?.(leader)}
        />
      ))}
    </div>
  );
}
