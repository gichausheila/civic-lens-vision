import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Feedback, FeedbackInput } from "@/types/database";

// Generate a simple fingerprint for rate limiting
function generateFingerprint(): string {
  const nav = window.navigator;
  const screen = window.screen;
  const data = [
    nav.userAgent,
    nav.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
  ].join("|");
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function useSubmitFeedback() {
  return useMutation({
    mutationFn: async (feedback: FeedbackInput) => {
      const fingerprint = generateFingerprint();
      
      // Check rate limit first
      const { data: canSubmit, error: rateLimitError } = await supabase
        .rpc('check_feedback_rate_limit', { _identifier: fingerprint });
      
      if (rateLimitError) {
        console.error('Rate limit check error:', rateLimitError);
        // Continue anyway if rate limit check fails
      } else if (canSubmit === false) {
        throw new Error('You have submitted too many feedback entries recently. Please try again later.');
      }

      // Record this submission for rate limiting
      await supabase.from("feedback_rate_limits").insert({
        identifier: fingerprint,
      });

      // Submit feedback
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

// Admin-only hook to fetch all feedback
export function useAdminFeedback() {
  return useQuery({
    queryKey: ["admin", "feedback"],
    queryFn: async (): Promise<Feedback[]> => {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

// Admin-only hook to update feedback status
export function useUpdateFeedbackStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("feedback")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "feedback"] });
    },
  });
}

// Admin-only hook to delete feedback
export function useDeleteFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("feedback")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "feedback"] });
    },
  });
}
