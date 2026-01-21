import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useLeaders } from "@/hooks/useLeaders";
import { useCounties } from "@/hooks/useCounties";
import { Eye, Users, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { data: leaders } = useLeaders();
  const { data: counties } = useCounties();

  return (
    <Layout>
      {/* Hero Section */}
      <div className="text-center py-16 md:py-24">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Eye className="h-4 w-4" />
          Civic Awareness Platform
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          CivicLens
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
          Clear insight into leadership, promises, and public accountability.
        </p>
        
        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="gap-2 text-lg px-8">
            <Link to="/leaders">
              <Users className="h-5 w-5" />
              Explore Leaders
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2 text-lg px-8">
            <Link to="/counties">
              <MapPin className="h-5 w-5" />
              Browse by County
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-center">
          <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-3xl font-bold text-foreground">{counties?.length || 47}</p>
          <p className="text-sm text-muted-foreground">Counties</p>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-secondary/30 to-secondary/10 text-center">
          <Users className="h-8 w-8 text-foreground mx-auto mb-2" />
          <p className="text-3xl font-bold text-foreground">{leaders?.length || 0}</p>
          <p className="text-sm text-muted-foreground">Leaders</p>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-muted to-muted/50 text-center">
          <span className="text-3xl mb-2 block">📋</span>
          <p className="text-3xl font-bold text-foreground">5</p>
          <p className="text-sm text-muted-foreground">Position Types</p>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 text-center">
          <span className="text-3xl mb-2 block">🗳️</span>
          <p className="text-3xl font-bold text-foreground">Open</p>
          <p className="text-sm text-muted-foreground">Feedback</p>
        </div>
      </div>

      {/* Features Preview */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <div className="p-6 rounded-xl border bg-card">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Leader Profiles</h3>
          <p className="text-muted-foreground text-sm">
            Access detailed profiles of political leaders including their manifesto promises, performance records, and public accountability information.
          </p>
        </div>
        <div className="p-6 rounded-xl border bg-card">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">County Explorer</h3>
          <p className="text-muted-foreground text-sm">
            Browse leaders by county to discover your Governor, Senators, Members of Parliament, and MCAs representing your region.
          </p>
        </div>
        <div className="p-6 rounded-xl border bg-card">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <Eye className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Civic Feedback</h3>
          <p className="text-muted-foreground text-sm">
            Rate leaders and share your feedback as a citizen. Your voice contributes to public accountability and informed civic participation.
          </p>
        </div>
      </div>

      {/* Neutral Disclaimer */}
      <div className="text-center py-8 border-t">
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          CivicLens is a non-partisan civic education platform. We do not endorse any political party or candidate. 
          Our goal is to promote transparency and informed civic participation.
        </p>
      </div>
    </Layout>
  );
};

export default Index;
