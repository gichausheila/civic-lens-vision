import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { Clock } from "lucide-react";

interface AdminGateProps {
  children: React.ReactNode;
}

export function AdminGate({ children }: AdminGateProps) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();

  if (authLoading || (user && roleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
        <Clock className="h-16 w-16 text-muted-foreground/50 mb-6" />
        <h1 className="text-3xl font-bold text-foreground mb-2">Coming Soon</h1>
        <p className="text-muted-foreground max-w-md">
          This application is currently under development and not available to the public.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
