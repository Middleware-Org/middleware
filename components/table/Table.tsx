/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";
import type { ReactNode } from "react";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
interface TableProps {
  children: ReactNode;
  className?: string;
}

/* **************************************************
 * Table Component
 **************************************************/
export function Table({ children, className }: TableProps) {
  return (
    <div className={styles.tableWrapper}>
      <table className={cn(styles.table, className)}>{children}</table>
    </div>
  );
}

