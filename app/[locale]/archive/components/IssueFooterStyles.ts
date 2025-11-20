/* **************************************************
 * Imports
 **************************************************/
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  footer: cn("flex flex-col w-full shrink-0"),
  container: cn("flex flex-col lg:p-[30px] md:p-[30px] p-4 w-full"),
  issueInfo: cn("flex flex-col"),
  header: cn("flex flex-col justify-end pb-[10px]"),
  badgesMobile: cn("mb-2 lg:hidden md:hidden flex"),
  badgeDate: cn("bg-secondary border-primary border py-1 px-2 w-fit"),
  badgeTitle: cn("bg-primary border-secondary border py-1 px-2 w-fit"),
  badgeTextDate: cn("text-xs! md:text-base! text-primary"),
  badgeTextTitle: cn("text-xs! md:text-base!"),
  title: cn("text-3xl! mb-2"),
  description: cn("text-[14px] leading-relaxed"),
  articlesSection: cn("flex flex-col mt-2"),
  articlesHeader: cn("pb-1"),
  articlesTitle: cn("text-sm!"),
  articlesList: cn("flex flex-col gap-0.5 mt-1"),
  articleItem: cn("flex flex-col gap-0.5 py-1"),
  articleTitle: cn("text-xs hover:underline leading-tight"),
  articleMeta: cn("flex items-center gap-2 text-[10px]"),
  articleAuthor: cn(""),
  articleAuthorLink: cn("hover:underline"),
  articleCategory: cn("hover:underline"),
};

/* **************************************************
 * Export
 **************************************************/
export default styles;
