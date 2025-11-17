/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  sidebar: cn("w-64 bg-primary border-l border-secondary min-h-screen flex flex-col"),
  header: cn("p-6 border-b border-secondary"),
  title: cn("text-xl font-bold text-secondary"),
  nav: cn("flex-1 p-4"),
  navList: cn("space-y-2"),
  navItem: cn(
    "flex items-center gap-3 px-4 py-3 transition-all duration-150",
    "hover:bg-tertiary hover:text-white",
  ),
  navItemActive: cn("bg-tertiary text-white"),
  navItemInactive: cn("text-secondary hover:text-white"),
  navIcon: cn("w-5 h-5"),
  footer: cn("p-4 border-t border-secondary"),
  logoutButton: cn(
    "w-full flex items-center gap-3 px-4 py-3 transition-all duration-150",
    "hover:bg-tertiary text-secondary/60 hover:text-white",
  ),
};

/* **************************************************
 * Export
 ************************************************** */
export default styles;

