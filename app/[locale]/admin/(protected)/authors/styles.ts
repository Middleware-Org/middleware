/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 ************************************************** */
const styles = {
  main: cn("p-6 max-w-4xl mx-auto"),
  header: cn("mb-6 flex items-center justify-between"),
  title: cn("text-2xl font-bold"),
  backButton: cn(
    "px-4 py-2 text-sm border rounded-md hover:bg-gray-50",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
  ),
  loading: cn("text-center text-gray-500"),
  error: cn("mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md"),
  errorWarning: cn("mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md"),
  form: cn("mb-8 p-6 bg-white rounded-lg border"),
  formTitle: cn("mb-4 text-lg font-semibold"),
  field: cn("mb-4"),
  label: cn("block mb-2 text-sm font-medium text-gray-700"),
  input: cn(
    "w-full px-3 py-2 border border-gray-300 rounded-md",
    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
    "disabled:bg-gray-100 disabled:cursor-not-allowed"
  ),
  textarea: cn(
    "w-full px-3 py-2 border border-gray-300 rounded-md",
    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
    "disabled:bg-gray-100 disabled:cursor-not-allowed resize-y"
  ),
  formActions: cn("flex gap-2"),
  submitButton: cn(
    "px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
  ),
  cancelButton: cn(
    "px-4 py-2 border rounded-md hover:bg-gray-50",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
  ),
  section: cn("bg-white rounded-lg border p-6"),
  sectionTitle: cn("mb-4 text-lg font-semibold"),
  empty: cn("text-gray-500 text-center py-8"),
  list: cn("space-y-3"),
  listItem: cn("p-4 border rounded-md hover:bg-gray-50"),
  itemHeader: cn("flex items-start justify-between gap-4 mb-2"),
  itemTitle: cn("font-medium text-gray-900 block mb-1"),
  itemSlug: cn("text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block"),
  itemDescription: cn("text-sm text-gray-600"),
  itemActions: cn("flex gap-2 flex-shrink-0"),
  editButton: cn(
    "px-3 py-1 text-sm border rounded hover:bg-blue-50",
    "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
  ),
  deleteButton: cn(
    "px-3 py-1 text-sm border border-red-300 rounded hover:bg-red-50 text-red-700",
    "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
  ),
};

/* **************************************************
 * Export
 ************************************************** */
export default styles;

