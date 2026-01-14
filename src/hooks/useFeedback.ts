import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { FeedbackInput } from "@/types/database";

export function useSubmitFeedback() {
  return useMutation({
    mutationFn: async (feedback: FeedbackInput) => {
      const { error } = await supabase.from("feedback").insert({
        name: feedback.name || null,
        email: feedback.email || null,
        subject: feedback.subject,
        message: feedback.message,
        leader_id: feedback.leader_id || null,
        county_id: feedback.county_id || null,
      });

      if (error) throw error;
    },
  });
}
