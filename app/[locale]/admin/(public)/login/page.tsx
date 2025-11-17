"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import styles from "./styles";

/* **************************************************
 * Constants
 ************************************************** */
const CALLBACK_URL = "/admin";
const ERROR_CALLBACK_URL = "/admin/public?error=oauth";

/* **************************************************
 * Login Page
 ************************************************** */
export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);

  /* **************************************************
   * Handlers
   ************************************************** */
  async function handleGitHubLogin() {
    setLoading(true);
    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: CALLBACK_URL,
        errorCallbackURL: ERROR_CALLBACK_URL,
      });
    } finally {
      setLoading(false);
    }
  }

  /* **************************************************
   * Render
   ************************************************** */
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Area admin</h1>
        <p className={styles.description}>Accedi con il tuo account GitHub autorizzato.</p>
        <button onClick={handleGitHubLogin} disabled={loading} className={styles.button}>
          {loading ? "Reindirizzamento..." : "Continua con GitHub"}
        </button>
      </div>
    </main>
  );
}
