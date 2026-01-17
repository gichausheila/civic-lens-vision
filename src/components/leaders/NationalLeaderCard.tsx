import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Leader } from "@/types/database";
import { cn } from "@/lib/utils";

interface NationalLeaderCardProps {
  leader: Leader;
  variant?: "featured" | "compact";
  onClick?: () => void;
}

export function NationalLeaderCard({ leader, variant = "compact", onClick }: NationalLeaderCardProps) {
  const initials = leader.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Extract ministry/role from position
  const getMinistry = (position: string) => {
    if (position.toLowerCase().includes("president") && !position.toLowerCase().includes("deputy")) {
      return "Head of State & Government";
    }
    if (position.toLowerCase().includes("deputy president")) {
      return "Principal Assistant to the President";
    }
    if (position.toLowerCase().includes("prime cabinet")) {
      return "Coordinator of Government Business";
    }
    // Extract the ministry name from "Cabinet Secretary for X"
    const match = position.match(/cabinet secretary (?:for )?(.+)/i);
    return match ? match[1] : position;
  };

  if (variant === "featured") {
    return (
      <Card 
        className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 border-2 hover:border-primary/30"
        onClick={onClick}
      >
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Avatar className="h-28 w-28 border-4 border-primary/20 group-hover:border-primary/40 transition-colors">
                <AvatarImage src={leader.photo_url || undefined} alt={leader.name} />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground shadow-lg">
                  {leader.position.toLowerCase().includes("deputy") ? "Deputy President" : 
                   leader.position.toLowerCase().includes("prime") ? "Prime CS" : "President"}
                </Badge>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-foreground mt-4 group-hover:text-primary transition-colors">
              {leader.name}
            </h3>
            
            <p className="text-sm text-muted-foreground mt-1">
              {getMinistry(leader.position)}
            </p>
            
            {leader.party && (
              <Badge variant="outline" className="mt-3">
                {leader.party}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/20"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border-2 border-muted group-hover:border-primary/30 transition-colors shrink-0">
            <AvatarImage src={leader.photo_url || undefined} alt={leader.name} />
            <AvatarFallback className="text-sm font-semibold bg-muted text-muted-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {leader.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
              {getMinistry(leader.position)}
            </p>
            {leader.party && (
              <Badge variant="secondary" className="mt-2 text-xs">
                {leader.party}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
