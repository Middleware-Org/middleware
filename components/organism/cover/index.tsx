"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useParams } from "next/navigation";
import Image from "next/image";
import { MonoTextLight } from "@/components/atoms/typography";
import FormattedDate from "@/components/atoms/date";
import styles from "./styles";
import ArticleInEvidenceCard from "@/components/molecules/articleInEvidenceCard";
import { CommonDictionary } from "@/lib/i18n/types";
import type { Article, Issue } from "@/.velite";
import Link from "next/link";
import { getGitHubImageUrl } from "@/lib/github/images";

/* **************************************************
 * Types
 **************************************************/
type CoverProps = {
  issue: Issue;
  articleInEvidence: Article;
  dict: Pick<CommonDictionary, "articleCard">;
};

/* **************************************************
 * Constants
 **************************************************/
const IMAGE_WIDTH = 800;
const IMAGE_HEIGHT = 500;

/* **************************************************
 * Cover
 **************************************************/
export default function Cover({ issue, articleInEvidence, dict }: CoverProps) {
  const { lang = "it" } = useParams() as { lang: string };

  return (
    <div className={styles.link}>
      <div className={styles.container}>
        <div className={styles.imageWrapper} style={{ backgroundColor: issue.color }}>
          <Image
            src={getGitHubImageUrl(issue.cover)}
            alt={issue.title}
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
            className={styles.image}
            priority
          />
          <div className={styles.badgesWrapper}>
            <div className={styles.badgeDate}>
              <FormattedDate
                date={issue.date}
                lang={lang as "it"}
                className={styles.badgeTextDate}
              />
            </div>
            <div className={styles.badgeTitle}>
              <Link href={`/issues/${issue.slug}`}>
                <MonoTextLight className={styles.badgeTextTitle}>{issue.title}</MonoTextLight>
              </Link>
            </div>
          </div>
        </div>
        <div className={styles.footer} style={{ backgroundColor: issue.color }}>
          {articleInEvidence && (
            <ArticleInEvidenceCard article={articleInEvidence} dict={dict} issue={issue} />
          )}
        </div>
      </div>
    </div>
  );
}
