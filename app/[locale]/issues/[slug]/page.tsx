/* **************************************************
 * Imports
 **************************************************/
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ArticleInEvidenceCard from "@/components/molecules/articleInEvidenceCard";
import Articles from "@/components/molecules/articles";
import { getArticlesByIssue, getIssueBySlug, getAllIssues } from "@/lib/content";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { i18nSettings } from "@/lib/i18n/settings";
import { getDictionary } from "@/lib/i18n/utils";
import { cn } from "@/lib/utils/classes";
import { getBaseUrl } from "@/lib/utils/metadata";

import type { Article } from "@/.velite";

import IssueCover from "./components/IssueCover";

// Enable Incremental Static Regeneration (ISR) - revalidate every hour
export const revalidate = 3600;

/* **************************************************
 * Types
 **************************************************/
type IssuePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: IssuePageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const issue = getIssueBySlug(slug);

  if (!issue) {
    return {
      title: "Issue non trovata",
      description: "La issue richiesta non esiste",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const baseUrl = getBaseUrl();
  const issueUrl = `${baseUrl}/${locale}/issues/${slug}`;
  const description =
    issue.description.length > 160 ? `${issue.description.slice(0, 157)}...` : issue.description;

  return {
    title: issue.title,
    description,
    alternates: {
      canonical: issueUrl,
    },
    openGraph: {
      title: issue.title,
      description,
      url: issueUrl,
      type: "website",
    },
    twitter: {
      title: issue.title,
      description,
    },
  };
}

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
    })),
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

  if (!articleInEvidence || !issue) {
    notFound();
  }

  const orderByArticleId = issue.showOrder
    ? (issue.articlesOrder || []).reduce<Record<string, number>>((acc, articleId, index) => {
        acc[articleId] = index + 1;
        return acc;
      }, {})
    : undefined;

  return (
    <div className={styles.container}>
      <div className={styles.issueContainer}>
        <div className={styles.issueCoverContainer}>
          <div key={issue.slug} id={`issue-${issue.slug}`} className={styles.issueCoverContainer}>
            <div className={styles.link}>
              <IssueCover issue={issue} locale={locale} />
            </div>
          </div>
        </div>
        <div className={styles.issueArticlesContainer}>
          <div className={styles.articleInEvidenceContainer}>
            <ArticleInEvidenceCard
              article={articleInEvidence}
              dict={dict}
              issue={issue}
              locale={locale as "it" | "en"}
              disableBadges={true}
              orderNumber={orderByArticleId?.[articleInEvidence.id]}
            />
          </div>
          <div className={styles.articleInEvidenceContainer}>
            <Articles
              articles={otherArticles}
              dict={dict}
              issue={issue}
              locale={locale}
              disableShowArticles={true}
              orderByArticleId={orderByArticleId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
