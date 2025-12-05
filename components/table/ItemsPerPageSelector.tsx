/* **************************************************
 * Imports
 **************************************************/
"use client";

import { cn } from "@/lib/utils/classes";
import baseStyles from "@/app/[locale]/admin/(protected)/styles";

/* **************************************************
 * Types
 **************************************************/
interface ItemsPerPageSelectorProps {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
  className?: string;
}

/* **************************************************
 * Items Per Page Selector Component
 **************************************************/
export function ItemsPerPageSelector({
  value,
  onChange,
  options = [1, 5, 10, 25, 50, 100],
  className,
}: ItemsPerPageSelectorProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <label className="text-xs text-secondary/60 whitespace-nowrap">Per pagina:</label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(
          baseStyles.input,
          "w-14 h-8 px-2 py-1 text-xs text-sm",
          "border-secondary",
        )}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
