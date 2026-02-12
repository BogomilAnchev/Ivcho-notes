import styles from "@/features/auth/LoginPage.module.scss";
import { useState } from "react";
import { supabase } from "@/infrastructure/supabase/supabaseClient";

import { Button } from "@/features/common/Button/Button";

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
    <main className={styles.page}>
      <h1 className={styles.page__title}>Team Notes</h1>

      <form onSubmit={(e) => void onSubmit(e)} className={styles.page__form}>
        <label>
          <p>Password:</p>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
          />
        </label>

        {error && <span>{error}</span>}

        <Button
          type="submit"
          disabled={submitting || password.trim().length != 10}
        >
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </main>
  );
};
