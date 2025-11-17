/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles - Aligned with organism components
 ************************************************** */
const styles = {
  main: cn("lg:px-10 md:px-4 px-4 py-6 max-w-[1472px] mx-auto"),
  header: cn("mb-6 flex items-center justify-between"),
  title: cn("text-2xl font-bold"),
  backButton: cn(
    "px-4 py-2 text-sm border border-secondary",
    "hover:bg-tertiary hover:text-white transition-all duration-150",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tertiary",
  ),
  loading: cn("text-center text-secondary"),
  error: cn("mb-4 p-4 bg-tertiary/10 border border-tertiary text-tertiary"),
  errorWarning: cn("mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800"),
  editorContainer: cn("flex gap-6 h-[calc(100vh-200px)]"),
  editorWrapper: cn("flex-1 flex flex-col"),
  editorLabel: cn("block mb-2 text-sm font-medium text-secondary"),
  metaPanel: cn("w-80 flex flex-col gap-4"),
  metaCard: cn("bg-primary border border-secondary p-4"),
  metaCardTitle: cn("text-lg font-semibold mb-4"),
  field: cn("mb-4"),
  label: cn("block mb-2 text-sm font-medium text-secondary"),
  input: cn(
    "w-full px-3 py-2 border border-secondary bg-primary",
    "focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-tertiary",
    "disabled:bg-secondary/10 disabled:cursor-not-allowed transition-all duration-150",
  ),
  textarea: cn(
    "w-full px-3 py-2 border border-secondary bg-primary",
    "focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-tertiary",
    "disabled:bg-secondary/10 disabled:cursor-not-allowed resize-y transition-all duration-150",
  ),
  select: cn(
    "w-full px-3 py-2 border border-secondary bg-primary",
    "focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-tertiary",
    "disabled:bg-secondary/10 disabled:cursor-not-allowed transition-all duration-150",
  ),
  checkbox: cn(
    "w-4 h-4 text-tertiary border-secondary",
    "focus:ring-2 focus:ring-tertiary transition-all duration-150",
  ),
  formActions: cn("flex gap-2 mt-4"),
  submitButton: cn(
    "px-4 py-2 bg-tertiary text-white hover:bg-tertiary/90",
    "disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tertiary",
  ),
  cancelButton: cn(
    "px-4 py-2 border border-secondary hover:bg-tertiary hover:text-white",
    "transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tertiary",
  ),
  deleteButton: cn(
    "px-4 py-2 bg-tertiary text-white hover:bg-tertiary/90",
    "disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tertiary",
  ),
};

/* **************************************************
 * Export
 ************************************************** */
export default styles;
