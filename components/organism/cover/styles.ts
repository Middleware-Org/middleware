/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  link: cn("h-full"),
  container: cn("h-full flex flex-col"),
  imageWrapper: cn("flex flex-1 min-h-0 lg:p-0 md:p-0 px-4 pt-0 pb-4 relative order-2 md:order-1"),
  image: cn("w-full h-full object-cover max-h-[500px]"),
  badgesWrapper: cn("absolute top-8 left-8 lg:flex md:flex hidden"),
  badgeDate: cn("bg-secondary py-1 px-2 w-fit"),
  badgeTitle: cn("bg-primary py-1 px-2 w-fit"),
  badgeTextDate: cn("text-xs! md:text-base! text-primary"),
  badgeTextTitle: cn("text-xs! md:text-base!"),
  footer: cn("flex gap-2 shrink-0 order-1 md:order-2"),
};

/* **************************************************
 * Export
 **************************************************/
export default styles;
