import { Layout } from "@/components/layout/Layout";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";

export default function Feedback() {
  return (
    <Layout>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Share Your Feedback
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Your opinions matter. Share your thoughts on governance, leaders, and
          public services. Help shape a better Kenya.
        </p>
      </div>

      <FeedbackForm />
    </Layout>
  );
}
