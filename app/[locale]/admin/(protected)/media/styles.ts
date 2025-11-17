/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles - Aligned with organism components
 ************************************************** */
const styles = {
  empty: cn("text-secondary/60 text-center py-8"),
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
  form: cn("mb-8 p-6 bg-primary border border-secondary"),
  formTitle: cn("mb-4 text-lg font-semibold"),
  field: cn("mb-4"),
  label: cn("block mb-2 text-sm font-medium text-secondary"),
  input: cn(
    "w-full px-3 py-2 border border-secondary bg-primary",
    "focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-tertiary",
    "disabled:bg-secondary/10 disabled:cursor-not-allowed transition-all duration-150",
  ),
  submitButton: cn(
    "px-4 py-2 bg-tertiary text-white hover:bg-tertiary/90",
    "disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tertiary",
  ),
  cancelButton: cn(
    "px-4 py-2 border border-secondary hover:bg-tertiary hover:text-white",
    "transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tertiary",
  ),
  imageUpload: cn(
    "border-2 border-dashed border-secondary p-4",
    "hover:border-tertiary transition-colors duration-150 cursor-pointer",
  ),
  imagePreview: cn("mt-4 overflow-hidden border border-secondary"),
  imagePreviewImg: cn("w-full h-48 object-cover"),
  grid: cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"),
  imageCard: cn(
    "relative group border border-secondary overflow-hidden",
    "hover:shadow-lg transition-shadow duration-150",
  ),
  imageCardImg: cn("w-full h-48 object-cover"),
  imageCardOverlay: cn(
    "absolute inset-0 bg-secondary/50 opacity-0 group-hover:opacity-100",
    "transition-opacity duration-150 flex items-center justify-center gap-2",
  ),
  imageCardName: cn(
    "absolute bottom-0 left-0 right-0 bg-secondary/70 text-primary text-xs p-2",
    "truncate",
  ),
  deleteButton: cn(
    "px-3 py-1 text-sm bg-tertiary text-white hover:bg-tertiary/90",
    "focus:outline-none focus:ring-2 focus:ring-tertiary transition-all duration-150",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ),
};

/* **************************************************
 * Export
 ************************************************** */
export default styles;
