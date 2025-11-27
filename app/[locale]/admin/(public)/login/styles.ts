/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles - Aligned with app design system
 ************************************************** */
const styles = {
  main: cn(
    "flex min-h-screen items-center justify-center bg-primary",
    "px-4 md:px-8 lg:px-10 py-8 md:py-12",
  ),
  container: cn(
    "w-full max-w-md bg-primary border border-secondary",
    "px-6 md:px-8 lg:px-10 py-8 md:py-10 lg:py-12",
    "flex flex-col gap-6 md:gap-8",
  ),
  header: cn("flex flex-col items-center gap-4 md:gap-6 text-center"),
  logoWrapper: cn("flex justify-center"),
  logoContainer: cn("flex items-center gap-3 md:gap-4"),
  logoText: cn("text-xl md:text-2xl hover:underline transition-colors duration-150"),
  title: cn("text-2xl md:text-3xl lg:text-4xl font-bold", "text-secondary leading-tight"),
  description: cn("text-sm md:text-base text-secondary/80"),
  error: cn(
    "p-4 bg-primary border border-secondary",
    "text-secondary/90 text-sm md:text-base",
    "flex items-center gap-2",
  ),
  form: cn("flex flex-col gap-4 md:gap-6"),
  field: cn("flex flex-col gap-2"),
  label: cn("text-sm md:text-base font-medium text-secondary", "block"),
  input: cn(
    "w-full px-4 py-3 md:py-3.5",
    "border border-secondary bg-primary text-secondary",
    "focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary",
    "disabled:bg-secondary/10 disabled:cursor-not-allowed",
    "disabled:opacity-50",
    "transition-all duration-150",
    "placeholder:text-secondary/40",
    "text-sm md:text-base",
  ),
  button: cn(
    "w-full px-6 py-3 md:py-3.5",
    "bg-secondary text-primary",
    "hover:bg-tertiary hover:text-primary",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "transition-all duration-150",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tertiary",
    "font-medium text-sm md:text-base",
    "border border-secondary",
  ),
};

/* **************************************************
 * Export
 ************************************************** */
export default styles;
