import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { LeaderGrid } from "@/components/leaders/LeaderGrid";
import { LeaderModal } from "@/components/leaders/LeaderModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeaders } from "@/hooks/useLeaders";
import { useCounties } from "@/hooks/useCounties";
import type { Leader } from "@/types/database";
import { Filter } from "lucide-react";

export default function Leaders() {
  const [selectedCounty, setSelectedCounty] = useState<string>("all");
  const { data: counties } = useCounties();
  const { data: leaders, isLoading } = useLeaders(
    selectedCounty === "all" ? undefined : selectedCounty
  );
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">All Leaders</h1>
            <p className="text-muted-foreground">
              Browse and filter political leaders by county
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedCounty} onValueChange={setSelectedCounty}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by county" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Counties</SelectItem>
                {counties?.map((county) => (
                  <SelectItem key={county.id} value={county.id}>
                    {county.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
