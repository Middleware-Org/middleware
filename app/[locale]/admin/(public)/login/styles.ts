/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles - Aligned with admin components
 ************************************************** */
const styles = {
  main: cn("flex min-h-screen items-center justify-center bg-primary"),
  container: cn(
    "w-full max-w-sm bg-primary border border-secondary rounded-lg px-8 py-6 shadow-lg",
  ),
  title: cn("mb-4 text-2xl font-bold text-secondary"),
  description: cn("mb-6 text-sm text-secondary/80"),
  error: cn(
    "mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm",
  ),
  form: cn("space-y-4"),
  field: cn("space-y-2"),
  label: cn("block text-sm font-medium text-secondary"),
  input: cn(
    "w-full px-3 py-2 border border-secondary bg-primary text-secondary",
    "focus:outline-none focus:ring-2 focus:ring-tertiary focus:border-tertiary",
    "disabled:bg-secondary/10 disabled:cursor-not-allowed transition-all duration-150",
    "placeholder:text-secondary/40",
  ),
  button: cn(
    "w-full px-4 py-2 bg-tertiary text-white hover:bg-tertiary/90",
    "disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tertiary",
    "font-medium text-sm",
  ),
};

/* **************************************************
 * Export
 ************************************************** */
export default styles;

