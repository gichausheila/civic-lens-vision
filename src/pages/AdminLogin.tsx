import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function AdminLogin() {
  return (
    <Layout>
      <div className="max-w-md mx-auto py-16">
        <Card>
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center justify-center text-center">
              <Clock className="h-16 w-16 text-muted-foreground/50 mb-6" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Coming Soon</h1>
              <p className="text-muted-foreground max-w-xs">
                This feature is currently under development.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
