import { useState } from "react";
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
  const [imageError, setImageError] = useState(false);
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
            <AvatarImage 
              src={imageError ? undefined : (leader.photo_url || undefined)} 
              alt={leader.name}
              onError={() => setImageError(true)}
            />
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
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 sm:hover:-translate-y-1 hover:border-primary/50 w-full h-full flex flex-col"
      onClick={onClick}
    >
      <CardContent className="p-0 flex flex-col h-full">
        {/* Photo Section - Compact on mobile, larger on desktop */}
        <div className="relative aspect-square sm:aspect-[4/3] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden">
          <Avatar className="h-12 w-12 sm:h-20 md:h-28 border-2 sm:border-4 border-background shadow-md sm:shadow-lg transition-transform duration-300 group-hover:scale-105">
            <AvatarImage 
              src={imageError ? undefined : (leader.photo_url || undefined)} 
              alt={leader.name}
              className="object-cover"
              onError={() => setImageError(true)}
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-xl md:text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {leader.is_national && (
            <Badge className="absolute top-1 right-1 sm:top-3 sm:right-3 bg-accent text-accent-foreground text-[8px] sm:text-xs px-1 sm:px-2 py-0 sm:py-0.5">
              National
            </Badge>
          )}
        </div>

        {/* Info Section - Compact padding on mobile */}
        <div className="p-1.5 sm:p-3 md:p-4 space-y-0.5 sm:space-y-2 flex-1 flex flex-col">
          <div className="space-y-0.5 sm:space-y-1">
            <h3 className="font-semibold text-[10px] sm:text-sm md:text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {leader.name}
            </h3>
            <p className="text-[8px] sm:text-xs md:text-sm text-muted-foreground flex items-center gap-0.5 sm:gap-1">
              <User className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />
              <span className="truncate">{leader.position}</span>
            </p>
          </div>

          {/* Manifesto Summary - Hidden on mobile, visible on larger screens */}
          {leader.manifesto_summary && (
            <p className="hidden sm:block text-xs text-muted-foreground line-clamp-2 italic flex-shrink-0">
              {leader.manifesto_summary}
            </p>
          )}

          {/* Footer - Compact on mobile */}
          <div className="flex items-center justify-between gap-1 sm:gap-2 mt-auto pt-0.5 sm:pt-2">
            {isMPPosition && leader.county ? (
              <span className="text-[8px] sm:text-xs md:text-sm text-muted-foreground flex items-center gap-0.5 sm:gap-1 min-w-0">
                <MapPin className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />
                <span className="truncate hidden sm:inline">
                  {constituency ? `${constituency}, ` : ""}{leader.county.name}
                </span>
                <span className="truncate sm:hidden">{leader.county.name}</span>
              </span>
            ) : leader.county ? (
              <span className="text-[8px] sm:text-xs md:text-sm text-muted-foreground flex items-center gap-0.5 sm:gap-1 min-w-0">
                <MapPin className="h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />
                <span className="truncate">{leader.county.name}</span>
              </span>
            ) : (
              <span className="text-[8px] sm:text-xs md:text-sm text-muted-foreground">National</span>
            )}
            {leader.party && (
              <Badge variant="outline" className="text-[6px] sm:text-xs flex-shrink-0 max-w-[50px] sm:max-w-[100px] truncate px-1 sm:px-2 py-0">
                {leader.party}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
