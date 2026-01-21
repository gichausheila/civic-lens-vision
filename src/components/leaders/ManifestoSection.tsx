import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, FileText, CheckCircle2, Clock, Circle, AlertCircle } from "lucide-react";
import type { Leader, ManifestoPromise } from "@/types/database";
import { MANIFESTO_CATEGORIES, getCategoryById } from "@/constants/manifestoCategories";

interface ManifestoSectionProps {
  leader: Leader;
}

const statusConfig = {
  completed: { label: "Completed", icon: CheckCircle2, className: "text-primary bg-primary/10" },
  in_progress: { label: "In Progress", icon: Clock, className: "text-foreground bg-muted" },
  not_started: { label: "Not Started", icon: Circle, className: "text-muted-foreground bg-muted/50" },
};

// Group promises by category
function groupPromisesByCategory(promises: ManifestoPromise[]): Map<string, ManifestoPromise[]> {
  const grouped = new Map<string, ManifestoPromise[]>();
  
  for (const promise of promises) {
    const categoryId = promise.category || "other";
    const existing = grouped.get(categoryId) || [];
    grouped.set(categoryId, [...existing, promise]);
  }
  
  return grouped;
}

export function ManifestoSection({ leader }: ManifestoSectionProps) {
  const groupedPromises = useMemo(() => {
    return groupPromisesByCategory(leader.manifesto_promises || []);
  }, [leader.manifesto_promises]);

  const hasManifestoData = leader.manifesto_summary || leader.manifesto_promises?.length > 0;
  
  // Fallback to legacy manifesto if new fields are empty
  const hasLegacyManifesto = leader.manifesto?.length > 0 && !hasManifestoData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Manifesto & Policy Priorities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Manifesto Summary */}
        {leader.manifesto_summary ? (
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-sm leading-relaxed">{leader.manifesto_summary}</p>
          </div>
        ) : !leader.manifesto_available ? (
          <div className="p-4 rounded-lg bg-muted/50 border border-dashed flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                No individual manifesto available; leader campaigned under party manifesto.
              </p>
              {leader.party && (
                <p className="text-xs text-muted-foreground mt-1">
                  Party: {leader.party}
                </p>
              )}
            </div>
          </div>
        ) : null}

        {/* Manifesto Source Link */}
        {leader.manifesto_source && (
          <div>
            <Button variant="outline" size="sm" asChild className="gap-2">
              <a href={leader.manifesto_source} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                View official manifesto
              </a>
            </Button>
          </div>
        )}

        {/* Structured Manifesto Promises by Category */}
        {groupedPromises.size > 0 && (
          <>
            <Separator />
            <div className="space-y-6">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Policy Promises by Category
              </h4>
              {MANIFESTO_CATEGORIES.map((category) => {
                const promises = groupedPromises.get(category.id);
                if (!promises || promises.length === 0) return null;
                
                return (
                  <div key={category.id} className="space-y-3">
                    <h5 className="font-medium flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.label}
                      <Badge variant="secondary" className="text-xs">
                        {promises.length}
                      </Badge>
                    </h5>
                    <ul className="space-y-2 ml-6">
                      {promises.map((promise, index) => {
                        const status = promise.status 
                          ? statusConfig[promise.status] 
                          : statusConfig.not_started;
                        const StatusIcon = status.icon;
                        
                        return (
                          <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-card border">
                            <StatusIcon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${status.className.split(' ')[0]}`} />
                            <div className="flex-1">
                              <p className="text-sm">{promise.text}</p>
                            </div>
                            <Badge className={status.className} variant="secondary">
                              {status.label}
                            </Badge>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
              
              {/* Other category for uncategorized promises */}
              {groupedPromises.get("other") && (
                <div className="space-y-3">
                  <h5 className="font-medium flex items-center gap-2">
                    <span>📋</span>
                    Other Promises
                    <Badge variant="secondary" className="text-xs">
                      {groupedPromises.get("other")!.length}
                    </Badge>
                  </h5>
                  <ul className="space-y-2 ml-6">
                    {groupedPromises.get("other")!.map((promise, index) => {
                      const status = promise.status 
                        ? statusConfig[promise.status] 
                        : statusConfig.not_started;
                      const StatusIcon = status.icon;
                      
                      return (
                        <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-card border">
                          <StatusIcon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${status.className.split(' ')[0]}`} />
                          <div className="flex-1">
                            <p className="text-sm">{promise.text}</p>
                          </div>
                          <Badge className={status.className} variant="secondary">
                            {status.label}
                          </Badge>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}

        {/* Legacy Manifesto Fallback */}
        {hasLegacyManifesto && (
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Key Priorities
            </h4>
            {leader.manifesto.map((item, index) => (
              <div key={index} className="p-4 rounded-lg border bg-card">
                <h5 className="font-semibold">{item.title}</h5>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!hasManifestoData && !hasLegacyManifesto && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No manifesto information available yet.</p>
            <p className="text-sm mt-1">Check back later for updates.</p>
          </div>
        )}

        {/* Legal Disclaimer */}
        <Separator className="my-4" />
        <div className="p-4 rounded-lg bg-muted/30 border border-dashed">
          <p className="text-xs text-muted-foreground italic">
            <strong>Disclaimer:</strong> Manifesto information is sourced from publicly available documents. 
            CivicLens does not make judgments or endorsements. Users are encouraged to verify information 
            through official sources.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
