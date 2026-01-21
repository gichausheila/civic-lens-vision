import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Shield, Users, Scale, Heart, Target } from "lucide-react";

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Eye className="h-4 w-4" />
          About CivicLens
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Empowering Informed Citizens
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          CivicLens is a civic education and political accountability platform designed to help 
          citizens understand their leaders, their roles, their public promises, and their performance.
        </p>
      </div>

      {/* Mission Statement */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                CivicLens aims to promote transparency, accountability, and informed civic participation 
                by providing accessible, factual, and neutral information about elected leaders and 
                public officials. We believe that an informed citizenry is the foundation of a 
                healthy democracy.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Values */}
      <h2 className="text-2xl font-bold mb-6">Our Core Values</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardContent className="pt-6">
            <Shield className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Neutrality</h3>
            <p className="text-sm text-muted-foreground">
              We do not endorse any political party, candidate, or ideology. Our content is 
              presented factually without political bias.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Eye className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Transparency</h3>
            <p className="text-sm text-muted-foreground">
              We strive to make government and leadership information accessible and easy to 
              understand for all citizens.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Scale className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accuracy</h3>
            <p className="text-sm text-muted-foreground">
              All information is sourced from publicly available records and verified sources. 
              We present facts, not opinions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Users className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accessibility</h3>
            <p className="text-sm text-muted-foreground">
              We design our platform to be easy to use for all Kenyans, regardless of their 
              technical expertise or background.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Heart className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Civic Responsibility</h3>
            <p className="text-sm text-muted-foreground">
              We encourage active and informed civic participation as a duty of every citizen 
              in a democratic society.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Target className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Accountability</h3>
            <p className="text-sm text-muted-foreground">
              We help citizens track promises made by leaders and hold them accountable for 
              their commitments.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* What We Do Section */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">What CivicLens Provides</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Leader Profiles:</strong> Comprehensive profiles of elected officials 
                including their positions, party affiliations, and contact information.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Manifesto Tracking:</strong> Records of public promises made by leaders 
                and their current status (completed, in progress, or not started).
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">3</span>
              </div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Performance Records:</strong> Documentation of actions, achievements, 
                and public activities of elected officials.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">4</span>
              </div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">County Explorer:</strong> Easy browsing of leaders by county to help 
                citizens find their local representatives.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">5</span>
              </div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Citizen Feedback:</strong> A platform for citizens to rate leaders 
                and share their views on their performance.
              </p>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-dashed bg-muted/30">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-3">Important Notice</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">CivicLens is an informational platform.</strong> We do not endorse 
              any political party, candidate, or ideology. Our goal is purely educational — to improve 
              civic awareness and promote informed participation in the democratic process.
            </p>
            <p>
              All information presented on this platform is sourced from publicly available records. 
              We make every effort to ensure accuracy, but we encourage users to verify information 
              through official government sources.
            </p>
            <p>
              This platform is currently in prototype stage. Some features and data may be placeholders 
              as we continue to develop and improve the service.
            </p>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default About;
