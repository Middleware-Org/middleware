/* **************************************************
 * Imports
 **************************************************/

import { Article } from "@/.velite";
import Cover from "@/components/organism/cover";
import { getAllIssues, getArticlesByIssue } from "@/lib/content/queries";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";

/* **************************************************
 * Types
 **************************************************/
type RootPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function RootPage({ params }: RootPageProps) {
  const { locale } = await params;

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  const issues = getAllIssues();

  return (
    <div className="max-w-[1472px] mx-auto px-0 md:px-4 lg:px-10 py-0 md:py-6 lg:py-10">
      {issues.map((issue) => {
        const articles = getArticlesByIssue(issue.slug);

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

        if (!articleInEvidence) return null;

        return (
          <div
            key={issue.slug}
            id={`issue-${issue.slug}`}
            className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 lg:gap-10 md:gap-4 gap-0 lg:mb-8 md:mb-8 mb-0 relative"
          >
            <div className="lg:sticky md:sticky lg:top-[115px] md:top-[115px] lg:self-start md:self-start lg:h-[calc(100dvh-180px)] md:h-[calc(100dvh-180px)] h-full">
              <Cover issue={issue} articleInEvidence={articleInEvidence} dict={dict} />
            </div>
            <div className="flex flex-col lg:min-h-screen">ARTICLES</div>
          </div>
        );
      })}
    </div>
  );
}
