import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Database, Lock, Eye, UserCheck, AlertTriangle } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Shield className="h-4 w-4" />
            Privacy & Data Protection
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last updated: January 2026
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed">
              CivicLens is committed to protecting your privacy and ensuring the security of any 
              information you provide while using our platform. This Privacy Policy explains what 
              data we collect, why we collect it, how we protect it, and your rights regarding 
              your personal information.
            </p>
          </CardContent>
        </Card>

        {/* What We Collect */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              What Data We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Information You Provide Voluntarily</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Feedback submissions:</strong> Subject, message content, and optionally your name and email address</li>
                <li><strong>Survey responses:</strong> Your votes on civic surveys (anonymous by default)</li>
                <li><strong>Account information:</strong> Email address if you create an admin account</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Information Collected Automatically</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Device identifiers:</strong> Anonymous identifiers for rate limiting and preventing duplicate votes</li>
                <li><strong>Usage data:</strong> Pages visited and features used (no personal identification)</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> We do NOT collect or store any personal contact information 
                about political leaders. All leader information displayed is sourced from official 
                public records and government sources.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Why We Collect */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Why We Collect This Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong>Feedback processing:</strong> To receive and categorize citizen feedback about governance</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong>Survey integrity:</strong> To ensure one vote per person per survey</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong>Abuse prevention:</strong> To prevent spam, automated submissions, and platform abuse</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong>Platform improvement:</strong> To understand how users interact with the platform</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* How We Protect */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              How We Protect Your Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong>Encryption:</strong> All data is encrypted in transit (HTTPS) and at rest</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong>Access control:</strong> Strict role-based access ensures only authorized administrators can view feedback</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong>No public exposure:</strong> Email addresses and personal details are never displayed publicly</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong>Rate limiting:</strong> Technical controls prevent abuse and protect the platform</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold">•</span>
                <span><strong>Secure infrastructure:</strong> Hosted on enterprise-grade cloud infrastructure with regular security updates</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Data Sharing & Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 mb-4">
              <p className="font-semibold text-foreground">
                We do NOT sell, rent, or share your personal data with third parties for marketing purposes.
              </p>
            </div>
            <p className="text-muted-foreground">
              Your data may only be disclosed if required by law or to protect the safety and 
              integrity of the platform. Aggregated, anonymized data may be used for research 
              and civic engagement analysis.
            </p>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li><strong>Access:</strong> You may request information about data we hold about you</li>
              <li><strong>Deletion:</strong> You may request deletion of your feedback submissions</li>
              <li><strong>Anonymity:</strong> You can submit feedback without providing any personal information</li>
              <li><strong>Opt-out:</strong> You can choose not to provide optional information like email addresses</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Questions or Concerns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy or wish to exercise your data rights, 
              please use the feedback form on this platform to contact us. Mark your subject as 
              "Privacy Inquiry" for priority handling.
            </p>
          </CardContent>
        </Card>

        {/* Legal Disclaimer */}
        <div className="text-center py-8 border-t">
          <h3 className="text-sm font-semibold text-foreground mb-2">Legal Disclaimer</h3>
          <div className="text-sm text-muted-foreground max-w-2xl mx-auto space-y-1">
            <p>CivicLens aggregates publicly available civic information for educational and awareness purposes only.</p>
            <p>The platform does not make accusations, endorsements, or legal claims against any individual.</p>
            <p>All users are encouraged to verify information using official government sources.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
