import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Leader, County, ManifestoItem, Achievement, ControversialStatement, SocialMedia, ImpeachmentTimelineEvent, OfficialDocument } from "@/types/database";

function transformLeader(data: Record<string, unknown>): Leader {
  const counties = data.counties as County | null;
  return {
    id: data.id as string,
    name: data.name as string,
    position: data.position as string,
    county_id: data.county_id as string | null,
    party: data.party as string | null,
    photo_url: data.photo_url as string | null,
    bio: data.bio as string | null,
    manifesto: Array.isArray(data.manifesto) ? (data.manifesto as ManifestoItem[]) : [],
    achievements: Array.isArray(data.achievements) ? (data.achievements as Achievement[]) : [],
    controversial_statements: Array.isArray(data.controversial_statements) ? (data.controversial_statements as ControversialStatement[]) : [],
    social_media: (typeof data.social_media === 'object' && data.social_media !== null ? data.social_media : {}) as SocialMedia,
    is_national: (data.is_national as boolean) ?? false,
    contact_email: data.contact_email as string | null,
    contact_phone: data.contact_phone as string | null,
    is_impeached: (data.is_impeached as boolean) ?? false,
    impeachment_date: data.impeachment_date as string | null,
    impeachment_reasons: Array.isArray(data.impeachment_reasons) ? (data.impeachment_reasons as string[]) : [],
    impeachment_timeline: Array.isArray(data.impeachment_timeline) ? (data.impeachment_timeline as ImpeachmentTimelineEvent[]) : [],
    official_documents: Array.isArray(data.official_documents) ? (data.official_documents as OfficialDocument[]) : [],
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
    county: counties || undefined,
  };
}

export function useLeaders(countyId?: string) {
  return useQuery({
    queryKey: ["leaders", countyId],
    queryFn: async (): Promise<Leader[]> => {
      let query = supabase
        .from("leaders")
        .select(`*, counties(*)`)
        .order("name");

      if (countyId) {
        query = query.eq("county_id", countyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((item) => transformLeader(item as Record<string, unknown>));
    },
  });
}

export function useLeader(id: string | undefined) {
  return useQuery({
    queryKey: ["leader", id],
    queryFn: async (): Promise<Leader | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("leaders")
        .select(`*, counties(*)`)
        .eq("id", id)
        .single();

      if (error) throw error;
      return transformLeader(data as Record<string, unknown>);
    },
    enabled: !!id,
  });
}

export function useSearchLeaders(searchTerm: string) {
  return useQuery({
    queryKey: ["leaders", "search", searchTerm],
    queryFn: async (): Promise<Leader[]> => {
      if (!searchTerm.trim()) {
        const { data, error } = await supabase
          .from("leaders")
          .select(`*, counties(*)`)
          .order("name");

        if (error) throw error;
        return (data || []).map((item) => transformLeader(item as Record<string, unknown>));
      }

      const { data, error } = await supabase
        .from("leaders")
        .select(`*, counties(*)`)
        .or(`name.ilike.%${searchTerm}%,position.ilike.%${searchTerm}%`)
        .order("name");

      if (error) throw error;
      return (data || []).map((item) => transformLeader(item as Record<string, unknown>));
    },
  });
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function useRandomLeaders(limit: number = 12) {
  return useQuery({
    queryKey: ["leaders", "random", limit],
    queryFn: async (): Promise<Leader[]> => {
      const { data, error } = await supabase
        .from("leaders")
        .select(`*, counties(*)`);

      if (error) throw error;
      
      const leaders = (data || []).map((item) => transformLeader(item as Record<string, unknown>));
      
      // Shuffle and return limited results for variety
      const shuffled = shuffleArray(leaders);
      return shuffled.slice(0, limit);
    },
    staleTime: 0, // Always refetch to get new random order
    refetchOnWindowFocus: false,
  });
}
