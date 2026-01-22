import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Vote, 
  Users, 
  ExternalLink, 
  Search,
  AlertCircle,
  CheckCircle2,
  Lightbulb
} from "lucide-react";
import { PARLIAMENT_URLS } from "@/lib/api/parliament";

export function TrackYourMP() {
  const resources = [
    {
      icon: MessageSquare,
      title: "The Hansard (Speeches)",
      subtitle: "What did they actually say?",
      description: "The Hansard is a verbatim record of every word spoken on the Parliament floor. If your MP made a promise, proposal, or statement in Parliament, it's documented here.",
      url: PARLIAMENT_URLS.hansard,
      tips: [
        "Search by MP name to find their contributions",
        "Look for debates on specific bills or issues you care about",
        "Compare what they say publicly vs. in Parliament",
      ],
      bgClass: "bg-primary",
    },
    {
      icon: Vote,
      title: "The Bills Tracker",
      subtitle: "How did they vote?",
      description: "This shows how your MP voted on crucial laws—the Finance Bill, health reforms, security legislation, and more. It's the best way to see if their actions match their public statements.",
      url: PARLIAMENT_URLS.billsTracker,
      tips: [
        "Check votes on controversial bills",
        "See which bills they sponsored or supported",
        "Track the progress of legislation through Parliament",
      ],
      bgClass: "bg-secondary",
    },
    {
      icon: Users,
      title: "Committee Attendance",
      subtitle: "Are they doing the real work?",
      description: "Most 'real' legislative work happens in committees—budget analysis, bill scrutiny, government oversight. You can check which committees your MP sits on and whether they're active.",
      url: PARLIAMENT_URLS.committees,
      tips: [
        "Find which committees your MP belongs to",
        "Check meeting attendance records when available",
        "Review committee reports on issues you care about",
      ],
      bgClass: "bg-accent",
    },
  ];

  const additionalResources = [
    {
      title: "Order Paper",
      description: "See what's scheduled for discussion in Parliament",
      url: PARLIAMENT_URLS.orderPaper,
    },
    {
      title: "Votes & Proceedings",
      description: "Official record of Parliament decisions",
      url: PARLIAMENT_URLS.votes,
    },
    {
      title: "MPs List",
      description: "Complete list of all Members of Parliament",
      url: PARLIAMENT_URLS.mpsList,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-primary/10 via-background to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Search className="h-7 w-7 text-primary" />
            Track Your MP
          </CardTitle>
          <CardDescription className="text-base">
            Hold your elected representatives accountable with these official Parliament of Kenya resources. 
            Don't just take their word for it—verify what they actually do in Parliament.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Official Government Sources
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Free & Public Access
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Resources */}
      <div className="space-y-6">
        {resources.map((resource, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex flex-col lg:flex-row">
              {/* Left side - Main content */}
              <div className="flex-1 p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${resource.bgClass} text-primary-foreground flex-shrink-0`}>
                    <resource.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{resource.subtitle}</p>
                    <p className="mt-3 text-muted-foreground">{resource.description}</p>
                    
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 text-primary hover:underline font-medium"
                    >
                      Access on Parliament.go.ke
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Right side - Tips */}
              <div className="bg-muted/50 p-6 lg:w-80 border-t lg:border-t-0 lg:border-l">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">How to use it</span>
                </div>
                <ul className="space-y-2">
                  {resource.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Additional Resources */}
      <div>
        <h3 className="text-lg font-semibold mb-4">More Parliament Resources</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {additionalResources.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="h-full hover:shadow-md hover:border-primary/30 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{resource.title}</h4>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">{resource.description}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold text-lg mb-2">
            🇰🇪 Democracy works when citizens participate
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            These tools exist because you have a right to know what your representatives are doing. 
            Use them regularly, share with your community, and hold your leaders accountable.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
