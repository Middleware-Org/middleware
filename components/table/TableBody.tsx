/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";
import type { ReactNode } from "react";

/* **************************************************
 * Types
 **************************************************/
interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

/* **************************************************
 * Table Body Component
 **************************************************/
export function TableBody({ children, className }: TableBodyProps) {
  return <tbody className={cn("divide-y divide-gray-200", className)}>{children}</tbody>;
}

