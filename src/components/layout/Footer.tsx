import { Link } from "react-router-dom";
import { Shield, AlertTriangle, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      {/* Legal Disclaimer Banner */}
      <div className="bg-accent/50 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80">
              <strong>Disclaimer:</strong> CivicLens collects user input for civic awareness and research purposes. 
              Personal identifiers are never shared. Survey responses are anonymous. 
              All information is sourced from publicly available documents. CivicLens does not make judgments or endorsements.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">CL</span>
              </div>
              <span className="text-lg font-bold text-foreground">CivicLens</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering citizens with transparent civic information for a more accountable democracy.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/leaders" className="text-muted-foreground hover:text-foreground transition-colors">
                  Browse Leaders
                </Link>
              </li>
              <li>
                <Link to="/counties" className="text-muted-foreground hover:text-foreground transition-colors">
                  Explore Counties
                </Link>
              </li>
              <li>
                <Link to="/surveys" className="text-muted-foreground hover:text-foreground transition-colors">
                  Participate in Surveys
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-muted-foreground hover:text-foreground transition-colors">
                  Submit Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Privacy */}
          <div>
            <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy & Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  Privacy Policy
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About CivicLens
                </Link>
              </li>
            </ul>
            <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground">
                Your data is protected. Emails are never publicly displayed. 
                Survey votes are completely anonymous.
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CivicLens. For civic education purposes only.</p>
          <p className="mt-1">
            All users are encouraged to verify information through official government sources.
          </p>
        </div>
      </div>
    </footer>
  );
}
