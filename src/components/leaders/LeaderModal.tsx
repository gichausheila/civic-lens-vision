import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Leader } from "@/types/database";
import { MapPin } from "lucide-react";

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
  if (!leader) return null;

  const initials = leader.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const constituency = getConstituencyFromPosition(leader.position);
  const isMPPosition = isMP(leader.position);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20 border-4 border-primary/20">
              <AvatarImage src={leader.photo_url || undefined} alt={leader.name} />
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
          <Tabs defaultValue="bio" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="bio">Bio</TabsTrigger>
              <TabsTrigger value="manifesto">Manifesto</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="statements">Statements</TabsTrigger>
            </TabsList>

            <TabsContent value="bio" className="mt-4">
              <p className="text-muted-foreground leading-relaxed">
                {leader.bio || "No biography available. Add real bio data here."}
              </p>
            </TabsContent>

            <TabsContent value="manifesto" className="mt-4 space-y-4">
              {leader.manifesto && leader.manifesto.length > 0 ? (
                leader.manifesto.map((item, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">
                  No manifesto items available. Add manifesto data here.
                </p>
              )}
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
