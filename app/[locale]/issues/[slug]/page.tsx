/* **************************************************
 * Imports
 **************************************************/
import { Article } from "@/.velite";
import ArticleInEvidenceCard from "@/components/molecules/articleInEvidenceCard";
import Articles from "@/components/molecules/articles";
import { getArticlesByIssue, getIssueBySlug, getAllIssues } from "@/lib/content";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";
import { i18nSettings } from "@/lib/i18n/settings";
import { cn } from "@/lib/utils/classes";
import IssueCover from "./components/IssueCover";

/* **************************************************
 * Types
 **************************************************/
type IssuePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

/* **************************************************
 * Generate Static Params
 **************************************************/
export async function generateStaticParams() {
  const issues = getAllIssues();
  const locales = i18nSettings.locales;

  return issues.flatMap((issue) =>
    locales.map((locale) => ({
      locale,
      slug: issue.slug,
    }))
  );
}

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  container: cn("max-w-[1472px] mx-auto px-0 md:px-4 lg:px-10 py-0 md:py-6 lg:py-10"),
  issueContainer: cn(
    "grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 lg:gap-10 md:gap-4 gap-0 lg:mb-8 md:mb-8 mb-0 relative",
  ),
  issueCoverContainer: cn(
    "lg:sticky md:sticky lg:top-[155px] md:top-[155px] lg:self-start md:self-start",
  ),
  issueArticlesContainer: cn("flex flex-col"),
  link: cn("h-full flex flex-col px-4 pt-4 md:p-0 lg:p-0"),
  articleInEvidenceContainer: cn("mb-0 md:mb-4 lg:mb-4 px-4 pt-4 md:pt-0 lg:pt-0"),
};

export default async function IssuePage({ params }: IssuePageProps) {
  const { locale, slug } = await params;

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  const issue = getIssueBySlug(slug);
  const articles = getArticlesByIssue(slug);
  const { articleInEvidence, otherArticles } = articles.reduce(
    (acc, article) => {
      if (article.in_evidence && !acc.articleInEvidence) {
        acc.articleInEvidence = article;
      } else {
        acc.otherArticles.push(article);
      }
      return acc;
    },
    { articleInEvidence: undefined as Article | undefined, otherArticles: [] as Article[] },
  );

  if (!articleInEvidence || !issue) return null;

  return (
    <div className={styles.container}>
      <div className={styles.issueContainer}>
        <div className={styles.issueCoverContainer}>
          <div key={issue.slug} id={`issue-${issue.slug}`} className={styles.issueCoverContainer}>
            <div className={styles.link}>
              <IssueCover issue={issue} />
            </div>
          </div>
        </div>
        <div className={styles.issueArticlesContainer}>
          <div className={styles.articleInEvidenceContainer}>
            <ArticleInEvidenceCard
              article={articleInEvidence}
              dict={dict}
              issue={issue}
              disableBadges={true}
            />
          </div>
          <div className={styles.articleInEvidenceContainer}>
            <Articles
              articles={otherArticles}
              dict={dict}
              issue={issue}
              disableShowArticles={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
