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

// County landmark data with actual Wikipedia Commons images
const countyLandmarks: Record<number, { name: string; imageUrl: string; wikiUrl: string }> = {
  1: { name: "Fort Jesus", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Fort_Jesus%2C_Mombasa.jpg/320px-Fort_Jesus%2C_Mombasa.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Mombasa" },
  2: { name: "Arabuko-Sokoke Forest", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Arabuko_Sokoke_Forest_Reserve.jpg/320px-Arabuko_Sokoke_Forest_Reserve.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Kwale_County" },
  3: { name: "Kilifi Creek Bridge", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Kilifi_Creek.jpg/320px-Kilifi_Creek.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Kilifi" },
  4: { name: "Vasco da Gama Pillar", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Vasco_da_Gama_pillar_Malindi.jpg/320px-Vasco_da_Gama_pillar_Malindi.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Malindi" },
  5: { name: "Tana River", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Tana_River_Delta.jpg/320px-Tana_River_Delta.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Tana_River_County" },
  6: { name: "Lamu Old Town", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Lamu_Old_Town_Street.jpg/320px-Lamu_Old_Town_Street.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Lamu" },
  7: { name: "Taita Hills", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Taita_Hills_from_Tsavo.jpg/320px-Taita_Hills_from_Tsavo.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Taita-Taveta_County" },
  8: { name: "Garissa Town", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Garissa_Town_Centre.jpg/320px-Garissa_Town_Centre.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Garissa" },
  9: { name: "Wajir", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Wajir_County.jpg/320px-Wajir_County.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Wajir_County" },
  10: { name: "Mandera", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Mandera_Town.jpg/320px-Mandera_Town.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Mandera_County" },
  11: { name: "Marsabit National Park", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Marsabit_National_Park_landscape.jpg/320px-Marsabit_National_Park_landscape.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Marsabit_National_Park" },
  12: { name: "Isiolo", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Isiolo_Town_Kenya.jpg/320px-Isiolo_Town_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Isiolo_County" },
  13: { name: "Meru National Park", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Meru_National_Park%2C_Kenya.jpg/320px-Meru_National_Park%2C_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Meru_National_Park" },
  14: { name: "Chuka", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Tharaka_Nithi_County.jpg/320px-Tharaka_Nithi_County.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Tharaka-Nithi_County" },
  15: { name: "Embu Town", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Embu_Town_Kenya.jpg/320px-Embu_Town_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Embu,_Kenya" },
  16: { name: "Kitui", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Kitui_Town_Centre.jpg/320px-Kitui_Town_Centre.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Kitui_County" },
  17: { name: "Machakos", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Machakos_Town.jpg/320px-Machakos_Town.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Machakos" },
  18: { name: "Makueni", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Makueni_County_Kenya.jpg/320px-Makueni_County_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Makueni_County" },
  19: { name: "Aberdare Ranges", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Aberdare_Range_Kenya.jpg/320px-Aberdare_Range_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Nyandarua_County" },
  20: { name: "Nyeri Town", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Nyeri_Town_Kenya.jpg/320px-Nyeri_Town_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Nyeri" },
  21: { name: "Mount Kenya", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Mount_Kenya.jpg/320px-Mount_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Mount_Kenya" },
  22: { name: "Murang'a", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Muranga_Town_Kenya.jpg/320px-Muranga_Town_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Murang%27a" },
  23: { name: "Kiambu", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Kiambu_Town_Kenya.jpg/320px-Kiambu_Town_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Kiambu_County" },
  24: { name: "Lake Turkana", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Lake_Turkana_sunset.jpg/320px-Lake_Turkana_sunset.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Lake_Turkana" },
  25: { name: "Kapenguria", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Kapenguria_Museum.jpg/320px-Kapenguria_Museum.jpg", wikiUrl: "https://en.wikipedia.org/wiki/West_Pokot_County" },
  26: { name: "Samburu Reserve", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Samburu_landscape.jpg/320px-Samburu_landscape.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Samburu_National_Reserve" },
  27: { name: "Kitale", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Kitale_Town_Kenya.jpg/320px-Kitale_Town_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Kitale" },
  28: { name: "Eldoret", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Eldoret_Town_Kenya.jpg/320px-Eldoret_Town_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Eldoret" },
  29: { name: "Kerio Valley", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Kerio_Valley_Kenya.jpg/320px-Kerio_Valley_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Elgeyo-Marakwet_County" },
  30: { name: "Nandi Hills", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Nandi_Hills.jpg/320px-Nandi_Hills.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Nandi_County" },
  31: { name: "Lake Baringo", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Lake_Baringo_Kenya.jpg/320px-Lake_Baringo_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Lake_Baringo" },
  32: { name: "Laikipia Plateau", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Laikipia_Plateau_Kenya.jpg/320px-Laikipia_Plateau_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Laikipia_County" },
  33: { name: "Lake Nakuru", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Lake_Nakuru_Flamingoes.jpg/320px-Lake_Nakuru_Flamingoes.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Lake_Nakuru" },
  34: { name: "Lake Naivasha", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Lake_Naivasha_Kenya.jpg/320px-Lake_Naivasha_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Lake_Naivasha" },
  35: { name: "Kericho Tea Fields", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Tea_plantations_in_Kericho.jpg/320px-Tea_plantations_in_Kericho.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Kericho" },
  36: { name: "Bomet", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Bomet_County_Kenya.jpg/320px-Bomet_County_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Bomet_County" },
  37: { name: "Kakamega Forest", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Kakamega_Forest_Kenya.jpg/320px-Kakamega_Forest_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Kakamega_Forest" },
  38: { name: "Vihiga", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Vihiga_County_Kenya.jpg/320px-Vihiga_County_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Vihiga_County" },
  39: { name: "Bungoma", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Bungoma_Town_Kenya.jpg/320px-Bungoma_Town_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Bungoma" },
  40: { name: "Busia Border", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Busia_Border_Kenya.jpg/320px-Busia_Border_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Busia,_Kenya" },
  41: { name: "Siaya", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Siaya_Town_Kenya.jpg/320px-Siaya_Town_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Siaya_County" },
  42: { name: "Kisumu Lakefront", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Kisumu_waterfront.jpg/320px-Kisumu_waterfront.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Kisumu" },
  43: { name: "Homa Bay", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Homa_Bay_Kenya.jpg/320px-Homa_Bay_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Homa_Bay_County" },
  44: { name: "Migori", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Migori_Town_Kenya.jpg/320px-Migori_Town_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Migori_County" },
  45: { name: "Kisii", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Kisii_Town_Kenya.jpg/320px-Kisii_Town_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Kisii,_Kenya" },
  46: { name: "Nyamira", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Nyamira_County_Kenya.jpg/320px-Nyamira_County_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Nyamira_County" },
  47: { name: "Nairobi Skyline", imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Nairobi%2C_Kenya.jpg/320px-Nairobi%2C_Kenya.jpg", wikiUrl: "https://en.wikipedia.org/wiki/Nairobi" },
};

// Fallback placeholder image
const FALLBACK_IMAGE = "/placeholder.svg";

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
                  <img
                    src={landmark?.imageUrl || FALLBACK_IMAGE}
                    alt={landmark?.name || county.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== FALLBACK_IMAGE) {
                        target.src = FALLBACK_IMAGE;
                      }
                    }}
                  />
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
                      <LeaderRow key={mp.id} leader={mp} onClose={() => setSelectedCounty(null)} countyName={selectedCounty?.name} />
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

function LeaderRow({ leader, position, onClose, countyName }: { leader: Leader; position?: string; onClose: () => void; countyName?: string }) {
  const initials = leader.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  
  // Parse constituency from position for MPs (e.g., "MP - Westlands" -> "Westlands Constituency")
  const getConstituency = () => {
    if (leader.position.startsWith("MP - ")) {
      const constituencyName = leader.position.replace("MP - ", "");
      if (constituencyName === "Nominated") return null;
      return constituencyName;
    }
    return null;
  };
  
  const constituency = getConstituency();
  
  // Generate parliament website search link based on position
  const getParliamentLink = () => {
    if (leader.position.includes("Senator")) {
      return "http://www.parliament.go.ke/the-senate/senators";
    } else if (leader.position.includes("MP") || leader.position.includes("Women Rep")) {
      return "http://www.parliament.go.ke/the-national-assembly/members";
    }
    return "http://www.parliament.go.ke";
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      {/* Photo with fallback */}
      <div className="flex flex-col items-center gap-1">
        <div className="h-12 w-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
          {leader.photo_url ? (
            <img 
              src={leader.photo_url} 
              alt={leader.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <span className={`text-sm font-semibold text-primary ${leader.photo_url ? 'hidden' : ''}`}>
            {initials}
          </span>
        </div>
        <a
          href={getParliamentLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-2.5 w-2.5" />
          Parliament
        </a>
      </div>
      
      {/* Leader info - clickable to profile */}
      <Link
        to={`/leader/${leader.id}`}
        className="flex-1 hover:text-primary transition-colors"
        onClick={onClose}
      >
        <p className="font-medium">{leader.name}</p>
        <p className="text-sm text-muted-foreground">{position || leader.position}</p>
        {/* Show constituency and county for MPs */}
        {constituency && (
          <p className="text-xs text-primary/80 flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3" />
            {constituency} Constituency{countyName && `, ${countyName} County`}
          </p>
        )}
      </Link>
      
      {leader.party && (
        <Badge variant="outline" className="text-xs">{leader.party}</Badge>
      )}
      
      <Link to={`/leader/${leader.id}`} onClick={onClose}>
        <ChevronRight className="h-4 w-4 text-muted-foreground hover:text-primary" />
      </Link>
    </div>
  );
}

export default Counties;
