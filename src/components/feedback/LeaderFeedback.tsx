import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface LeaderFeedbackProps {
  leaderId: string;
  leaderName: string;
}

// Simulated feedback data (prototype)
const mockFeedbackData = {
  averageRating: 3.7,
  totalRatings: 42,
  comments: [
    { id: "1", rating: 4, comment: "Good progress on road infrastructure projects.", date: "2024-01-15" },
    { id: "2", rating: 3, comment: "More transparency needed on budget allocations.", date: "2024-01-10" },
    { id: "3", rating: 5, comment: "Excellent healthcare initiatives in the county.", date: "2024-01-05" },
  ],
};

export function LeaderFeedback({ leaderId, leaderName }: LeaderFeedbackProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission (prototype)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast.success("Thank you for your feedback!");
    setHasSubmitted(true);
    setIsSubmitting(false);
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className="space-y-6">
      {/* Average Rating Display */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
        <div className="text-center">
          <div className="text-4xl font-bold text-foreground">{mockFeedbackData.averageRating}</div>
          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(mockFeedbackData.averageRating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {mockFeedbackData.totalRatings} ratings
          </p>
        </div>
        <div className="h-16 w-px bg-border" />
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            Citizens have rated {leaderName} based on their performance, accessibility, and delivery on promises.
          </p>
        </div>
      </div>

      {/* Submit Rating Form */}
      {!hasSubmitted ? (
        <div className="p-4 rounded-lg border bg-card">
          <h4 className="font-medium mb-3">Rate this leader</h4>
          
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= displayRating
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground hover:text-amber-200"
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-muted-foreground self-center">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </span>
            )}
          </div>

          <Textarea
            placeholder="Share your thoughts on this leader's performance (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="mb-4"
          />

          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
          <p className="text-primary font-medium">Thank you for your feedback!</p>
          <p className="text-sm text-muted-foreground mt-1">Your rating helps promote accountability.</p>
        </div>
      )}

      {/* Recent Comments */}
      <div>
        <h4 className="font-medium mb-3">Recent Citizen Feedback</h4>
        <div className="space-y-3">
          {mockFeedbackData.comments.map((fb) => (
            <div key={fb.id} className="p-3 rounded-lg bg-muted/30 border">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${
                        star <= fb.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{fb.date}</span>
              </div>
              <p className="text-sm text-muted-foreground">{fb.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
