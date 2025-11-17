/* **************************************************
 * Imports
 **************************************************/
import styles from "./styles";

/* **************************************************
 * Loading Page
 **************************************************/
export default function Loading() {
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className={styles.loading}>Caricamento...</div>
    </main>
  );
}

