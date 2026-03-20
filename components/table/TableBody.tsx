/* **************************************************
 * Imports
 **************************************************/
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/classes";

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
