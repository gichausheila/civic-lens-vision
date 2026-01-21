import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { useLeaders } from "@/hooks/useLeaders";
import { useCounties } from "@/hooks/useCounties";
import { Skeleton } from "@/components/ui/skeleton";
import { LeaderModal } from "@/components/leaders/LeaderModal";
import { NationalLeaderCard } from "@/components/leaders/NationalLeaderCard";
import { LeaderCard } from "@/components/leaders/LeaderCard";
import { LeaderGrid } from "@/components/leaders/LeaderGrid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Leader } from "@/types/database";
import { Landmark, Users, Crown, Building2, MapPin, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Leaders() {
  const { data: leaders, isLoading } = useLeaders();
  const { data: counties } = useCounties();
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);
  const [selectedCountyFilter, setSelectedCountyFilter] = useState<string>("all");
  const [mpSearchTerm, setMpSearchTerm] = useState("");

  // Separate national and county leaders
  const nationalLeaders = leaders?.filter((l) => l.is_national) || [];
  const countyLeaders = leaders?.filter((l) => !l.is_national) || [];

  // Get all MPs
  const allMPs = useMemo(() => {
    return countyLeaders.filter((l) => l.position.toLowerCase().startsWith("mp"));
  }, [countyLeaders]);

  // Filter MPs by county and search term
  const filteredMPs = useMemo(() => {
    let filtered = allMPs;

    if (selectedCountyFilter !== "all") {
      filtered = filtered.filter((mp) => mp.county_id === selectedCountyFilter);
    }

    if (mpSearchTerm.trim()) {
      const search = mpSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (mp) =>
          mp.name.toLowerCase().includes(search) ||
          mp.position.toLowerCase().includes(search)
      );
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [allMPs, selectedCountyFilter, mpSearchTerm]);

  // National hierarchy
  const president = nationalLeaders.find((l) => l.position.includes("President") && !l.position.includes("Deputy"));
  const deputyPresident = nationalLeaders.find((l) => l.position.includes("Deputy President"));
  const primeCS = nationalLeaders.find((l) => l.position.includes("Prime Cabinet Secretary"));
  const cabinetSecretaries = nationalLeaders.filter((l) => 
    l.position.includes("Cabinet Secretary") && !l.position.includes("Prime")
  ).sort((a, b) => a.name.localeCompare(b.name));

  // Sort counties by code
  const sortedCounties = [...(counties || [])].sort((a, b) => a.code - b.code);

  // Group county leaders by county (excluding MPs for the main view)
  const leadersByCounty = sortedCounties.map((county) => {
    const countyLeadersList = countyLeaders.filter((l) => l.county_id === county.id);
    const governor = countyLeadersList.find((l) => l.position.includes("Governor"));
    const senator = countyLeadersList.find((l) => l.position.includes("Senator"));
    const womenRep = countyLeadersList.find((l) => l.position.includes("Women Rep"));
    const mps = countyLeadersList.filter((l) => l.position.toLowerCase().startsWith("mp"));

    return {
      county,
      governor,
      senator,
      womenRep,
      mps,
      hasLeaders: countyLeadersList.length > 0,
    };
  });

  // Get selected county name for display
  const selectedCountyName = useMemo(() => {
    if (selectedCountyFilter === "all") return null;
    return counties?.find((c) => c.id === selectedCountyFilter)?.name;
  }, [selectedCountyFilter, counties]);

  const clearFilters = () => {
    setSelectedCountyFilter("all");
    setMpSearchTerm("");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-8">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* National Government Section */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Landmark className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">National Government</h1>
            <p className="text-sm text-muted-foreground">Executive leadership of Kenya</p>
          </div>
        </div>

        {/* The Executive */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            The Executive
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {president && (
              <NationalLeaderCard
                leader={president}
                onClick={() => setSelectedLeader(president)}
                variant="featured"
              />
            )}
            {deputyPresident && (
              <NationalLeaderCard
                leader={deputyPresident}
                onClick={() => setSelectedLeader(deputyPresident)}
                variant="featured"
              />
            )}
            {primeCS && (
              <NationalLeaderCard
                leader={primeCS}
                onClick={() => setSelectedLeader(primeCS)}
              />
            )}
          </div>
        </div>

        {/* Cabinet Secretaries */}
        {cabinetSecretaries.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Cabinet Secretaries ({cabinetSecretaries.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cabinetSecretaries.map((cs) => (
                <LeaderCard
                  key={cs.id}
                  leader={cs}
                  onClick={() => setSelectedLeader(cs)}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* MPs Section with Filter */}
      <section className="mb-12">
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Members of Parliament</h2>
              <p className="text-sm text-muted-foreground">
                {filteredMPs.length} of {allMPs.length} MPs
                {selectedCountyName && ` in ${selectedCountyName} County`}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search MPs by name or constituency..."
              value={mpSearchTerm}
              onChange={(e) => setMpSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedCountyFilter} onValueChange={setSelectedCountyFilter}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Filter by county" />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              <SelectItem value="all">All Counties</SelectItem>
              {sortedCounties.map((county) => (
                <SelectItem key={county.id} value={county.id}>
                  {String(county.code).padStart(3, "0")} - {county.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(selectedCountyFilter !== "all" || mpSearchTerm) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {(selectedCountyFilter !== "all" || mpSearchTerm) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedCountyName && (
              <Badge variant="secondary" className="gap-1">
                <MapPin className="h-3 w-3" />
                {selectedCountyName} County
                <button
                  onClick={() => setSelectedCountyFilter("all")}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {mpSearchTerm && (
              <Badge variant="secondary" className="gap-1">
                <Search className="h-3 w-3" />
                "{mpSearchTerm}"
                <button
                  onClick={() => setMpSearchTerm("")}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* MPs Grid */}
        {filteredMPs.length > 0 ? (
          <LeaderGrid
            leaders={filteredMPs}
            isLoading={false}
            onLeaderClick={setSelectedLeader}
          />
        ) : (
          <div className="text-center py-12 border rounded-xl bg-muted/30">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">No MPs found</p>
            <p className="text-muted-foreground">
              {selectedCountyFilter !== "all" || mpSearchTerm
                ? "Try adjusting your filters"
                : "No MPs in the database yet"}
            </p>
            {(selectedCountyFilter !== "all" || mpSearchTerm) && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </section>

      {/* County Leaders Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-secondary/30 flex items-center justify-center">
            <Users className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">County Leaders</h2>
            <p className="text-sm text-muted-foreground">Governors, Senators & Women Reps by county code (001-047)</p>
          </div>
        </div>

        <div className="space-y-6">
          {leadersByCounty.map(({ county, governor, senator, womenRep, mps }) => (
            <div key={county.id} className="border rounded-xl p-4 bg-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {String(county.code).padStart(3, '0')}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{county.name} County</h3>
                  <p className="text-xs text-muted-foreground">{county.capital} • {county.region}</p>
                </div>
                {mps.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCountyFilter(county.id)}
                    className="gap-1 text-xs"
                  >
                    <MapPin className="h-3 w-3" />
                    View {mps.length} MPs
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {governor ? (
                  <LeaderCard
                    leader={governor}
                    onClick={() => setSelectedLeader(governor)}
                    compact
                  />
                ) : (
                  <div className="p-3 rounded-lg bg-muted/50 text-center text-sm text-muted-foreground">
                    Governor: Data pending
                  </div>
                )}
                {senator ? (
                  <LeaderCard
                    leader={senator}
                    onClick={() => setSelectedLeader(senator)}
                    compact
                  />
                ) : (
                  <div className="p-3 rounded-lg bg-muted/50 text-center text-sm text-muted-foreground">
                    Senator: Data pending
                  </div>
                )}
                {womenRep ? (
                  <LeaderCard
                    leader={womenRep}
                    onClick={() => setSelectedLeader(womenRep)}
                    compact
                  />
                ) : (
                  <div className="p-3 rounded-lg bg-muted/50 text-center text-sm text-muted-foreground">
                    Women Rep: Data pending
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Legal Disclaimer */}
      <div className="text-center py-8 mt-8 border-t">
        <h3 className="text-sm font-semibold text-foreground mb-2">Legal Disclaimer</h3>
        <div className="text-sm text-muted-foreground max-w-2xl mx-auto space-y-1">
          <p>CivicLens aggregates publicly available civic information for educational and awareness purposes only.</p>
          <p>The platform does not make accusations, endorsements, or legal claims against any individual.</p>
          <p>All users are encouraged to verify information using official government sources.</p>
        </div>
      </div>

      <LeaderModal
        leader={selectedLeader}
        open={!!selectedLeader}
        onOpenChange={(open) => !open && setSelectedLeader(null)}
      />
    </Layout>
  );
}
