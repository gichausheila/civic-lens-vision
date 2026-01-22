import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MessageSquare, 
  Vote, 
  Users, 
  ExternalLink, 
  RefreshCw,
  Info,
  BookOpen
} from "lucide-react";
import { 
  scrapeCommittees, 
  PARLIAMENT_URLS,
  showsParliamentaryActivity,
  type Committee 
} from "@/lib/api/parliament";
import type { Leader } from "@/types/database";

interface ParliamentaryActivityProps {
  leader: Leader;
}

export function ParliamentaryActivity({ leader }: ParliamentaryActivityProps) {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScraped, setLastScraped] = useState<string | null>(null);

  const shouldShow = showsParliamentaryActivity(leader.position);

  const loadCommittees = async () => {
    if (!shouldShow) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await scrapeCommittees();
      if (result.success && result.data) {
        setCommittees(result.data.committees);
        setLastScraped(result.data.scrapedAt);
      } else {
        setError(result.error || 'Failed to load committees');
      }
    } catch (err) {
      setError('Failed to fetch committee data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load committees on mount
  useEffect(() => {
    if (shouldShow) {
      loadCommittees();
    }
  }, [shouldShow]);

  // Only render for MPs and Senators
  if (!shouldShow) {
    return null;
  }

  const resources = [
    {
      icon: MessageSquare,
      title: "Hansard (Speeches)",
      description: "Verbatim record of everything said on the Parliament floor. If your MP made a promise in Parliament, it's documented here.",
      url: PARLIAMENT_URLS.hansard,
      colorClass: "text-primary",
      bgClass: "bg-primary/5",
    },
    {
      icon: Vote,
      title: "Bills Tracker & Votes",
      description: "See how your MP voted on crucial laws like the Finance Bill or health reforms. Compare their actions to their public statements.",
      url: PARLIAMENT_URLS.billsTracker,
      colorClass: "text-primary",
      bgClass: "bg-secondary/30",
    },
    {
      icon: Users,
      title: "Committee Membership",
      description: "Most real legislative work happens in committees. Check which committees your MP sits on and their level of activity.",
      url: PARLIAMENT_URLS.committees,
      colorClass: "text-primary",
      bgClass: "bg-accent/30",
    },
  ];

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Parliamentary Activity
          <Badge variant="outline" className="ml-2 text-xs font-normal">
            Track your MP
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Info Banner */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 flex items-start gap-3">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Hold your representative accountable</p>
            <p className="text-sm text-muted-foreground mt-1">
              These official Parliament resources let you verify what {leader.name} actually says and does in the National Assembly.
            </p>
          </div>
        </div>

        {/* Resource Cards */}
        <div className="grid gap-4">
          {resources.map((resource) => (
            <a
              key={resource.title}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className={`p-4 rounded-lg border ${resource.bgClass} hover:shadow-md transition-all group`}>
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg bg-background ${resource.colorClass}`}>
                    <resource.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{resource.title}</h4>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {resource.description}
                    </p>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Committee Data Section */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Parliament Committees
            </h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={loadCommittees}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-8 w-5/6" />
            </div>
          ) : error ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={loadCommittees} className="mt-2">
                Try Again
              </Button>
            </div>
          ) : committees.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-2">
                {committees.slice(0, 12).map((committee, index) => (
                  <Badge 
                    key={index} 
                    variant={committee.type === 'departmental' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {committee.name}
                  </Badge>
                ))}
                {committees.length > 12 && (
                  <Badge variant="outline" className="text-xs">
                    +{committees.length - 12} more
                  </Badge>
                )}
              </div>
              {lastScraped && (
                <p className="text-xs text-muted-foreground mt-3">
                  Data from Parliament website • Last updated: {new Date(lastScraped).toLocaleDateString()}
                </p>
              )}
              <div className="mt-4">
                <Button variant="outline" size="sm" asChild className="gap-2">
                  <a href={PARLIAMENT_URLS.committees} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    View all committees on Parliament.go.ke
                  </a>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <Users className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                Committee data not yet available
              </p>
              <Button variant="outline" size="sm" asChild className="mt-3 gap-2">
                <a href={PARLIAMENT_URLS.committees} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  View committees on Parliament.go.ke
                </a>
              </Button>
            </div>
          )}
        </div>

        {/* Note about data sources */}
        <div className="p-3 rounded-lg bg-muted/50 border border-dashed">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Links direct to official Parliament of Kenya resources. 
            Committee membership data is scraped from parliament.go.ke and may not reflect 
            individual MP assignments. For specific MP committee roles, check the official source.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
