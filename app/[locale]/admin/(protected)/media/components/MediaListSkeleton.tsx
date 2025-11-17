/* **************************************************
 * Imports
 **************************************************/
import styles from "../styles";

/* **************************************************
 * Media List Skeleton
 **************************************************/
export default function MediaListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Grid Skeleton */}
      <div className={styles.grid}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className={styles.imageCard}>
            <div className={styles.imageCardImg + " bg-gray-200 animate-pulse"} />
            <div className={styles.imageCardName + " bg-gray-200 h-6 animate-pulse"} />
          </div>
        ))}
      </div>
    </div>
  );
}

