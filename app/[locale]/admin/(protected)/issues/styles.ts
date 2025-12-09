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
  form: cn("mb-8 p-6 bg-primary border border-secondary"),
  formTitle: cn("mb-4 text-lg font-semibold"),
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
  formActions: cn("flex gap-2"),
  submitButton: cn(
    "px-4 py-2 bg-tertiary text-white hover:bg-tertiary/90",
    "disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tertiary",
  ),
  cancelButton: cn(
    "px-4 py-2 border border-secondary hover:bg-tertiary hover:text-white",
    "transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tertiary",
  ),
  section: cn("bg-primary border border-secondary p-6"),
  sectionTitle: cn("mb-4 text-lg font-semibold"),
  empty: cn("text-secondary/60 text-center py-8"),
  list: cn("space-y-3"),
  listItem: cn("p-4 border border-secondary hover:bg-tertiary/10 transition-colors duration-150"),
  itemHeader: cn("flex items-start justify-between gap-4 mb-2"),
  itemTitle: cn("font-medium text-secondary block mb-1"),
  itemSlug: cn("text-xs text-secondary/60 font-mono bg-secondary/10 px-2 py-1 inline-block"),
  itemDescription: cn("text-sm text-secondary/80"),
  itemActions: cn("flex gap-2 flex-shrink-0"),
  editButton: cn(
    "px-3 py-1 text-sm border border-secondary hover:bg-tertiary hover:text-white",
    "transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-tertiary",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
  ),
  deleteButton: cn(
    "px-3 py-1 text-sm border border-tertiary hover:bg-tertiary hover:text-white text-tertiary",
    "transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-tertiary",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
  ),
  iconButton: cn(
    "p-2 w-8 h-8 flex items-center justify-center",
    "border border-secondary hover:bg-tertiary hover:text-white hover:border-tertiary",
    "text-secondary transition-all duration-150",
    "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-tertiary",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-secondary",
  ),
  iconButtonDanger: cn("border-tertiary text-tertiary hover:bg-tertiary hover:text-white"),
  imageUpload: cn(
    "border-2 border-dashed border-secondary p-4",
    "hover:border-tertiary transition-colors duration-150 cursor-pointer",
  ),
  imagePreview: cn("mt-4 overflow-hidden border border-secondary"),
  imagePreviewImg: cn("w-full h-48 object-cover"),
};

/* **************************************************
 * Export
 ************************************************** */
export default styles;
