/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";
import styles from "../styles";

/* **************************************************
 * Podcast Edit Skeleton (Edit Podcast with delete section)
 **************************************************/
export default function PodcastEditSkeleton() {
  return (
    <div className={cn(styles.editorContainer, "flex-1 min-h-0 h-full")}>
      {/* Description Textarea - 3/4 width */}
      <div className={styles.editorWrapper}>
        <div className="mb-2">
          <div className="h-4 w-24 bg-secondary/20 animate-pulse" />
        </div>
        <div className="flex-1 min-h-0 bg-primary border border-secondary overflow-hidden">
          {/* Textarea content skeleton */}
          <div className="p-4 space-y-3">
            <div className="h-4 w-full bg-secondary/20 animate-pulse" />
            <div className="h-4 w-5/6 bg-secondary/20 animate-pulse" />
            <div className="h-4 w-full bg-secondary/20 animate-pulse" />
            <div className="h-4 w-4/6 bg-secondary/20 animate-pulse" />
            <div className="h-4 w-full bg-secondary/20 animate-pulse" />
            <div className="h-4 w-3/4 bg-secondary/20 animate-pulse" />
            <div className="h-4 w-full bg-secondary/20 animate-pulse" />
            <div className="h-4 w-5/6 bg-secondary/20 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Meta Panel - 1/4 width */}
      <div className={styles.metaPanel}>
        {/* Scrollable Metadata Section */}
        <div className={cn(styles.metaCard, "flex-1 overflow-y-auto min-h-0")}>
          <div className="h-6 w-32 bg-secondary/20 animate-pulse mb-4" />
          <div className="space-y-4">
            <div>
              <div className="h-4 w-16 bg-secondary/20 animate-pulse mb-2" />
              <div className="h-10 w-full bg-secondary/20 animate-pulse" />
            </div>
            <div>
              <div className="h-4 w-20 bg-secondary/20 animate-pulse mb-2" />
              <div className="h-10 w-full bg-secondary/20 animate-pulse" />
            </div>
            <div>
              <div className="h-4 w-12 bg-secondary/20 animate-pulse mb-2" />
              <div className="h-10 w-full bg-secondary/20 animate-pulse" />
            </div>
            <div>
              <div className="h-4 w-16 bg-secondary/20 animate-pulse mb-2" />
              <div className="h-10 w-full bg-secondary/20 animate-pulse" />
            </div>
            <div>
              <div className="h-4 w-20 bg-secondary/20 animate-pulse mb-2" />
              <div className="h-10 w-full bg-secondary/20 animate-pulse" />
            </div>
            <div>
              <div className="h-4 w-24 bg-secondary/20 animate-pulse mb-2" />
              <div className="h-10 w-full bg-secondary/20 animate-pulse" />
            </div>
            <div>
              <div className="h-4 w-6 bg-secondary/20 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Fixed Actions Section */}
        <div className={cn(styles.metaCard, "shrink-0")}>
          <div className="h-6 w-24 bg-secondary/20 animate-pulse mb-4" />
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-secondary/20 animate-pulse" />
            <div className="h-10 w-24 bg-secondary/20 animate-pulse" />
          </div>
          <div className="mt-4 pt-4 border-t border-secondary">
            <div className="h-10 w-40 bg-secondary/20 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
