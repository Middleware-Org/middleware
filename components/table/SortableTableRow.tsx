/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { TableRow } from "./TableRow";
import { TableCell } from "./TableCell";
import { cn } from "@/lib/utils/classes";
import type { ReactNode } from "react";

/* **************************************************
 * Types
 **************************************************/
interface SortableTableRowProps {
  id: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/* **************************************************
 * Sortable Table Row Component
 **************************************************/
export function SortableTableRow({ id, children, className, onClick }: SortableTableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn("relative", isDragging ? "z-50" : "", className)}
      onClick={onClick}
    >
      <TableCell className="w-8">
        <div
          className="cursor-grab active:cursor-grabbing touch-none flex items-center justify-center h-full"
          suppressHydrationWarning
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </TableCell>
      {children}
    </TableRow>
  );
}
