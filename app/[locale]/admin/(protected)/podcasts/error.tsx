/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEffect } from "react";

import { toast } from "@/hooks/use-toast";

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
    toast.error("Errore nella pagina podcast", error.message);
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
