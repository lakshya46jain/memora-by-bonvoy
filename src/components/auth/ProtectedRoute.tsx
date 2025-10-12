import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePreferences } from "@/hooks/usePreferences";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasPreferences, loading: preferencesLoading } = usePreferences();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Only redirect to preferences if:
    // 1. User is authenticated
    // 2. Preferences have been checked
    // 3. User doesn't have preferences
    // 4. Not already on preferences page
    if (
      !authLoading && 
      user && 
      !preferencesLoading && 
      hasPreferences === false && 
      location.pathname !== "/preferences"
    ) {
      navigate("/preferences");
    }
  }, [user, authLoading, hasPreferences, preferencesLoading, location.pathname, navigate]);

  if (authLoading || preferencesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
