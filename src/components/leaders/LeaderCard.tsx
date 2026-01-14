import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Leader } from "@/types/database";
import { MapPin, User } from "lucide-react";

interface LeaderCardProps {
  leader: Leader;
  onClick?: () => void;
}

export function LeaderCard({ leader, onClick }: LeaderCardProps) {
  const initials = leader.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/50"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Photo Section */}
        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden">
          <Avatar className="h-28 w-28 border-4 border-background shadow-lg transition-transform duration-300 group-hover:scale-105">
            <AvatarImage src={leader.photo_url || undefined} alt={leader.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {leader.is_national && (
            <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
              National
            </Badge>
          )}
        </div>

        {/* Info Section */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {leader.name}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              {leader.position}
            </p>
          </div>

          <div className="flex items-center justify-between">
            {leader.county ? (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {leader.county.name}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">National Level</span>
            )}
            {leader.party && (
              <Badge variant="outline" className="text-xs">
                {leader.party}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
