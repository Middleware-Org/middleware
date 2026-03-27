/* **************************************************
 * Imports
 **************************************************/
import AutoScroll from "@/components/AutoScroll";
import Author from "@/components/organism/author";
import AuthorsList from "@/components/organism/authorsList";
import MobileAuthorsToggle from "@/components/organism/mobileAuthorsToggle";
import SidebarPageLayout from "@/components/organism/sidebarPageLayout";
import { getAllAuthors } from "@/lib/content";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";

/* **************************************************
 * Types
 **************************************************/
type AuthorsPageProps = {
  params: Promise<{ locale: string }>;
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
    <>
      <AutoScroll paramName="author" />
      <SidebarPageLayout
        mobileToggle={<MobileAuthorsToggle dict={dictAuthors} authors={authors} />}
        sidebar={<AuthorsList authors={authors} />}
      >
        {authors.map((author, index) => (
          <Author
            key={author.slug}
            author={author}
            dictCommon={dictCommon}
            dictAuthors={dictAuthors}
            isLastAuthor={index === authors.length - 1}
            locale={locale}
          />
        ))}
      </SidebarPageLayout>
    </>
  );
}
