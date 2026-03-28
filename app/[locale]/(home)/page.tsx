/* **************************************************
 * Imports
 **************************************************/

import Articles from "@/components/molecules/articles";
import Cover from "@/components/organism/cover";
import { getAllIssues, getArticlesByIssue } from "@/lib/content";
import { splitArticlesByEvidence } from "@/lib/content/articles";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Types
 **************************************************/
type RootPageProps = {
  params: Promise<{ locale: string }>;
};

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  container: cn("max-w-[1472px] mx-auto px-0 md:px-4 lg:px-10 py-0 md:py-6 lg:py-10"),
  issueContainer: cn(
    "grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 lg:gap-10 md:gap-4 gap-0 lg:mb-10 md:mb-10 mb-0 relative",
  ),
  issueCoverContainer: cn(
    "lg:sticky md:sticky lg:top-[155px] md:top-[155px] lg:self-start md:self-start",
  ),
  issueArticlesContainer: cn("flex flex-col"),
};

export default async function RootPage({ params }: RootPageProps) {
  const { locale } = await params;

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  const issuesWithArticles = getAllIssues()
    .map((issue) => ({
      issue,
      articles: getArticlesByIssue(issue.slug),
    }))
    .filter(({ articles }) => articles.length > 0);

  return (
    <div className={styles.container}>
      {issuesWithArticles.map(({ issue, articles }, renderedIndex) => {
        const { articleInEvidence, otherArticles } = splitArticlesByEvidence(articles);

        const orderByArticleId = issue.showOrder
          ? (issue.articlesOrder || []).reduce<Record<string, number>>((acc, articleId, index) => {
              acc[articleId] = index + 1;
              return acc;
            }, {})
          : undefined;

        return (
          <div key={issue.slug} id={`issue-${issue.slug}`} className={styles.issueContainer}>
            <div className={styles.issueCoverContainer}>
              <Cover
                issue={issue}
                articleInEvidence={articleInEvidence}
                dict={dict}
                locale={locale}
                articleInEvidenceOrderNumber={orderByArticleId?.[articleInEvidence.id]}
                imagePriority={renderedIndex === 0}
              />
            </div>
            <div className={styles.issueArticlesContainer}>
              <Articles
                articles={otherArticles}
                dict={dict}
                locale={locale}
                orderByArticleId={orderByArticleId}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
