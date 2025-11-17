/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";
import type { ReactNode } from "react";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
interface TableCellProps {
  children: ReactNode;
  className?: string;
  colSpan?: number;
}

/* **************************************************
 * Table Cell Component
 **************************************************/
export function TableCell({ children, className, colSpan }: TableCellProps) {
  return (
    <td className={cn(styles.cell, "text-sm", className)} colSpan={colSpan}>
      {children}
    </td>
  );
}

