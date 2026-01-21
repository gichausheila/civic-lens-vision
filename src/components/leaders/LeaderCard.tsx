import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Leader } from "@/types/database";
import { MapPin, User } from "lucide-react";

interface LeaderCardProps {
  leader: Leader;
  onClick?: () => void;
  compact?: boolean;
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

export function LeaderCard({ leader, onClick, compact }: LeaderCardProps) {
  const initials = leader.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const constituency = getConstituencyFromPosition(leader.position);
  const isMPPosition = isMP(leader.position);

  if (compact) {
    return (
      <div
        className="group cursor-pointer p-3 rounded-lg bg-muted/30 hover:bg-muted transition-colors"
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-background">
            <AvatarImage src={leader.photo_url || undefined} alt={leader.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {leader.name}
            </h4>
            <p className="text-xs text-muted-foreground truncate">{leader.position}</p>
            {isMPPosition && leader.county && (
              <p className="text-xs text-primary/80 truncate">
                {constituency ? `${constituency}, ` : ""}{leader.county.name} County
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 w-full h-full flex flex-col"
      onClick={onClick}
    >
      <CardContent className="p-0 flex flex-col h-full">
        {/* Photo Section - Fixed aspect ratio for consistency */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden">
          <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-background shadow-lg transition-transform duration-300 group-hover:scale-105">
            <AvatarImage 
              src={leader.photo_url || undefined} 
              alt={leader.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl sm:text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {leader.is_national && (
            <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs">
              National
            </Badge>
          )}
        </div>

        {/* Info Section - Flexible height with consistent padding */}
        <div className="p-4 space-y-2 flex-1 flex flex-col">
          <div className="space-y-1">
            <h3 className="font-semibold text-base sm:text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {leader.name}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{leader.position}</span>
            </p>
          </div>

          {/* Manifesto Summary Snippet - Fixed height with line clamp */}
          {leader.manifesto_summary && (
            <p className="text-xs text-muted-foreground line-clamp-2 italic flex-shrink-0">
              {leader.manifesto_summary}
            </p>
          )}

          {/* Footer - Pushed to bottom */}
          <div className="flex items-center justify-between gap-2 mt-auto pt-2">
            {isMPPosition && leader.county ? (
              <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 min-w-0">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {constituency ? `${constituency}, ` : ""}{leader.county.name}
                </span>
              </span>
            ) : leader.county ? (
              <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 min-w-0">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{leader.county.name}</span>
              </span>
            ) : (
              <span className="text-xs sm:text-sm text-muted-foreground">National Level</span>
            )}
            {leader.party && (
              <Badge variant="outline" className="text-xs flex-shrink-0 max-w-[100px] truncate">
                {leader.party}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
