import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useLeaders } from "@/hooks/useLeaders";
import { useCounties } from "@/hooks/useCounties";
import { Skeleton } from "@/components/ui/skeleton";
import { LeaderModal } from "@/components/leaders/LeaderModal";
import { NationalLeaderCard } from "@/components/leaders/NationalLeaderCard";
import { LeaderCard } from "@/components/leaders/LeaderCard";
import type { Leader } from "@/types/database";
import { Landmark, Users, Crown, Building2 } from "lucide-react";

export default function Leaders() {
  const { data: leaders, isLoading } = useLeaders();
  const { data: counties } = useCounties();
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);

  // Separate national and county leaders
  const nationalLeaders = leaders?.filter((l) => l.is_national) || [];
  const countyLeaders = leaders?.filter((l) => !l.is_national) || [];

  // National hierarchy
  const president = nationalLeaders.find((l) => l.position.includes("President") && !l.position.includes("Deputy"));
  const deputyPresident = nationalLeaders.find((l) => l.position.includes("Deputy President"));
  const primeCS = nationalLeaders.find((l) => l.position.includes("Prime Cabinet Secretary"));
  const cabinetSecretaries = nationalLeaders.filter((l) => 
    l.position.includes("Cabinet Secretary") && !l.position.includes("Prime")
  ).sort((a, b) => a.name.localeCompare(b.name));

  // Sort counties by code
  const sortedCounties = [...(counties || [])].sort((a, b) => a.code - b.code);

  // Group county leaders by county
  const leadersByCounty = sortedCounties.map((county) => {
    const countyLeadersList = countyLeaders.filter((l) => l.county_id === county.id);
    const governor = countyLeadersList.find((l) => l.position.includes("Governor"));
    const senator = countyLeadersList.find((l) => l.position.includes("Senator"));
    const womenRep = countyLeadersList.find((l) => l.position.includes("Women Rep"));
    const mps = countyLeadersList.filter((l) => l.position.includes("MP"));
    const mcas = countyLeadersList.filter((l) => l.position.includes("MCA"));

    return {
      county,
      governor,
      senator,
      womenRep,
      mps,
      mcas,
      hasLeaders: countyLeadersList.length > 0,
    };
  });

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

      {/* County Leaders Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-secondary/30 flex items-center justify-center">
            <Users className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">County Leaders</h2>
            <p className="text-sm text-muted-foreground">Governors by county code (001-047)</p>
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
                <div>
                  <h3 className="font-semibold text-foreground">{county.name} County</h3>
                  <p className="text-xs text-muted-foreground">{county.capital} • {county.region}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                {mps.length > 0 ? (
                  <div className="p-3 rounded-lg bg-muted/30 text-center text-sm">
                    <span className="font-medium">{mps.length}</span> MPs
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-muted/50 text-center text-sm text-muted-foreground">
                    MPs: Data pending
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
