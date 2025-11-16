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
  title: cn("hover:underline"),
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
    "border-r border-secondary hover:bg-tertiary hover:text-white transition-colors duration-150 px-2 py-1 text-xs w-fit",
  ),
};

/* **************************************************
 * Export
 **************************************************/
export default styles;

