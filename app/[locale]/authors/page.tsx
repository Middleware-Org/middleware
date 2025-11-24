/* **************************************************
 * Imports
 **************************************************/
import AuthorsList from "@/components/organism/authorsList";
import MobileAuthorsToggle from "@/components/organism/mobileAuthorsToggle";
import { getAllAuthors } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/utils";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import Author from "@/components/organism/author";
import { cn } from "@/lib/utils/classes";
import AutoScroll from "@/components/AutoScroll";

/* **************************************************
 * Types
 **************************************************/
type AuthorsPageProps = {
  params: Promise<{ locale: string }>;
};

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  container: cn("max-w-[1472px] mx-auto px-4 lg:px-10 py-6 lg:py-10"),
  mobileToggle: cn("lg:hidden md:flex flex mb-6 sticky md:top-[115px] top-0"),
  grid: cn("grid grid-cols-1 lg:grid-cols-[295px_auto] gap-10"),
  sidebar: cn("lg:sticky lg:top-[155px] md:top-[155px] lg:top-[115px] top-[115px] lg:h-fit"),
  content: cn("flex flex-col gap-10"),
};

/* **************************************************
 * Authors Page
 **************************************************/
export default async function AuthorsPage({ params }: AuthorsPageProps) {
  const { locale } = await params;
  const dictAuthors = await getDictionary(locale, TRANSLATION_NAMESPACES.AUTHORS);
  const dictCommon = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  const authors = getAllAuthors();

  return (
    <div className={styles.container}>
      <AutoScroll paramName="author" />
      {/* Mobile authors toggle */}
      <div className={styles.mobileToggle}>
        <MobileAuthorsToggle dict={dictAuthors} />
      </div>

      {/* Main grid: sidebar + content */}
      <div className={styles.grid}>
        {/* Sidebar with authors list */}
        <div className={styles.sidebar}>
          <AuthorsList authors={authors} />
        </div>

        {/* Authors content */}
        <div className={styles.content}>
          {authors.map((author) => (
            <Author
              key={author.slug}
              author={author}
              dictCommon={dictCommon}
              dictAuthors={dictAuthors}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
