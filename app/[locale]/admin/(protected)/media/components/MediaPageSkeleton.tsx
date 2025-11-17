/* **************************************************
 * Imports
 **************************************************/
import styles from "../styles";

/* **************************************************
 * Media Page Skeleton
 **************************************************/
export default function MediaPageSkeleton() {
  return (
    <main className={styles.main}>
      {/* Header Skeleton */}
      <div className={styles.header}>
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Upload Form Skeleton */}
      <div className={styles.form}>
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
        
        {/* Upload Area Skeleton */}
        <div className={styles.field}>
          <div className="h-5 w-20 bg-gray-200 rounded animate-pulse mb-2" />
          <div className={styles.imageUpload}>
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse mb-4" />
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Images Section Skeleton */}
      <div className="mt-8">
        <div className="h-7 w-48 bg-gray-200 rounded animate-pulse mb-4" />
        
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
    </main>
  );
}

