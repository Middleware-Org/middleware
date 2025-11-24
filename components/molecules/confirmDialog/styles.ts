/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  backdrop: cn(
    "fixed inset-0 z-50 flex items-center justify-center",
    "bg-black/50 backdrop-blur-sm",
    "transition-opacity duration-200",
  ),
  dialog: cn(
    "bg-primary border border-secondary",
    "max-w-md w-full mx-4",
    "shadow-[0_4px_24px_rgba(0,0,0,0.25)]",
    "transform transition-all duration-200",
  ),
  content: cn("p-6"),
  title: cn("text-lg font-semibold mb-2 text-secondary"),
  message: cn("text-sm text-secondary/80"),
  actions: cn("flex gap-2 justify-end p-6 pt-0"),
  cancelButton: cn(
    "px-4 py-2 border border-secondary",
    "hover:bg-tertiary hover:text-white",
    "transition-all duration-150",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tertiary",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ),
  confirmButton: cn(
    "px-4 py-2 bg-tertiary text-white",
    "hover:bg-tertiary/90",
    "transition-all duration-150",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tertiary",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ),
};

/* **************************************************
 * Export
 **************************************************/
export default styles;
