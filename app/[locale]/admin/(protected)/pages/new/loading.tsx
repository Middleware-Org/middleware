/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";
import PageFormSkeleton from "../components/PageFormSkeleton";
import styles from "../styles";

/* **************************************************
 * Loading Page
 **************************************************/
export default function Loading() {
  return (
    <div className={cn("h-full flex flex-col", styles.main)}>
      <div className={styles.header}>
        <div className="h-8 w-64 bg-secondary/20 animate-pulse" />
      </div>

      <div className="flex-1 min-h-0">
        <PageFormSkeleton />
      </div>
    </div>
  );
}
