/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";
import styles from "../styles";

/* **************************************************
 * Page Edit Skeleton (Edit Page with delete section)
 **************************************************/
export default function PageEditSkeleton() {
  return (
    <div className={cn(styles.editorContainer, "h-full")}>
      {/* Editor Markdown - 3/4 width */}
      <div className={styles.editorWrapper}>
        <div className="mb-2">
          <div className="h-4 w-24 bg-secondary/20 animate-pulse" />
        </div>
        <div className="flex-1 min-h-0 bg-primary border border-secondary overflow-hidden">
          {/* Toolbar skeleton */}
          <div className="h-12 bg-primary border-b border-secondary flex items-center gap-2 px-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-6 w-6 bg-secondary/20 animate-pulse" />
            ))}
          </div>
          {/* Editor content skeleton */}
          <div className="p-4 space-y-3">
            <div className="h-4 w-full bg-secondary/20 animate-pulse" />
            <div className="h-4 w-5/6 bg-secondary/20 animate-pulse" />
            <div className="h-4 w-full bg-secondary/20 animate-pulse" />
            <div className="h-4 w-4/6 bg-secondary/20 animate-pulse" />
            <div className="h-4 w-full bg-secondary/20 animate-pulse" />
            <div className="h-4 w-3/4 bg-secondary/20 animate-pulse" />
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
              <div className="h-20 w-full bg-secondary/20 animate-pulse" />
            </div>
            <div>
              <div className="h-4 w-20 bg-secondary/20 animate-pulse mb-2" />
              <div className="h-10 w-full bg-secondary/20 animate-pulse" />
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
