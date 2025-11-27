/* **************************************************
 * Imports
 **************************************************/
import { getAllIssues, getArticlesByIssue } from "@/lib/content";
import { cn } from "@/lib/utils/classes";
import ArchiveScrollWrapper from "./components/ArchiveScrollWrapper";
import ArchiveIssueCard from "./components/ArchiveIssueCard";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";

/* **************************************************
 * Types
 **************************************************/
type ArchivePageProps = {
  params: Promise<{ locale: string }>;
};

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  wrapper: cn("mx-auto max-w-[1472px] w-full lg:my-10 md:my-0 my-0"),
};

/* **************************************************
 * Archive Page
 **************************************************/
export default async function ArchivePage({ params }: ArchivePageProps) {
  const { locale } = await params;
  const issues = getAllIssues();
  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  return (
    <div className={styles.wrapper}>
      <ArchiveScrollWrapper stickyOffset={155}>
        {issues.map((issue, index) => {
          const articles = getArticlesByIssue(issue.slug);

          return (
            <ArchiveIssueCard
              key={issue.slug}
              issue={issue}
              articles={articles}
              dict={dict}
              index={index}
            />
          );
        })}
      </ArchiveScrollWrapper>
    </div>
  );
}
