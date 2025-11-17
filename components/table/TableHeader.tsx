/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";
import type { ReactNode } from "react";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

/* **************************************************
 * Table Header Component
 **************************************************/
export function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <thead className={cn(styles.header, className)}>
      {children}
    </thead>
  );
}

