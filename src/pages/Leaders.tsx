import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useLeaders } from "@/hooks/useLeaders";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import type { Leader } from "@/types/database";
import { Link } from "react-router-dom";

export default function Leaders() {
  const { data: leaders, isLoading } = useLeaders();
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [partyFilter, setPartyFilter] = useState<string>("all");

  // Get unique positions and parties for filters
  const positions = [...new Set(leaders?.map((l) => {
    if (l.position.includes("President")) return "President";
    if (l.position.includes("Governor")) return "Governor";
    if (l.position.includes("Senator")) return "Senator";
    if (l.position.includes("MP")) return "MP";
    if (l.position.includes("Women Rep")) return "Women Rep";
    if (l.position.includes("MCA")) return "MCA";
    return l.position;
  }) || [])].sort();

  const parties = [...new Set(leaders?.filter((l) => l.party).map((l) => l.party!) || [])].sort();

  // Filter leaders
  const filteredLeaders = leaders?.filter((leader) => {
    const matchesSearch = leader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leader.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leader.county?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPosition = positionFilter === "all" || leader.position.includes(positionFilter);
    const matchesParty = partyFilter === "all" || leader.party === partyFilter;

    return matchesSearch && matchesPosition && matchesParty;
  }) || [];

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Political Leaders</h1>
        <p className="text-muted-foreground">
          Explore profiles of elected officials across Kenya. Click on any leader to view their full profile.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, position, or county..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-4">
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {positions.map((pos) => (
                <SelectItem key={pos} value={pos}>{pos}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={partyFilter} onValueChange={setPartyFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Party" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Parties</SelectItem>
              {parties.map((party) => (
                <SelectItem key={party} value={party}>{party}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        Showing {filteredLeaders.length} of {leaders?.length || 0} leaders
      </p>

      {/* Leader Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
          ))
        ) : (
          filteredLeaders.map((leader) => (
            <Link key={leader.id} to={`/leader/${leader.id}`}>
              <LeaderCardSimple leader={leader} />
            </Link>
          ))
        )}
      </div>

      {filteredLeaders.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No leaders found matching your criteria.</p>
        </div>
      )}
    </Layout>
  );
}

// Simple leader card for the grid
function LeaderCardSimple({ leader }: { leader: Leader }) {
  const initials = leader.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="group cursor-pointer overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/50">
      {/* Photo Section */}
      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        {leader.photo_url ? (
          <img 
            src={leader.photo_url} 
            alt={leader.name}
            className="h-24 w-24 rounded-full object-cover border-4 border-background shadow-lg"
          />
        ) : (
          <div className="h-24 w-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold border-4 border-background shadow-lg">
            {initials}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {leader.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {leader.position}
        </p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {leader.county?.name || "National"}
          </span>
          {leader.party && (
            <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {leader.party}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
