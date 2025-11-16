/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  nav: cn("flex items-center border-r border-secondary h-full"),
  linkContainer: cn(
    "border-l border-secondary h-full items-center hover:bg-tertiary transition-all duration-150 cursor-pointer",
  ),
  linkContainerMobile: cn("lg:flex md:flex hidden"),
  linkContainerVisible: cn("flex"),
  linkContainerHighlighted: cn("bg-secondary text-primary"),
  linkContainerActive: cn("bg-tertiary text-white"),
  linkText: cn("text-xs md:text-base hover:text-white px-3"),
  linkTextHighlighted: cn("text-white"),
};

/* **************************************************
 * Export
 **************************************************/
export default styles;
