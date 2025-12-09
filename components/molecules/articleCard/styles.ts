/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  article: cn("border border-secondary flex flex-col h-full"),
  header: cn("flex flex-col justify-end flex-1 pt-[15px] px-[15px] pb-[10px]"),
  title: cn("hover:underline flex-1"),
  playIcon: cn(
    "flex items-center justify-center",
    "w-8 h-8 md:w-10 md:h-10",
    "border border-secondary",
    "bg-primary",
    "shrink-0",
    "hover:bg-secondary hover:text-primary",
    "transition-colors duration-150",
  ),
  playIconSvg: cn("w-4 h-4 md:w-5 md:h-5 text-secondary ml-0.5"),
  authorInfo: cn("flex items-center gap-2.5"),
  authorLabel: cn("text-sm"),
  authorLink: cn("text-sm hover:underline"),
  section: cn("p-[15px] flex flex-col flex-1"),
  excerptContainer: cn("flex flex-col flex-1"),
  excerpt: cn("text-xs mb-4 leading-relaxed"),
  readMore: cn("flex justify-end"),
  readMoreLink: cn("text-xs hover:underline"),
  footer: cn("border-t border-secondary"),
  category: cn(
    "border-r border-secondary hover:bg-tertiary transition-colors duration-150 text-xs w-fit",
  ),
  categoryText: cn("hover:text-white px-2 py-1"),
};

/* **************************************************
 * Export
 **************************************************/
export default styles;
