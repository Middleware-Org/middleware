/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  article: cn("flex flex-col lg:p-[30px] md:p-[30px] p-4 w-full"),
  header: cn("flex flex-col justify-end pb-[10px]"),
  badgesMobile: cn("mb-2 lg:hidden md:hidden flex"),
  badgeDate: cn("bg-secondary border-primary border py-1 px-2 w-fit"),
  badgeTitle: cn("bg-primary border-secondary border py-1 px-2 w-fit"),
  badgeTextDate: cn("text-xs! md:text-base! text-primary"),
  badgeTextTitle: cn("text-xs! md:text-base!"),
  title: cn("hover:underline text-3xl!"),
  authorInfo: cn("flex items-center gap-2.5"),
  authorLabel: cn("text-sm"),
  authorLink: cn("text-sm hover:underline"),
  excerpt: cn("text-[14px] my-4! leading-relaxed"),
  readMore: cn("flex justify-end mb-4"),
  readMoreLink: cn("text-xs hover:underline"),
  category: cn("px-2 py-1 text-xs w-fit"),
  categoryLink: cn("hover:underline"),
};

/* **************************************************
 * Export
 **************************************************/
export default styles;
