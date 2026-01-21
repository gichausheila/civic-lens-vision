import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { LeaderGrid } from "@/components/leaders/LeaderGrid";
import { LeaderModal } from "@/components/leaders/LeaderModal";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchLeaders } from "@/hooks/useLeaders";
import { useCounties } from "@/hooks/useCounties";
import type { Leader } from "@/types/database";
import { Search as SearchIcon, Users, MapPin, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("leaders");
  const { data: leaders, isLoading: leadersLoading } = useSearchLeaders(searchTerm);
  const { data: counties } = useCounties();
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);

  // Filter counties based on search
  const filteredCounties = counties?.filter((county) =>
    county.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    county.capital?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Placeholder laws/constitution data
  const civicDocuments = [
    { id: "1", title: "Constitution of Kenya 2010", type: "constitution", description: "The supreme law of the Republic of Kenya" },
    { id: "2", title: "County Governments Act 2012", type: "law", description: "An act to provide for county governments' powers and functions" },
    { id: "3", title: "Public Finance Management Act 2012", type: "law", description: "An act to provide for the effective management of public finances" },
    { id: "4", title: "Elections Act 2011", type: "law", description: "An act to provide for the conduct of elections to various elective positions" },
    { id: "5", title: "Leadership and Integrity Act 2012", type: "law", description: "An act to establish procedures and mechanisms for the enforcement of Chapter Six of the Constitution" },
  ];

  const filteredDocs = civicDocuments.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Search</h1>
        <p className="text-muted-foreground mb-6">
          Search for political leaders, counties, laws, or the constitution
        </p>

        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search leaders, counties, laws..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="leaders" className="gap-2">
            <Users className="h-4 w-4" />
            Leaders ({leaders?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="counties" className="gap-2">
            <MapPin className="h-4 w-4" />
            Counties ({filteredCounties.length})
          </TabsTrigger>
          <TabsTrigger value="laws" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Laws & Constitution ({filteredDocs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaders">
          <LeaderGrid
            leaders={leaders || []}
            isLoading={leadersLoading}
            onLeaderClick={setSelectedLeader}
          />
          {!leadersLoading && leaders?.length === 0 && searchTerm && (
            <div className="text-center py-12 text-muted-foreground">
              No leaders found matching "{searchTerm}"
            </div>
          )}
        </TabsContent>

        <TabsContent value="counties">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCounties.map((county) => (
              <Link key={county.id} to={`/counties`}>
                <Card className="hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {String(county.code).padStart(3, '0')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{county.name}</h3>
                        <p className="text-sm text-muted-foreground">{county.capital || "Capital N/A"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {filteredCounties.length === 0 && searchTerm && (
            <div className="text-center py-12 text-muted-foreground">
              No counties found matching "{searchTerm}"
            </div>
          )}
        </TabsContent>

        <TabsContent value="laws">
          <div className="space-y-4">
            {filteredDocs.map((doc) => (
              <Link key={doc.id} to="/civic-facts">
                <Card className="hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{doc.description}</p>
                    <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">
                      {doc.type}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {filteredDocs.length === 0 && searchTerm && (
            <div className="text-center py-12 text-muted-foreground">
              No laws or documents found matching "{searchTerm}"
            </div>
          )}
        </TabsContent>
      </Tabs>

      <LeaderModal
        leader={selectedLeader}
        open={!!selectedLeader}
        onOpenChange={(open) => !open && setSelectedLeader(null)}
      />
    </Layout>
  );
}
