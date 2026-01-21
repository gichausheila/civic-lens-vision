import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Leader, County, ManifestoItem, Achievement, ControversialStatement, ImpeachmentTimelineEvent, OfficialDocument } from "@/types/database";

function transformImpeachedLeader(data: Record<string, unknown>): Leader {
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
    is_national: (data.is_national as boolean) ?? false,
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

export function useImpeachedLeaders() {
  return useQuery({
    queryKey: ["leaders", "impeached"],
    queryFn: async (): Promise<Leader[]> => {
      const { data, error } = await supabase
        .from("leaders")
        .select(`*, counties(*)`)
        .eq("is_impeached", true)
        .order("impeachment_date", { ascending: false });

      if (error) throw error;
      return (data || []).map((item) => transformImpeachedLeader(item as Record<string, unknown>));
    },
  });
}
