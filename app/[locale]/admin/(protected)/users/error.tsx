"use client";

/* **************************************************
 * Imports
 **************************************************/
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
 * Error Boundary
 **************************************************/
export default function Error({ error, reset }: ErrorProps) {
  return <AdminErrorView error={error} reset={reset} pageKey="users" styles={styles} />;
}
