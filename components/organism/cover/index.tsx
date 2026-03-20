/* **************************************************
 * Imports
 **************************************************/
import Image from "next/image";
import Link from "next/link";

import FormattedDate from "@/components/atoms/date";
import { MonoTextLight } from "@/components/atoms/typography";
import ArticleInEvidenceCard from "@/components/molecules/articleInEvidenceCard";
import { getGitHubImageUrl } from "@/lib/github/images";
import { withLocale } from "@/lib/i18n/path";
import type { CommonDictionary } from "@/lib/i18n/types";

import type { Article, Issue } from "@/.velite";

import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
type CoverProps = {
  issue: Issue;
  articleInEvidence: Article;
  dict: Pick<CommonDictionary, "articleCard">;
  locale: string;
  articleInEvidenceOrderNumber?: number;
};

/* **************************************************
 * Constants
 **************************************************/
const IMAGE_WIDTH = 800;
const IMAGE_HEIGHT = 500;

/* **************************************************
 * Cover
 **************************************************/
export default function Cover({
  issue,
  articleInEvidence,
  dict,
  locale,
  articleInEvidenceOrderNumber,
}: CoverProps) {
  const issueHref = withLocale(`/issues/${issue.slug}`, locale);

  return (
    <div className={styles.link}>
      <div className={styles.container}>
        <div className={styles.imageWrapper} style={{ backgroundColor: issue.color }}>
          <Image
            src={getGitHubImageUrl(issue.cover)}
            alt={`Copertina del numero ${issue.title} di Middleware${issue.description ? ` - ${issue.description}` : ""}`}
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
            className={styles.image}
            priority
          />
          <div className={styles.badgesWrapper}>
            <div className={styles.badgeDate}>
              <FormattedDate
                date={issue.date}
                lang={locale as "it"}
                className={styles.badgeTextDate}
              />
            </div>
            <div className={styles.badgeTitle}>
              <Link href={issueHref} aria-label={`Leggi il numero ${issue.title}`}>
                <MonoTextLight className={styles.badgeTextTitle}>{issue.title}</MonoTextLight>
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.footer} style={{ backgroundColor: issue.color }}>
          {articleInEvidence && (
            <ArticleInEvidenceCard
              article={articleInEvidence}
              dict={dict}
              issue={issue}
              locale={locale as "it" | "en"}
              orderNumber={articleInEvidenceOrderNumber}
            />
          )}
        </div>
      </div>
    </div>
  );
}
