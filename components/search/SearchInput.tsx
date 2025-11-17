/* **************************************************
 * Imports
 **************************************************/
"use client";

import { cn } from "@/lib/utils/classes";
import { Search } from "lucide-react";

/* **************************************************
 * Types
 **************************************************/
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/* **************************************************
 * Search Input Component
 **************************************************/
export function SearchInput({
  value,
  onChange,
  placeholder = "Cerca...",
  className,
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
          "text-sm",
        )}
      />
    </div>
  );
}
