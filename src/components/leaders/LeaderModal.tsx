import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Leader } from "@/types/database";
import { MapPin, ExternalLink, FileText, AlertCircle } from "lucide-react";
import { getCategoryById } from "@/constants/manifestoCategories";

interface LeaderModalProps {
  leader: Leader | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Extract constituency from MP position (e.g., "MP - Westlands" -> "Westlands")
function getConstituencyFromPosition(position: string): string | null {
  const mpMatch = position.match(/^MP\s*[-–—]\s*(.+)$/i);
  return mpMatch ? mpMatch[1].trim() : null;
}

// Check if position is an MP
function isMP(position: string): boolean {
  return position.toLowerCase().startsWith("mp");
}

export function LeaderModal({ leader, open, onOpenChange }: LeaderModalProps) {
  const [imageError, setImageError] = useState(false);
  if (!leader) return null;

  const initials = leader.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const constituency = getConstituencyFromPosition(leader.position);
  const isMPPosition = isMP(leader.position);

  // Check for manifesto data
  const hasNewManifesto = leader.manifesto_summary || (leader.manifesto_promises?.length ?? 0) > 0;
  const hasLegacyManifesto = leader.manifesto?.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20 border-4 border-primary/20">
              <AvatarImage 
                src={imageError ? undefined : (leader.photo_url || undefined)} 
                alt={leader.name}
                onError={() => setImageError(true)}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{leader.name}</DialogTitle>
              <p className="text-muted-foreground">{leader.position}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {isMPPosition && leader.county ? (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {constituency ? `${constituency} Constituency, ` : ""}{leader.county.name} County
                  </Badge>
                ) : leader.county ? (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {leader.county.name}
                  </Badge>
                ) : null}
                {leader.is_national && <Badge>National</Badge>}
                {leader.party && <Badge variant="outline">{leader.party}</Badge>}
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <Tabs defaultValue="manifesto" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="manifesto">Manifesto</TabsTrigger>
              <TabsTrigger value="bio">Bio</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="statements">Statements</TabsTrigger>
            </TabsList>

            <TabsContent value="manifesto" className="mt-4 space-y-4">
              {/* Manifesto Summary */}
              {leader.manifesto_summary ? (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Policy Summary</span>
                  </div>
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

              {/* Key Promises Preview */}
              {(leader.manifesto_promises?.length ?? 0) > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Key Promises</h4>
                  {leader.manifesto_promises.slice(0, 4).map((promise, index) => {
                    const category = getCategoryById(promise.category);
                    return (
                      <div key={index} className="p-3 rounded-lg bg-muted/50 text-sm flex items-start gap-2">
                        <span>{category?.icon || "📋"}</span>
                        <div>
                          <span className="text-xs text-muted-foreground">{category?.label || promise.category}</span>
                          <p>{promise.text}</p>
                        </div>
                      </div>
                    );
                  })}
                  {(leader.manifesto_promises?.length ?? 0) > 4 && (
                    <p className="text-xs text-muted-foreground">
                      +{leader.manifesto_promises.length - 4} more promises
                    </p>
                  )}
                </div>
              )}

              {/* Legacy Manifesto Fallback */}
              {!hasNewManifesto && hasLegacyManifesto && (
                <div className="space-y-3">
                  {leader.manifesto.map((item, index) => (
                    <div key={index} className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Manifesto Source Link */}
              {leader.manifesto_source && (
                <div className="pt-2">
                  <Button variant="outline" size="sm" asChild className="gap-2">
                    <a href={leader.manifesto_source} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      View official manifesto
                    </a>
                  </Button>
                </div>
              )}

              {/* View Full Profile Link */}
              <Separator className="my-4" />
              <Button variant="default" asChild className="w-full">
                <Link to={`/leader/${leader.id}`} onClick={() => onOpenChange(false)}>
                  View Full Profile
                </Link>
              </Button>

              {/* Disclaimer */}
              <p className="text-xs text-muted-foreground italic mt-4">
                Manifesto information is sourced from publicly available documents. 
                CivicLens does not make judgments or endorsements.
              </p>
            </TabsContent>

            <TabsContent value="bio" className="mt-4">
              <p className="text-muted-foreground leading-relaxed">
                {leader.bio || "No biography available. Add real bio data here."}
              </p>
            </TabsContent>

            <TabsContent value="achievements" className="mt-4 space-y-4">
              {leader.achievements && leader.achievements.length > 0 ? (
                leader.achievements.map((item, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm">{item.text}</p>
                    {item.date && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {item.date}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">
                  No achievements listed. Add achievement data here.
                </p>
              )}
            </TabsContent>

            <TabsContent value="statements" className="mt-4 space-y-4">
              {leader.controversial_statements &&
              leader.controversial_statements.length > 0 ? (
                leader.controversial_statements.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-destructive/10 border border-destructive/20"
                  >
                    <p className="text-sm italic">"{item.text}"</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{item.date}</span>
                      {item.source && <span>Source: {item.source}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">
                  No controversial statements recorded.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
