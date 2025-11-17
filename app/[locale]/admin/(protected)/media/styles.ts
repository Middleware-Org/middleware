/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 ************************************************** */
const styles = {
  empty: cn("text-gray-500 text-center py-8"),
  main: cn("p-6 max-w-7xl mx-auto"),
  header: cn("mb-6 flex items-center justify-between"),
  title: cn("text-2xl font-bold"),
  backButton: cn(
    "px-4 py-2 text-sm border rounded-md hover:bg-gray-50",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
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
    "disabled:bg-gray-100 disabled:cursor-not-allowed",
  ),
  submitButton: cn(
    "px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
  ),
  cancelButton: cn(
    "px-4 py-2 border rounded-md hover:bg-gray-50",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500",
  ),
  imageUpload: cn(
    "border-2 border-dashed border-gray-300 rounded-lg p-4",
    "hover:border-primary transition-colors cursor-pointer",
  ),
  imagePreview: cn("mt-4 rounded-lg overflow-hidden border border-gray-300"),
  imagePreviewImg: cn("w-full h-48 object-cover"),
  grid: cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"),
  imageCard: cn(
    "relative group border border-gray-300 rounded-lg overflow-hidden",
    "hover:shadow-lg transition-shadow",
  ),
  imageCardImg: cn("w-full h-48 object-cover"),
  imageCardOverlay: cn(
    "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100",
    "transition-opacity flex items-center justify-center gap-2",
  ),
  imageCardName: cn(
    "absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2",
    "truncate",
  ),
  deleteButton: cn(
    "px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700",
    "focus:outline-none focus:ring-2 focus:ring-red-500",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ),
};

/* **************************************************
 * Export
 ************************************************** */
export default styles;
