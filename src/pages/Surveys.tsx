import { Layout } from "@/components/layout/Layout";
import { SurveyCard } from "@/components/surveys/SurveyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useSurveys } from "@/hooks/useSurveys";
import { Vote } from "lucide-react";

export default function Surveys() {
  const { data: surveys, isLoading } = useSurveys();

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Vote className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Surveys</h1>
        </div>
        <p className="text-muted-foreground">
          Participate in surveys about governance and public services. Your voice
          matters!
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-lg" />
          ))}
        </div>
      ) : surveys && surveys.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {surveys.map((survey) => (
            <SurveyCard key={survey.id} survey={survey} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Vote className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">
            No active surveys at the moment
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Check back later for new surveys
          </p>
        </div>
      )}
    </Layout>
  );
}
