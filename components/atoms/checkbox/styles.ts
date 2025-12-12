/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Checkbox Styles
 **************************************************/
const styles = {
  container: cn("flex flex-col gap-1"),
  label: cn("flex items-center gap-2 cursor-pointer"),
  labelText: cn("text-sm text-secondary select-none"),
  checkbox: cn(
    "w-4 h-4 cursor-pointer",
    "border border-secondary bg-primary",
    "text-tertiary",
    "hover:border-tertiary",
    "focus:outline-none focus:ring-2 focus:ring-tertiary focus:ring-offset-1 focus:border-tertiary",
    "transition-all duration-150",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "disabled:hover:border-secondary",
    "checked:border-tertiary",
    "checked:hover:border-tertiary",
  ),
  checkboxError: cn("border-red-500 focus:ring-red-500 focus:border-red-500"),
  error: cn("text-xs text-red-500"),
};

/* **************************************************
 * Export
 **************************************************/
export default styles;
