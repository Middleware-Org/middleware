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
            {/* Image Skeleton - matches h-48 from imageCardImg */}
            <div className="relative w-full h-48 bg-gray-200 animate-pulse" />
            
            {/* Filename Skeleton - positioned at bottom like real card */}
            <div className="absolute bottom-0 left-0 right-0 bg-gray-300/80 h-8 animate-pulse" />
            
            {/* Overlay Skeleton (hidden but maintains structure) */}
            <div className={styles.imageCardOverlay} style={{ opacity: 0 }}>
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

