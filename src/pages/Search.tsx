import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { LeaderGrid } from "@/components/leaders/LeaderGrid";
import { LeaderModal } from "@/components/leaders/LeaderModal";
import { Input } from "@/components/ui/input";
import { useSearchLeaders } from "@/hooks/useLeaders";
import type { Leader } from "@/types/database";
import { Search as SearchIcon } from "lucide-react";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: leaders, isLoading } = useSearchLeaders(searchTerm);
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Search Leaders</h1>
        <p className="text-muted-foreground mb-6">
          Search for political leaders by name or position
        </p>

        <div className="relative max-w-xl">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>
      </div>

      <LeaderGrid
        leaders={leaders || []}
        isLoading={isLoading}
        onLeaderClick={setSelectedLeader}
      />

      <LeaderModal
        leader={selectedLeader}
        open={!!selectedLeader}
        onOpenChange={(open) => !open && setSelectedLeader(null)}
      />
    </Layout>
  );
}
