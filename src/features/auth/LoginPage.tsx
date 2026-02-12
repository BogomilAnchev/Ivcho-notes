import { useState } from "react";
import { supabase } from "@/infrastructure/supabase/supabaseClient";

const SHARED_EMAIL = import.meta.env.VITE_SHARED_LOGIN_EMAIL as
  | string
  | undefined;

export const LoginPage = () => {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!SHARED_EMAIL) {
      setError("Missing VITE_SHARED_LOGIN_EMAIL env var.");
      return;
    }

    setSubmitting(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: SHARED_EMAIL,
        password,
      });

      if (signInError) throw signInError;
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ maxWidth: 420, margin: "64px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>Team Notes</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Enter the shared password to continue.
      </p>

      <form
        onSubmit={(e) => void onSubmit(e)}
        style={{ display: "grid", gap: 12, marginTop: 16 }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
          />
        </label>

        {error && <div style={{ color: "crimson" }}>{error}</div>}

        <button
          type="submit"
          disabled={submitting || password.trim().length === 0}
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
};
