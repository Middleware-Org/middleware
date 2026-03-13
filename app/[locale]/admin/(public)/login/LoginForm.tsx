"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { withLocale } from "@/lib/i18n/path";
import styles from "./styles";

/* **************************************************
 * Constants
 ************************************************** */
/* **************************************************
 * Login Form Component
 ************************************************** */
export default function LoginForm({ locale }: { locale: string }) {
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
        setError(result.error.message || "Errore durante il login");
        return;
      }

      if (result.data) {
        router.push(withLocale("/admin", locale));
      }
    } catch {
      setError("Errore durante il login. Riprova.");
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
            Email
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
            Password
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
          {loading ? "Accesso in corso..." : "Accedi"}
        </button>
      </form>
    </>
  );
}
