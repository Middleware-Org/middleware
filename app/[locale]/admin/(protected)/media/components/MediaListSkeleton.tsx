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
            {/* Checkbox Skeleton */}
            <div className="absolute top-2 left-2 z-10 h-4 w-4 bg-secondary/20 animate-pulse" />

            {/* Image Skeleton - matches h-48 from imageCardImg */}
            <div className="relative w-full h-48 bg-secondary/20 animate-pulse" />

            {/* Filename Skeleton - positioned at bottom like real card */}
            <div className="absolute bottom-0 left-0 right-0 bg-secondary/30 h-8 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
