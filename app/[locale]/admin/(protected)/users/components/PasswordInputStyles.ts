/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  container: cn("flex flex-col gap-2"),
  inputWrapper: cn("relative flex items-center"),
  input: cn(
    "w-full px-4 py-2",
    "border border-secondary bg-primary text-secondary",
    "focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-tertiary",
    "disabled:bg-secondary/10 disabled:cursor-not-allowed",
    "transition-all duration-150",
    "placeholder:text-secondary/40",
    "pr-24", // Spazio per i bottoni
  ),
  inputError: cn("border-red-500 focus:border-red-500 focus:ring-red-500"),
  actions: cn("absolute right-2 flex items-center gap-2"),
  generateButton: cn(
    "p-2 hover:bg-secondary/20 transition-colors duration-150",
    "flex items-center justify-center",
    "text-secondary hover:text-tertiary",
  ),
  generateIcon: cn("w-4 h-4"),
  toggleButton: cn(
    "p-2 hover:bg-secondary/20 transition-colors duration-150",
    "flex items-center justify-center",
    "text-secondary hover:text-tertiary",
  ),
  toggleIcon: cn("w-4 h-4"),
  strengthContainer: cn("flex flex-col gap-2"),
  strengthBar: cn("w-full h-2 bg-secondary/20 rounded-full overflow-hidden"),
  strengthBarFill: cn("h-full transition-all duration-300 rounded-full"),
  strengthInfo: cn("flex items-center justify-between text-xs"),
  strengthLabel: cn("font-medium text-secondary"),
  strengthLabelError: cn("text-red-500"),
  strengthWarning: cn("text-red-500 text-xs"),
  feedbackList: cn("list-disc list-inside text-xs text-secondary/80 space-y-1"),
  feedbackItem: cn(""),
};

/* **************************************************
 * Export
 **************************************************/
export default styles;
