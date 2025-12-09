/* **************************************************
 * Imports
 **************************************************/
import PageListSkeleton from "./components/PageListSkeleton";
import styles from "./styles";

/* **************************************************
 * Loading Page
 **************************************************/
export default function Loading() {
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div className="h-8 w-64 bg-secondary/20 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-secondary/20 animate-pulse" />
          <div className="h-8 w-8 bg-secondary/20 animate-pulse" />
        </div>
      </div>
      <PageListSkeleton />
    </main>
  );
}
