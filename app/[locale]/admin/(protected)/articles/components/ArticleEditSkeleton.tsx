/* **************************************************
 * Imports
 **************************************************/
import styles from "../styles";

/* **************************************************
 * Article Edit Skeleton (Edit Article with delete section)
 **************************************************/
export default function ArticleEditSkeleton() {
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div className="h-8 w-96 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className={styles.editorContainer}>
        {/* Editor Markdown - 3/4 width */}
        <div className={styles.editorWrapper}>
          <div className="mb-2">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex-1 min-h-0 bg-white border border-gray-300 rounded-lg overflow-hidden">
            {/* Toolbar skeleton */}
            <div className="h-12 bg-gray-100 border-b border-gray-300 flex items-center gap-2 px-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-6 w-6 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
            {/* Editor content skeleton */}
            <div className="p-4 space-y-3">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Meta Panel - 1/4 width */}
        <div className={styles.metaPanel}>
          {/* Meta Card */}
          <div className={styles.metaCard}>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="space-y-4">
              <div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
              </div>
              <div>
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
              </div>
              <div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
              </div>
              <div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
              </div>
              <div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
              </div>
              <div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-20 w-full bg-gray-200 rounded animate-pulse" />
              </div>
              <div>
                <div className="h-4 w-6 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className={styles.metaCard}>
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="flex gap-2">
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Delete Section Skeleton */}
          <div className={styles.metaCard}>
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="pt-4 border-t">
              <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

