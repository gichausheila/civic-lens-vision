import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Survey, SurveyWithVotes } from "@/types/database";

// Generate a unique voter identifier (stored in localStorage)
function getVoterIdentifier(): string {
  let id = localStorage.getItem("civiclens_voter_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("civiclens_voter_id", id);
  }
  return id;
}

export function useSurveys() {
  return useQuery({
    queryKey: ["surveys"],
    queryFn: async (): Promise<SurveyWithVotes[]> => {
      const voterId = getVoterIdentifier();

      // Fetch surveys
      const { data: surveys, error: surveyError } = await supabase
        .from("surveys")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (surveyError) throw surveyError;

      // Fetch all votes for these surveys
      const surveyIds = (surveys as Survey[]).map((s) => s.id);
      const { data: votes, error: votesError } = await supabase
        .from("survey_votes")
        .select("*")
        .in("survey_id", surveyIds);

      if (votesError) throw votesError;

      // Process surveys with vote counts
      return (surveys as Survey[]).map((survey) => {
        const surveyVotes = votes?.filter((v) => v.survey_id === survey.id) || [];
        const options = Array.isArray(survey.options) ? survey.options : [];
        const voteCounts = options.map(
          (_: string, index: number) =>
            surveyVotes.filter((v) => v.option_index === index).length
        );
        const userVote = surveyVotes.find((v) => v.voter_identifier === voterId);

        return {
          ...survey,
          options,
          votes: voteCounts,
          total_votes: surveyVotes.length,
          user_voted: !!userVote,
          user_vote_index: userVote?.option_index,
        };
      });
    },
  });
}

export function useSubmitVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      surveyId,
      optionIndex,
    }: {
      surveyId: string;
      optionIndex: number;
    }) => {
      const voterId = getVoterIdentifier();

      const { error } = await supabase.from("survey_votes").insert({
        survey_id: surveyId,
        option_index: optionIndex,
        voter_identifier: voterId,
      });

      if (error) {
        if (error.code === "23505") {
          throw new Error("You have already voted on this survey");
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
    },
  });
}
