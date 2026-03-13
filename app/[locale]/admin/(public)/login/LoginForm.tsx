"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { withLocale } from "@/lib/i18n/path";
import type { AdminDictionary } from "@/lib/i18n/types";
import styles from "./styles";

/* **************************************************
 * Constants
 ************************************************** */
/* **************************************************
 * Login Form Component
 ************************************************** */
type LoginFormProps = {
  locale: string;
  dict: AdminDictionary["login"];
};

export default function LoginForm({ locale, dict }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* **************************************************
   * Handlers
   ************************************************** */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || dict.genericError);
        return;
      }

      if (result.data) {
        router.push(withLocale("/admin", locale));
      }
    } catch {
      setError(dict.retryError);
    } finally {
      setLoading(false);
    }
  }

  /* **************************************************
   * Render
   ************************************************** */
  return (
    <>
      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            {dict.emailLabel}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className={styles.input}
            autoComplete="email"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>
            {dict.passwordLabel}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className={styles.input}
            autoComplete="current-password"
          />
        </div>

        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? dict.submitting : dict.submit}
        </button>
      </form>
    </>
  );
}
