/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";
import type { ReactNode } from "react";

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
    <div className="overflow-x-auto">
      <table className={cn("w-full border-collapse", className)}>{children}</table>
    </div>
  );
}

