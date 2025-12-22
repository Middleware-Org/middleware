/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEffect } from "react";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/* **************************************************
 * Error Component
 **************************************************/
export default function PodcastsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Podcasts error:", error);
  }, [error]);

  return (
    <div className={styles.error}>
      <h2>Qualcosa è andato storto!</h2>
      <p>{error.message}</p>
      <button onClick={reset} className={styles.submitButton}>
        Riprova
      </button>
    </div>
  );
}

