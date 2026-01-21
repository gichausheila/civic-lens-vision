import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useCounties } from "@/hooks/useCounties";
import { useLeaders } from "@/hooks/useLeaders";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, MapPin, Users, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { County, Leader } from "@/types/database";

const Counties = () => {
  const { data: counties, isLoading: loadingCounties } = useCounties();
  const { data: leaders } = useLeaders();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);

  const filteredCounties = counties?.filter((county) =>
    county.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    county.capital?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    county.region?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Get leaders for selected county
  const getCountyLeaders = (countyId: string) => {
    return leaders?.filter((l) => l.county_id === countyId) || [];
  };

  // Group leaders by position type
  const groupLeadersByPosition = (leadersList: Leader[]) => {
    const groups: Record<string, Leader[]> = {
      Governor: [],
      Senator: [],
      "Members of Parliament": [],
      "Women Rep": [],
      MCA: [],
      Other: [],
    };

    leadersList.forEach((leader) => {
      if (leader.position.includes("Governor")) {
        groups.Governor.push(leader);
      } else if (leader.position.includes("Senator")) {
        groups.Senator.push(leader);
      } else if (leader.position.includes("MP")) {
        groups["Members of Parliament"].push(leader);
      } else if (leader.position.includes("Women Rep")) {
        groups["Women Rep"].push(leader);
      } else if (leader.position.includes("MCA")) {
        groups.MCA.push(leader);
      } else {
        groups.Other.push(leader);
      }
    });

    return groups;
  };

  const countyLeaders = selectedCounty ? getCountyLeaders(selectedCounty.id) : [];
  const groupedLeaders = groupLeadersByPosition(countyLeaders);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Browse by County</h1>
        <p className="text-muted-foreground">
          Select a county to view its elected leaders including Governors, Senators, and MPs.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search counties by name, capital, or region..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Counties Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loadingCounties ? (
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))
        ) : (
          filteredCounties.map((county) => {
            const leaderCount = leaders?.filter((l) => l.county_id === county.id).length || 0;
            
            return (
              <Card 
                key={county.id}
                className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200"
                onClick={() => setSelectedCounty(county)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold">{county.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{county.capital || "Capital N/A"}</p>
                      {county.region && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {county.region}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {leaderCount}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {filteredCounties.length === 0 && !loadingCounties && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No counties found matching "{searchTerm}"</p>
        </div>
      )}

      {/* County Leaders Modal */}
      <Dialog open={!!selectedCounty} onOpenChange={(open) => !open && setSelectedCounty(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {selectedCounty?.name} County Leaders
            </DialogTitle>
          </DialogHeader>

          {countyLeaders.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No leaders found for this county.</p>
              <p className="text-sm">Leader data will be added soon.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedLeaders).map(([position, positionLeaders]) => {
                if (positionLeaders.length === 0) return null;
                
                return (
                  <div key={position}>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">
                      {position} ({positionLeaders.length})
                    </h3>
                    <div className="space-y-2">
                      {positionLeaders.map((leader) => (
                        <Link
                          key={leader.id}
                          to={`/leader/${leader.id}`}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          onClick={() => setSelectedCounty(null)}
                        >
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                            {leader.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{leader.name}</p>
                            <p className="text-sm text-muted-foreground">{leader.position}</p>
                          </div>
                          {leader.party && (
                            <Badge variant="outline" className="text-xs">{leader.party}</Badge>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Counties;
