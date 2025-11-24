/* **************************************************
 * Imports
 **************************************************/
import styles from "../styles";

/* **************************************************
 * Dashboard Skeleton
 **************************************************/
export default function DashboardSkeleton() {
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div>
          <div className="h-8 w-48 bg-secondary/20 animate-pulse mb-2" />
          <div className="h-4 w-64 bg-secondary/20 animate-pulse" />
        </div>
      </div>

      <div className={styles.statsGrid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statCardHeader}>
              <div className="h-12 w-12 bg-secondary/20 animate-pulse rounded" />
              <div className={styles.statCardInfo}>
                <div className="h-6 w-24 bg-secondary/20 animate-pulse mb-2" />
                <div className="h-4 w-32 bg-secondary/20 animate-pulse" />
              </div>
            </div>
            <div className={styles.statCardFooter}>
              <div className="h-10 w-16 bg-secondary/20 animate-pulse" />
              <div className="h-4 w-20 bg-secondary/20 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

