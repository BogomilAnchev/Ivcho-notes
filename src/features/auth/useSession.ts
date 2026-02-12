import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/infrastructure/supabase/supabaseClient";

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (isMounted) {
          setSession(data.session ?? null);
        }
      } catch (err) {
        console.error("Failed to load session:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
};
