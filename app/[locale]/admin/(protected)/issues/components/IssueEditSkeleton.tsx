/* **************************************************
 * Imports
 **************************************************/
import styles from "../styles";

/* **************************************************
 * Issue Edit Skeleton (with delete section)
 **************************************************/
export default function IssueEditSkeleton() {
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div className="h-8 w-96 bg-secondary/20 animate-pulse" />
        <div className="h-10 w-24 bg-secondary/20 animate-pulse" />
      </div>

      {/* Form Skeleton */}
      <div className={styles.form}>
        <div className="h-6 w-48 bg-secondary/20 animate-pulse mb-4" />
        <div className="space-y-4">
          <div>
            <div className="h-4 w-16 bg-secondary/20 animate-pulse mb-2" />
            <div className="h-10 w-full bg-secondary/20 animate-pulse" />
          </div>
          <div>
            <div className="h-4 w-24 bg-secondary/20 animate-pulse mb-2" />
            <div className="h-24 w-full bg-secondary/20 animate-pulse" />
          </div>
          <div>
            <div className="h-4 w-20 bg-secondary/20 animate-pulse mb-2" />
            <div className="h-48 w-full bg-secondary/20 animate-pulse" />
          </div>
          <div>
            <div className="h-4 w-16 bg-secondary/20 animate-pulse mb-2" />
            <div className="h-10 w-full bg-secondary/20 animate-pulse" />
          </div>
          <div>
            <div className="h-4 w-12 bg-secondary/20 animate-pulse mb-2" />
            <div className="h-10 w-full bg-secondary/20 animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-secondary/20 animate-pulse" />
        </div>
      </div>

      {/* Delete Section Skeleton */}
      <div className="mt-6 border-t border-secondary pt-6">
        <div className="h-6 w-40 bg-secondary/20 animate-pulse mb-4" />
        <div className="h-10 w-40 bg-secondary/20 animate-pulse" />
      </div>
    </main>
  );
}
