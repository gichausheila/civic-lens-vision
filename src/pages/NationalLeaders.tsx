import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { LeaderModal } from "@/components/leaders/LeaderModal";
import { NationalLeaderCard } from "@/components/leaders/NationalLeaderCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useLeaders } from "@/hooks/useLeaders";
import type { Leader } from "@/types/database";
import { Crown, Users, Building2 } from "lucide-react";

export default function NationalLeaders() {
  const { data: leaders = [], isLoading } = useLeaders();
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);

  const nationalLeaders = leaders.filter((leader) => leader.is_national);
  
  // Separate by position for better organization
  const president = nationalLeaders.find((l) => 
    l.position.toLowerCase().includes("president") && 
    !l.position.toLowerCase().includes("deputy") &&
    !l.position.toLowerCase().includes("cabinet")
  );
  
  const deputyPresident = nationalLeaders.find((l) => 
    l.position.toLowerCase().includes("deputy president")
  );
  
  const primeCS = nationalLeaders.find((l) => 
    l.position.toLowerCase().includes("prime cabinet")
  );
  
  const cabinetSecretaries = nationalLeaders.filter((l) => 
    l.position.toLowerCase().includes("cabinet secretary") && 
    !l.position.toLowerCase().includes("prime") &&
    l.id !== deputyPresident?.id
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-1">
            <Crown className="h-3 w-3 mr-1" />
            Executive Branch
          </Badge>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            National Leadership
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Meet Kenya's executive leadership including the President, Deputy President, 
            and Cabinet Secretaries who serve the nation.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* President & Deputy President Section */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Crown className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">Head of State</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {president && (
                  <NationalLeaderCard
                    leader={president}
                    variant="featured"
                    onClick={() => setSelectedLeader(president)}
                  />
                )}
                {deputyPresident && (
                  <NationalLeaderCard
                    leader={deputyPresident}
                    variant="featured"
                    onClick={() => setSelectedLeader(deputyPresident)}
                  />
                )}
              </div>
            </section>

            {/* Prime Cabinet Secretary */}
            {primeCS && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-semibold">Prime Cabinet Secretary</h2>
                </div>
                <div className="max-w-md mx-auto">
                  <NationalLeaderCard
                    leader={primeCS}
                    variant="featured"
                    onClick={() => setSelectedLeader(primeCS)}
                  />
                </div>
              </section>
            )}

            {/* Cabinet Secretaries Section */}
            {cabinetSecretaries.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-semibold">Cabinet Secretaries</h2>
                  <Badge variant="secondary" className="ml-2">
                    {cabinetSecretaries.length} Members
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {cabinetSecretaries.map((leader) => (
                    <NationalLeaderCard
                      key={leader.id}
                      leader={leader}
                      variant="compact"
                      onClick={() => setSelectedLeader(leader)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <LeaderModal
          leader={selectedLeader}
          open={!!selectedLeader}
          onOpenChange={(open) => !open && setSelectedLeader(null)}
        />
      </div>
    </Layout>
  );
}
