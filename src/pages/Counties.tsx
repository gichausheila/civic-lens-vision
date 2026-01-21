import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useCounties } from "@/hooks/useCounties";
import { useLeaders } from "@/hooks/useLeaders";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Users, ChevronRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import type { County, Leader } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// County landmark data with Wikipedia images
const countyLandmarks: Record<number, { name: string; imageUrl: string; wikiUrl: string }> = {
  1: { name: "Mombasa Old Town", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Fort_Jesus_Mombasa_panoramic.jpg/320px-Fort_Jesus_Mombasa_panoramic.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Fort_Jesus" },
  2: { name: "Watamu Beach", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Watamu_Beach_02.jpg/320px-Watamu_Beach_02.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Watamu" },
  3: { name: "Kilifi Creek", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Kilifi_Bridge.jpg/320px-Kilifi_Bridge.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Kilifi" },
  4: { name: "Vasco da Gama Pillar", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Vasco_da_Gama_Pillar_Malindi.jpg/320px-Vasco_da_Gama_Pillar_Malindi.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Malindi" },
  5: { name: "Tana River Delta", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Tana_River_Kenya.jpg/320px-Tana_River_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Tana_River" },
  6: { name: "Lamu Old Town", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Lamu_Town.jpg/320px-Lamu_Town.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Lamu_Old_Town" },
  7: { name: "Taita Hills", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Taita_Hills.jpg/320px-Taita_Hills.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Taita_Hills" },
  8: { name: "Garissa Town", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Garissa_Town.jpg/320px-Garissa_Town.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Garissa" },
  9: { name: "Wajir Town", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Wajir.jpg/320px-Wajir.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Wajir" },
  10: { name: "Mandera Town", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Mandera.jpg/320px-Mandera.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Mandera" },
  11: { name: "Marsabit National Park", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Marsabit_Forest.jpg/320px-Marsabit_Forest.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Marsabit_National_Park" },
  12: { name: "Isiolo Town", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Isiolo_Town.jpg/320px-Isiolo_Town.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Isiolo" },
  13: { name: "Meru National Park", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Meru_National_Park_Kenya.jpg/320px-Meru_National_Park_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Meru_National_Park" },
  14: { name: "Tharaka Nithi Hills", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Chuka_Town.jpg/320px-Chuka_Town.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Tharaka-Nithi_County" },
  15: { name: "Embu Town", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Embu_Kenya.jpg/320px-Embu_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Embu,_Kenya" },
  16: { name: "Kitui Town", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Kitui_Town.jpg/320px-Kitui_Town.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Kitui" },
  17: { name: "Machakos Town", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Machakos.jpg/320px-Machakos.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Machakos" },
  18: { name: "Makueni Hills", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Makueni_County.jpg/320px-Makueni_County.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Makueni_County" },
  19: { name: "Nyandarua Hills", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Aberdare_Ranges.jpg/320px-Aberdare_Ranges.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Nyandarua_County" },
  20: { name: "Nyeri Town", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Nyeri_Town.jpg/320px-Nyeri_Town.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Nyeri" },
  21: { name: "Mount Kenya", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Mount_Kenya.jpg/320px-Mount_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Mount_Kenya" },
  22: { name: "Murang'a Town", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Muranga_Town.jpg/320px-Muranga_Town.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Murang%27a" },
  23: { name: "Kiambu Town", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Kiambu_Town.jpg/320px-Kiambu_Town.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Kiambu" },
  24: { name: "Turkana Lake", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Lake_Turkana.jpg/320px-Lake_Turkana.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Lake_Turkana" },
  25: { name: "Kapenguria Town", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Kapenguria.jpg/320px-Kapenguria.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Kapenguria" },
  26: { name: "Samburu Reserve", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Samburu_National_Reserve.jpg/320px-Samburu_National_Reserve.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Samburu_National_Reserve" },
  27: { name: "Trans-Nzoia Plains", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Kitale_Town.jpg/320px-Kitale_Town.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Trans-Nzoia_County" },
  28: { name: "Eldoret Town", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Eldoret.jpg/320px-Eldoret.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Eldoret" },
  29: { name: "Elgeyo Marakwet Escarpment", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Kerio_Valley.jpg/320px-Kerio_Valley.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Elgeyo-Marakwet_County" },
  30: { name: "Nandi Hills", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Nandi_Hills_Kenya.jpg/320px-Nandi_Hills_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Nandi_Hills" },
  31: { name: "Baringo Lake", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Lake_Baringo.jpg/320px-Lake_Baringo.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Lake_Baringo" },
  32: { name: "Laikipia Plateau", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Laikipia_Plateau.jpg/320px-Laikipia_Plateau.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Laikipia" },
  33: { name: "Lake Nakuru", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Lake_Nakuru_Flamingos.jpg/320px-Lake_Nakuru_Flamingos.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Lake_Nakuru" },
  34: { name: "Lake Naivasha", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Lake_Naivasha.jpg/320px-Lake_Naivasha.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Lake_Naivasha" },
  35: { name: "Kericho Tea Fields", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Tea_plantation_in_Kericho.jpg/320px-Tea_plantation_in_Kericho.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Kericho" },
  36: { name: "Bomet Town", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Bomet_Town.jpg/320px-Bomet_Town.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Bomet" },
  37: { name: "Kakamega Forest", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Kakamega_Forest.jpg/320px-Kakamega_Forest.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Kakamega_Forest" },
  38: { name: "Vihiga Hills", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/v/v8/Vihiga_County.jpg/320px-Vihiga_County.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Vihiga_County" },
  39: { name: "Bungoma Town", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Bungoma.jpg/320px-Bungoma.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Bungoma" },
  40: { name: "Busia Border", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Busia_Border.jpg/320px-Busia_Border.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Busia,_Kenya" },
  41: { name: "Siaya Town", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/s/s1/Siaya_Town.jpg/320px-Siaya_Town.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Siaya" },
  42: { name: "Kisumu Lakefront", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/k/k2/Kisumu_Port.jpg/320px-Kisumu_Port.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Kisumu" },
  43: { name: "Homa Bay", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/h/h4/Homa_Bay.jpg/320px-Homa_Bay.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Homa_Bay" },
  44: { name: "Migori Town", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/m/m3/Migori.jpg/320px-Migori.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Migori" },
  45: { name: "Kisii Town", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/k/k5/Kisii_Town.jpg/320px-Kisii_Town.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Kisii_Town" },
  46: { name: "Nyamira Hills", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/n/n6/Nyamira.jpg/320px-Nyamira.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Nyamira" },
  47: { name: "Nairobi City", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Nairobi_view.jpg/320px-Nairobi_view.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Nairobi" },
};

const Counties = () => {
  const { data: counties, isLoading: loadingCounties } = useCounties();
  const { data: leaders } = useLeaders();
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);

  // Sort counties by code
  const sortedCounties = [...(counties || [])].sort((a, b) => a.code - b.code);

  // Get leaders for selected county
  const getCountyLeaders = (countyId: string) => {
    return leaders?.filter((l) => l.county_id === countyId) || [];
  };

  const countyLeaders = selectedCounty ? getCountyLeaders(selectedCounty.id) : [];

  // Group leaders by position
  const groupLeaders = (leadersList: Leader[]) => {
    const governor = leadersList.find((l) => l.position.includes("Governor"));
    const senator = leadersList.find((l) => l.position.includes("Senator"));
    const womenRep = leadersList.find((l) => l.position.includes("Women Rep"));
    const mps = leadersList.filter((l) => l.position.includes("MP"));
    return { governor, senator, womenRep, mps };
  };

  const { governor, senator, womenRep, mps } = groupLeaders(countyLeaders);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Counties of Kenya</h1>
        <p className="text-muted-foreground">
          All 47 counties listed by county code (001-047). Click to view county leaders.
        </p>
      </div>

      {/* Counties Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loadingCounties ? (
          Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))
        ) : (
          sortedCounties.map((county) => {
            const leaderCount = leaders?.filter((l) => l.county_id === county.id).length || 0;
            const landmark = countyLandmarks[county.code];

            return (
              <Card
                key={county.id}
                className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all duration-200 overflow-hidden"
                onClick={() => setSelectedCounty(county)}
              >
                {/* Landmark Image */}
                <div className="relative h-32 bg-gradient-to-br from-primary/20 to-secondary/20">
                  {landmark?.imageUrl ? (
                    <img
                      src={landmark.imageUrl}
                      alt={landmark.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-background/90 backdrop-blur px-2 py-1 rounded text-sm font-bold text-primary">
                    {String(county.code).padStart(3, '0')}
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{county.name}</h3>
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

                  {/* Wikipedia Link */}
                  {landmark?.wikiUrl && (
                    <a
                      href={landmark.wikiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 text-xs text-primary hover:underline flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3 w-3" />
                      {landmark.name} - Wikipedia
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* County Leaders Modal */}
      <Dialog open={!!selectedCounty} onOpenChange={(open) => !open && setSelectedCounty(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {selectedCounty && String(selectedCounty.code).padStart(3, '0')}
                </span>
              </div>
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
            <div className="space-y-4">
              {governor && (
                <LeaderRow leader={governor} position="Governor" onClose={() => setSelectedCounty(null)} />
              )}
              {senator && (
                <LeaderRow leader={senator} position="Senator" onClose={() => setSelectedCounty(null)} />
              )}
              {womenRep && (
                <LeaderRow leader={womenRep} position="Women Representative" onClose={() => setSelectedCounty(null)} />
              )}
              {mps.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2 uppercase tracking-wide">
                    Members of Parliament ({mps.length})
                  </h4>
                  <div className="space-y-2">
                    {mps.map((mp) => (
                      <LeaderRow key={mp.id} leader={mp} onClose={() => setSelectedCounty(null)} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

function LeaderRow({ leader, position, onClose }: { leader: Leader; position?: string; onClose: () => void }) {
  return (
    <Link
      to={`/leader/${leader.id}`}
      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
      onClick={onClose}
    >
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
        {leader.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
      </div>
      <div className="flex-1">
        <p className="font-medium">{leader.name}</p>
        <p className="text-sm text-muted-foreground">{position || leader.position}</p>
      </div>
      {leader.party && (
        <Badge variant="outline" className="text-xs">{leader.party}</Badge>
      )}
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

export default Counties;
