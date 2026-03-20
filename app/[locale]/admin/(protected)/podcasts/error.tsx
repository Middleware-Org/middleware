/* **************************************************
 * Imports
 **************************************************/
"use client";

import styles from "./styles";
import AdminErrorView from "../components/AdminErrorView";

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
  return <AdminErrorView error={error} reset={reset} pageKey="podcasts" styles={styles} />;
}
