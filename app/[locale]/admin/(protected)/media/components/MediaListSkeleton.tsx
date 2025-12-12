/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";
import styles from "../styles";
import baseStyles from "../../styles";

/* **************************************************
 * Media Page Skeleton (unified)
 **************************************************/
export default function MediaPageSkeleton() {
  return (
    <main className={styles.main}>
      {/* Header Skeleton */}
      <div className={styles.header}>
        <div className="h-8 w-64 bg-secondary/20 animate-pulse mb-2" />
        <div className="h-10 w-24 bg-secondary/20 animate-pulse" />
      </div>

      {/* Upload Form Skeleton */}
      <div className={styles.form}>
        <div className="h-6 w-48 bg-secondary/20 animate-pulse mb-4" />

        {/* Upload Area Skeleton */}
        <div className={styles.field}>
          <div className="h-5 w-20 bg-secondary/20 animate-pulse mb-2" />
          <div className={styles.imageUpload}>
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-12 w-12 bg-secondary/20 animate-pulse mb-4" />
              <div className="h-4 w-64 bg-secondary/20 animate-pulse mb-2" />
              <div className="h-3 w-48 bg-secondary/20 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* File List Section */}
      <div className="mt-8">
        <div className="h-7 w-48 bg-secondary/20 animate-pulse mb-4" />

        {/* Search and Filter Controls Skeleton */}
        <div className={baseStyles.container}>
          <div className="mb-6 space-y-4">
            {/* Search Bar and Select All Skeleton */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                {/* Search icon placeholder */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 bg-secondary/20 animate-pulse" />
                {/* Input skeleton - using styles.input classes */}
                <div
                  className={cn("h-[34px] w-full bg-secondary/20 animate-pulse", "pl-10 pr-10")}
                />
              </div>
              {/* Select All checkbox skeleton */}
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-secondary/20 animate-pulse" />
                <div className="h-4 w-24 bg-secondary/20 animate-pulse" />
              </div>
            </div>

            {/* Type Filter Skeleton */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="h-4 w-24 bg-secondary/20 animate-pulse" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-20 bg-secondary/20 animate-pulse" />
                ))}
              </div>
            </div>

            {/* Results count Skeleton */}
            <div className="h-4 w-64 bg-secondary/20 animate-pulse" />
          </div>

          {/* Grid Skeleton */}
          <div className={styles.grid}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className={cn(styles.imageCard, "relative")}>
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
      </div>
    </main>
  );
}
