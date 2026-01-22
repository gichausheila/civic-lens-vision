import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useLeader } from "@/hooks/useLeaders";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Calendar, CheckCircle2, AlertTriangle, Award, Scale } from "lucide-react";
import { LeaderFeedback } from "@/components/feedback/LeaderFeedback";
import { ManifestoSection } from "@/components/leaders/ManifestoSection";
import { ParliamentaryActivity } from "@/components/leaders/ParliamentaryActivity";
// Placeholder performance actions
const placeholderPerformance = [
  { text: "Launched county health insurance program benefiting 50,000 households", date: "2023-08" },
  { text: "Completed construction of 3 new health centers", date: "2023-06" },
  { text: "Initiated water pipeline project covering 15 wards", date: "2023-04" },
  { text: "Disbursed education bursaries to 2,500 students", date: "2024-01" },
];

// Placeholder legal information
const placeholderLegalInfo = [
  { text: "No pending court cases as of record date", type: "clear" },
  { text: "Publicly declared assets as required by law", type: "clear" },
];

const LeaderProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { data: leader, isLoading } = useLeader(id);
  const [imageError, setImageError] = useState(false);

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-48 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (!leader) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Leader Not Found</h1>
          <Link to="/leaders" className="text-primary hover:underline">
            ← Back to Leaders
          </Link>
        </div>
      </Layout>
    );
  }

  const initials = leader.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const performance = leader.achievements?.length > 0 
    ? leader.achievements 
    : placeholderPerformance;

  return (
    <Layout>
      {/* Back Button */}
      <Link 
        to="/leaders" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Leaders
      </Link>

      {/* Section A: Overview */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Photo */}
            <div className="flex-shrink-0">
              {leader.photo_url && !imageError ? (
                <div className="relative group">
                  <img 
                    src={leader.photo_url} 
                    alt={leader.name}
                    className="h-32 w-32 rounded-xl object-cover"
                    onError={() => setImageError(true)}
                  />
                  {leader.photo_source && (
                    <a
                      href={leader.photo_source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] text-center py-0.5 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Photo source ↗
                    </a>
                  )}
                </div>
              ) : (
                <div className="h-32 w-32 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold">
                  {initials}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{leader.name}</h1>
                <p className="text-xl text-muted-foreground">{leader.position}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {leader.county && (
                  <Badge variant="secondary" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {leader.county.name} County
                  </Badge>
                )}
                {leader.party && (
                  <Badge variant="outline">{leader.party}</Badge>
                )}
                {leader.is_national && (
                  <Badge>National Leader</Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Term: 2022 - 2027 (Placeholder)</span>
              </div>

              {leader.bio && (
                <p className="text-muted-foreground mt-4">{leader.bio}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Section B: Manifesto & Policy Priorities */}
        <ManifestoSection leader={leader} />

        {/* Section C: Performance & Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Performance & Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {performance.map((item, index) => (
                <li key={index} className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm">{item.text}</p>
                    {item.date && (
                      <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Section D: Parliamentary Activity (for MPs/Senators) */}
      <ParliamentaryActivity leader={leader} />

      {/* Section E: Legal & Integrity Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Public Legal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4">
            {placeholderLegalInfo.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                {item.type === "clear" ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-foreground" />
                )}
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
          
          <Separator className="my-4" />
          
          <div className="p-4 rounded-lg bg-muted/30 border border-dashed">
            <p className="text-xs text-muted-foreground italic">
              <strong>Disclaimer:</strong> Information shown here is based on publicly available records and is for informational purposes only. CivicLens does not make any claims about the legal status of any individual.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Section E: Civic Feedback */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">💬</span>
            Citizen Feedback
            <Badge variant="outline" className="ml-2 text-xs font-normal">prototype feature</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LeaderFeedback leaderId={leader.id} leaderName={leader.name} />
        </CardContent>
      </Card>
    </Layout>
  );
};

export default LeaderProfile;
