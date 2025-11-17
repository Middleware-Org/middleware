/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEffect } from "react";
import Link from "next/link";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/* **************************************************
 * Error Boundary
 **************************************************/
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Categories page error:", error);
  }, [error]);

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Errore</h1>
        <Link href="/admin" className={styles.backButton}>
          ← Indietro
        </Link>
      </div>

      <div className={styles.error}>
        <h2 className="text-lg font-semibold mb-2">Qualcosa è andato storto!</h2>
        <p className="mb-4">{error.message}</p>
        <div className="flex gap-2">
          <button onClick={reset} className={styles.submitButton}>
            Riprova
          </button>
          <Link href="/admin" className={styles.cancelButton}>
            Torna alla Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
