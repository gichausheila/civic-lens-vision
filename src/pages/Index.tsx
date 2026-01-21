import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useRandomLeaders } from "@/hooks/useLeaders";
import { useCounties } from "@/hooks/useCounties";
import { Eye, Users, MapPin, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { LeaderGrid } from "@/components/leaders/LeaderGrid";
import { LeaderModal } from "@/components/leaders/LeaderModal";
import { useState } from "react";
import type { Leader } from "@/types/database";

const Index = () => {
  const { data: leaders, isLoading, refetch, isFetching } = useRandomLeaders(12);
  const { data: counties } = useCounties();
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);

  return (
    <Layout>
      {/* Hero Section */}
      <div className="text-center py-12 md:py-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Eye className="h-4 w-4" />
          Civic Awareness Platform
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
          CivicLens
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Clear insight into leadership, promises, and public accountability.
        </p>
        
        {/* Quick Stats */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="font-semibold">{counties?.length || 47}</span> Counties
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5 text-primary" />
            <span className="font-semibold">{leaders?.length || 0}+</span> Leaders
          </div>
        </div>
      </div>

      {/* Random Leaders Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Explore Leaders</h2>
            <p className="text-muted-foreground text-sm">
              Randomly selected leaders from across Kenya
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Shuffle
          </Button>
        </div>

        <LeaderGrid
          leaders={leaders || []}
          isLoading={isLoading}
          onLeaderClick={setSelectedLeader}
        />

        <div className="text-center mt-8">
          <Button asChild>
            <Link to="/leaders">View All Leaders</Link>
          </Button>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="text-center py-8 border-t">
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
};

export default Index;
