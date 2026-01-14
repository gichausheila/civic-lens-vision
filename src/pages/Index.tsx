import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { LeaderGrid } from "@/components/leaders/LeaderGrid";
import { LeaderModal } from "@/components/leaders/LeaderModal";
import { useLeaders } from "@/hooks/useLeaders";
import type { Leader } from "@/types/database";
import { Eye, Users, MapPin } from "lucide-react";

const Index = () => {
  const { data: leaders, isLoading } = useLeaders();
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);

  return (
    <Layout>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Eye className="h-4 w-4" />
          Transparency in Governance
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          CivicLens
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your window into Kenyan counties and political leaders. Stay informed,
          share your voice, and hold leaders accountable.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-center">
          <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">47</p>
          <p className="text-sm text-muted-foreground">Counties</p>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 text-center">
          <Users className="h-8 w-8 text-secondary-foreground mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{leaders?.length || 0}</p>
          <p className="text-sm text-muted-foreground">Leaders</p>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 text-center">
          <span className="text-3xl mb-2 block">📊</span>
          <p className="text-2xl font-bold text-foreground">4</p>
          <p className="text-sm text-muted-foreground">Active Surveys</p>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-muted to-muted/50 text-center">
          <span className="text-3xl mb-2 block">💬</span>
          <p className="text-2xl font-bold text-foreground">Open</p>
          <p className="text-sm text-muted-foreground">Feedback</p>
        </div>
      </div>

      {/* Leaders Section */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Political Leaders
        </h2>
        <LeaderGrid
          leaders={leaders || []}
          isLoading={isLoading}
          onLeaderClick={setSelectedLeader}
        />
      </section>

      {/* Leader Modal */}
      <LeaderModal
        leader={selectedLeader}
        open={!!selectedLeader}
        onOpenChange={(open) => !open && setSelectedLeader(null)}
      />
    </Layout>
  );
};

export default Index;
