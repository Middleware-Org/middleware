/* **************************************************
 * Imports
 **************************************************/
"use client";

import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { ReactNode } from "react";

/* **************************************************
 * Types
 **************************************************/
interface DndTableWrapperProps {
  children: ReactNode;
  items: string[];
  onDragEnd: (event: DragEndEvent) => void;
  sensors: ReturnType<typeof import("@dnd-kit/core").useSensors>;
}

/* **************************************************
 * Dnd Table Wrapper Component
 *
 * Wraps the table in DndContext to prevent hydration mismatches
 * by ensuring it's only rendered on the client
 **************************************************/
export function DndTableWrapper({ children, items, onDragEnd, sensors }: DndTableWrapperProps) {
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}
