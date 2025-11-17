/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Base Styles - Aligned with organism components
 ************************************************** */
const styles = {
  main: cn("lg:px-10 md:px-4 px-4 py-6 max-w-[1472px] mx-auto"),
  header: cn("mb-6 flex items-center justify-between"),
  title: cn("text-2xl font-bold"),
  welcome: cn("mb-4 text-sm text-secondary"),
  backButton: cn(
    "px-4 py-2 text-sm border border-secondary",
    "hover:bg-tertiary hover:text-white transition-all duration-150",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tertiary",
  ),
  loading: cn("text-center text-secondary"),
  error: cn("mb-4 p-4 bg-tertiary/10 border border-tertiary text-tertiary"),
  errorWarning: cn("mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800"),
  grid: cn("grid grid-cols-1 md:grid-cols-2 gap-6"),
  section: cn("bg-primary border border-secondary p-6"),
  sectionTitle: cn("mb-4 text-lg font-semibold text-secondary"),
  list: cn("space-y-3"),
  listItem: cn("p-4 border border-secondary hover:bg-tertiary/10 transition-colors duration-150"),
  itemHeader: cn("flex items-start justify-between gap-4 mb-2"),
  itemTitle: cn("font-medium text-secondary flex-1"),
  itemSlug: cn("text-xs text-secondary font-mono bg-secondary/10 px-2 py-1"),
  itemDescription: cn("text-sm text-secondary/80 mb-2 line-clamp-2"),
  itemMeta: cn("flex items-center gap-2 mb-2"),
  itemDate: cn("text-xs text-secondary/60"),
  badge: cn("text-xs bg-tertiary/10 text-tertiary px-2 py-1 font-medium border border-tertiary"),
  relations: cn("mt-2 pt-2 border-t border-secondary space-y-1"),
  relation: cn("flex items-center gap-2 text-xs"),
  relationLabel: cn("font-medium text-secondary/80"),
  relationValue: cn("text-secondary"),
  // Common container styles
  container: cn("space-y-4"),
  searchContainer: cn("bg-primary p-4 border border-secondary"),
  searchRow: cn("flex items-center gap-4"),
  searchInputWrapper: cn("flex-1"),
  // Button styles
  newButton: cn(
    "px-4 py-2 bg-tertiary text-white hover:bg-tertiary/90",
    "focus:outline-none focus:ring-2 focus:ring-tertiary transition-colors",
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
  // Text styles
  textSecondary: cn("text-sm text-secondary/80"),
  textSecondaryLight: cn("text-secondary/60"),
  // Table styles
  tableContainer: cn("bg-primary border border-secondary overflow-hidden"),
  tableHeaderCell: cn(
    "px-4 py-3 text-left text-xs font-medium text-secondary/60 uppercase tracking-wider",
  ),
  tableEmptyCell: cn("text-center py-8 text-secondary/60"),
  // Success message
  successMessage: cn("mb-4 p-4 bg-tertiary/10 border border-tertiary text-tertiary"),
  successMessageGreen: cn("mb-4 p-4 bg-green-50 border border-green-200 text-green-700"),
  // Modal/Overlay styles
  modalOverlay: cn("fixed inset-0 z-50 flex items-center justify-center bg-secondary/50"),
  modalContainer: cn(
    "bg-primary shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col border border-secondary",
  ),
  modalHeader: cn("flex items-center justify-between p-4 border-b border-secondary"),
  modalTitle: cn("text-xl font-semibold text-secondary"),
  modalCloseButton: cn(
    "text-secondary/60 hover:text-secondary text-2xl leading-none transition-colors duration-150",
  ),
  modalContent: cn("flex-1 overflow-auto p-4"),
  modalFooter: cn("p-4 border-t border-secondary flex justify-end"),
  // Grid styles
  mediaGrid: cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"),
  mediaCard: cn(
    "relative group border border-secondary overflow-hidden",
    "hover:border-tertiary hover:shadow-md transition-all duration-150",
  ),
  mediaCardImage: cn("aspect-square relative"),
  mediaCardOverlay: cn(
    "absolute inset-0 bg-secondary/0 group-hover:bg-secondary/10 transition-colors duration-150",
  ),
  mediaCardName: cn(
    "absolute bottom-0 left-0 right-0 bg-secondary/70 text-primary text-xs p-2 truncate",
  ),
  // Form styles
  formContainer: cn("h-full flex flex-col"),
  input: cn(
    "w-full px-3 py-2 border border-secondary bg-primary",
    "focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-tertiary",
    "disabled:bg-secondary/10 disabled:cursor-not-allowed transition-all duration-150",
  ),
  // Loading states
  loadingText: cn("text-center py-8 text-secondary/60"),
  emptyState: cn("text-center py-8 text-secondary/60"),
  emptyStateText: cn("text-sm mt-2"),
  // Button group
  buttonGroup: cn("flex items-center gap-2"),
};

/* **************************************************
 * Export
 ************************************************** */
export default styles;
