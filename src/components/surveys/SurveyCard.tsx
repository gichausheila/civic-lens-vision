import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, Vote } from "lucide-react";
import type { SurveyWithVotes } from "@/types/database";
import { useSubmitVote } from "@/hooks/useSurveys";
import { toast } from "sonner";

interface SurveyCardProps {
  survey: SurveyWithVotes;
}

export function SurveyCard({ survey }: SurveyCardProps) {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const submitVote = useSubmitVote();

  const handleVote = () => {
    const optionIndex = parseInt(selectedOption);
    if (isNaN(optionIndex)) {
      toast.error("Please select an option");
      return;
    }

    submitVote.mutate(
      { surveyId: survey.id, optionIndex },
      {
        onSuccess: () => {
          toast.success("Vote submitted successfully!");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  const getPercentage = (votes: number) => {
    if (survey.total_votes === 0) return 0;
    return Math.round((votes / survey.total_votes) * 100);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Vote className="h-5 w-5 text-primary" />
          {survey.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {survey.user_voted ? (
          // Show results
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>You voted for: {survey.options[survey.user_vote_index!]}</span>
            </div>
            {survey.options.map((option, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span
                    className={
                      index === survey.user_vote_index
                        ? "font-medium text-primary"
                        : ""
                    }
                  >
                    {option}
                  </span>
                  <span className="text-muted-foreground">
                    {getPercentage(survey.votes[index])}% ({survey.votes[index]})
                  </span>
                </div>
                <Progress
                  value={getPercentage(survey.votes[index])}
                  className="h-2"
                />
              </div>
            ))}
            <p className="text-sm text-muted-foreground text-center pt-2">
              Total votes: {survey.total_votes}
            </p>
          </div>
        ) : (
          // Show voting form
          <div className="space-y-4">
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              {survey.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <RadioGroupItem
                    value={index.toString()}
                    id={`${survey.id}-${index}`}
                  />
                  <Label
                    htmlFor={`${survey.id}-${index}`}
                    className="flex-1 cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <Button
              onClick={handleVote}
              disabled={!selectedOption || submitVote.isPending}
              className="w-full"
            >
              {submitVote.isPending ? "Submitting..." : "Submit Vote"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
