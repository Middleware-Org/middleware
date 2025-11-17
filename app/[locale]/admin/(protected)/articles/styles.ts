/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 ************************************************** */
const styles = {
  main: cn("p-6 max-w-[1600px] mx-auto"),
  header: cn("mb-6 flex items-center justify-between"),
  title: cn("text-2xl font-bold"),
  backButton: cn(
    "px-4 py-2 text-sm border rounded-md hover:bg-gray-50",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
  ),
  loading: cn("text-center text-gray-500"),
  error: cn("mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md"),
  errorWarning: cn("mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md"),
  editorContainer: cn("flex gap-6 h-[calc(100vh-200px)]"),
  editorWrapper: cn("flex-1 flex flex-col"),
  editorLabel: cn("block mb-2 text-sm font-medium text-gray-700"),
  metaPanel: cn("w-80 flex flex-col gap-4"),
  metaCard: cn("bg-white rounded-lg border p-4"),
  metaCardTitle: cn("text-lg font-semibold mb-4"),
  field: cn("mb-4"),
  label: cn("block mb-2 text-sm font-medium text-gray-700"),
  input: cn(
    "w-full px-3 py-2 border border-gray-300 rounded-md",
    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
    "disabled:bg-gray-100 disabled:cursor-not-allowed",
  ),
  textarea: cn(
    "w-full px-3 py-2 border border-gray-300 rounded-md",
    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
    "disabled:bg-gray-100 disabled:cursor-not-allowed resize-y",
  ),
  select: cn(
    "w-full px-3 py-2 border border-gray-300 rounded-md",
    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
    "disabled:bg-gray-100 disabled:cursor-not-allowed",
  ),
  checkbox: cn(
    "w-4 h-4 text-primary border-gray-300 rounded",
    "focus:ring-2 focus:ring-primary",
  ),
  formActions: cn("flex gap-2 mt-4"),
  submitButton: cn(
    "px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
  ),
  cancelButton: cn(
    "px-4 py-2 border rounded-md hover:bg-gray-50",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500",
  ),
  deleteButton: cn(
    "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500",
  ),
};

/* **************************************************
 * Export
 ************************************************** */
export default styles;

