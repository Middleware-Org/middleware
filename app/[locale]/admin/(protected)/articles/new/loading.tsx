/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";
import ArticleFormSkeleton from "../components/ArticleFormSkeleton";
import styles from "../styles";

/* **************************************************
 * Loading Page
 **************************************************/
export default function Loading() {
  return (
    <div className={cn("h-full flex flex-col", styles.main)}>
      <div className={styles.header}>
        <div className="h-8 w-64 bg-secondary/20 animate-pulse" />
        <div className="h-10 w-24 bg-secondary/20 animate-pulse" />
      </div>

      <div className="flex-1 min-h-0">
        <ArticleFormSkeleton />
      </div>
    </div>
  );
}
