import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Upload, Camera, X, Loader2 } from "lucide-react";
import type { Leader } from "@/types/database";

export function LeaderPhotoManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch all leaders
  const { data: leaders, isLoading } = useQuery({
    queryKey: ["admin-leaders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leaders")
        .select("id, name, position, party, photo_url")
        .order("name");
      if (error) throw error;
      return data as Pick<Leader, "id" | "name" | "position" | "party" | "photo_url">[];
    },
  });

  // Update leader photo URL mutation
  const updatePhotoMutation = useMutation({
    mutationFn: async ({ leaderId, photoUrl }: { leaderId: string; photoUrl: string }) => {
      const { error } = await supabase
        .from("leaders")
        .update({ photo_url: photoUrl })
        .eq("id", leaderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leaders"] });
      queryClient.invalidateQueries({ queryKey: ["leaders"] });
      toast.success("Photo updated successfully");
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast.error("Failed to update photo");
    },
  });

  // Handle file upload
  const handleFileUpload = async (leaderId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploadingId(leaderId);

    try {
      // Create unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${leaderId}-${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("leader-photos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("leader-photos")
        .getPublicUrl(fileName);

      // Update leader record
      await updatePhotoMutation.mutateAsync({
        leaderId,
        photoUrl: urlData.publicUrl,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload photo");
    } finally {
      setUploadingId(null);
    }
  };

  // Filter leaders by search term
  const filteredLeaders = leaders?.filter((leader) =>
    leader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leader.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const leadersWithPhotos = leaders?.filter((l) => l.photo_url).length || 0;
  const totalLeaders = leaders?.length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Leader Photo Manager
        </CardTitle>
        <CardDescription>
          Upload and manage photos for political leaders
        </CardDescription>
        <div className="flex items-center gap-4 pt-2">
          <Badge variant="outline">
            {leadersWithPhotos}/{totalLeaders} have photos
          </Badge>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leaders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : filteredLeaders && filteredLeaders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
            {filteredLeaders.map((leader) => (
              <div
                key={leader.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-14 w-14">
                  <AvatarImage src={leader.photo_url || undefined} alt={leader.name} />
                  <AvatarFallback className="text-xs">{getInitials(leader.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{leader.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{leader.position}</p>
                  {leader.party && (
                    <Badge variant="secondary" className="text-[10px] mt-1">
                      {leader.party}
                    </Badge>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && uploadingId) {
                        handleFileUpload(uploadingId, file);
                      }
                      e.target.value = "";
                    }}
                  />
                  <Button
                    variant={leader.photo_url ? "outline" : "default"}
                    size="sm"
                    disabled={uploadingId === leader.id}
                    onClick={() => {
                      setUploadingId(leader.id);
                      fileInputRef.current?.click();
                    }}
                  >
                    {uploadingId === leader.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No leaders found matching "{searchTerm}"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
