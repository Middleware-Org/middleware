/* **************************************************
 * Imports
 **************************************************/
import styles from "../styles";

/* **************************************************
 * Category Skeleton
 **************************************************/
export default function CategorySkeleton() {
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div className="h-8 w-64 bg-secondary/20 animate-pulse" />
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
          <div className="h-10 w-32 bg-secondary/20 animate-pulse" />
        </div>
      </div>

      {/* List Skeleton */}
      <section className={styles.section}>
        <div className="h-6 w-48 bg-secondary/20 animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.listItem}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="h-5 w-32 bg-secondary/20 animate-pulse mb-2" />
                  <div className="h-4 w-24 bg-secondary/20 animate-pulse mb-2" />
                  <div className="h-4 w-full bg-secondary/20 animate-pulse" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-20 bg-secondary/20 animate-pulse" />
                  <div className="h-8 w-20 bg-secondary/20 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
