/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useEffect } from "react";

import { toast } from "@/hooks/use-toast";

import styles from "./styles";
import { adminErrorCopy } from "../components/adminErrorCopy";

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
    toast.error(adminErrorCopy.pages.podcasts, error.message);
  }, [error]);

  return (
    <div className={styles.error}>
      <h2>{adminErrorCopy.genericHeading}</h2>
      <p>{error.message}</p>
      <button onClick={reset} className={styles.submitButton}>
        {adminErrorCopy.retry}
      </button>
    </div>
  );
}
