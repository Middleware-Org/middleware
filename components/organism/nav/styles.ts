/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  nav: cn("flex-row items-center border-r border-secondary h-full gap-0  hidden md:hidden lg:flex"),
  linkContainer: cn(
    "flex flex-row items-center border-l border-secondary h-full hover:bg-tertiary transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0",
  ),
  linkContainerMobile: cn("lg:flex md:flex hidden"),
  linkContainerVisible: cn("flex flex-row"),
  linkContainerHighlighted: cn("bg-secondary text-primary"),
  linkContainerActive: cn("bg-tertiary text-white"),
  linkText: cn("text-xs md:text-base hover:text-white px-3"),
  linkTextHighlighted: cn("text-white"),
};

/* **************************************************
 * Export
 **************************************************/
export default styles;
