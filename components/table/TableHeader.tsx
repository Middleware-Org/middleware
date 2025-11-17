/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";
import type { ReactNode } from "react";

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
    <thead className={cn("bg-gray-50 border-b border-gray-200", className)}>
      {children}
    </thead>
  );
}

