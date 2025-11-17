/* **************************************************
 * Imports
 **************************************************/
"use client";

import { cn } from "@/lib/utils/classes";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

/* **************************************************
 * Types
 **************************************************/
export type SortDirection = "asc" | "desc" | null;

interface SortableHeaderProps {
  children: React.ReactNode;
  sortKey: string;
  currentSort?: { key: string; direction: SortDirection };
  onSort: (key: string) => void;
  className?: string;
}

/* **************************************************
 * Sortable Header Component
 **************************************************/
export function SortableHeader({
  children,
  sortKey,
  currentSort,
  onSort,
  className,
}: SortableHeaderProps) {
  const isActive = currentSort?.key === sortKey;
  const direction = isActive ? currentSort.direction : null;

  function handleClick() {
    onSort(sortKey);
  }

  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
        "cursor-pointer select-none hover:bg-gray-100 transition-colors",
        className,
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2">
        <span>{children}</span>
        <span className="flex-shrink-0">
          {direction === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : direction === "desc" ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
          )}
        </span>
      </div>
    </th>
  );
}

