/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";
import type { ReactNode } from "react";

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
    <td className={cn("px-4 py-3 text-sm", className)} colSpan={colSpan}>
      {children}
    </td>
  );
}

