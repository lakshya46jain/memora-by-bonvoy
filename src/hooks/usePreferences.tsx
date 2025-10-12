import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function usePreferences() {
  const { user, loading: authLoading } = useAuth();
  const [hasPreferences, setHasPreferences] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      checkPreferences();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const checkPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;

      const hasPref = !!data;
      setHasPreferences(hasPref);

      // Only redirect if:
      // 1. User doesn't have preferences
      // 2. Not already on preferences or auth page
      // 3. Not on a page that allows navigation away
      const currentPath = window.location.pathname;
      const allowedPaths = ["/preferences", "/auth"];
      
      if (!hasPref && !allowedPaths.includes(currentPath)) {
        // Use setTimeout to ensure navigation happens after component mount
        setTimeout(() => {
          navigate("/preferences", { replace: true });
        }, 0);
      }
    } catch (error) {
      console.error("Error checking preferences:", error);
      setHasPreferences(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    hasPreferences,
    loading,
    checkPreferences,
  };
}
