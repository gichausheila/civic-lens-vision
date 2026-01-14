import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { County } from "@/types/database";

export function useCounties() {
  return useQuery({
    queryKey: ["counties"],
    queryFn: async (): Promise<County[]> => {
      const { data, error } = await supabase
        .from("counties")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as County[];
    },
  });
}

export function useCounty(id: string | undefined) {
  return useQuery({
    queryKey: ["county", id],
    queryFn: async (): Promise<County | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("counties")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as County;
    },
    enabled: !!id,
  });
}
