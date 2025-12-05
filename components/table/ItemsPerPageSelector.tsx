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
    <div className={cn("flex items-center gap-1.5", className)} title="Elementi per pagina">
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(baseStyles.input, "w-14 h-8 p-0! text-xs", "border-secondary h-[34px]")}
        aria-label="Elementi per pagina"
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
