/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 ************************************************** */
const styles = {
  main: cn("flex min-h-screen items-center justify-center"),
  container: cn("rounded-xl border px-8 py-6 w-full max-w-sm"),
  title: cn("mb-4 text-xl font-semibold"),
  description: cn("mb-4 text-sm text-gray-500"),
  error: cn("mb-4 rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm"),
  form: cn("space-y-4"),
  field: cn("space-y-2"),
  label: cn("block text-sm font-medium text-gray-700"),
  input: cn(
    "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm",
    "focus:outline-none focus:ring-primary focus:border-primary",
    "disabled:bg-gray-100 disabled:cursor-not-allowed"
  ),
  button: cn(
    "w-full rounded-md border px-4 py-2 text-sm font-medium",
    "bg-primary text-white hover:bg-primary/90",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
  ),
};

/* **************************************************
 * Export
 ************************************************** */
export default styles;

