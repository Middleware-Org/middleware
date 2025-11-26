"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useParams } from "next/navigation";
import Link from "next/link";
import Separator from "@/components/atoms/separetor";
import { H3, MonoTextBold, MonoTextLight, SerifText } from "@/components/atoms/typography";
import { cn } from "@/lib/utils/classes";
import { getTextColor } from "@/lib/utils/color";
import FormattedDate from "@/components/atoms/date";
import styles from "./styles";
import type { Article, Issue } from "@/.velite";
import { CommonDictionary } from "@/lib/i18n/types";
import { getAuthorBySlug, getCategoryBySlug } from "@/lib/content";

/* **************************************************
 * Types
 **************************************************/
type ArticleInEvidenceCardProps = {
  article: Article;
  issue: Issue;
  dict: Pick<CommonDictionary, "articleCard">;
  disableBadges?: boolean;
};

/* **************************************************
 * ArticleInEvidenceCard
 **************************************************/
export default function ArticleInEvidenceCard({
  article,
  issue,
  dict,
  disableBadges = false,
}: ArticleInEvidenceCardProps) {
  const { lang = "it" } = useParams() as { lang: "it" };

  const { textColor, backgroundColor } = getTextColor(issue.color);

  const author = getAuthorBySlug(article.author);

  const category = getCategoryBySlug(article.category);

  if (!author || !category) return null;

  return (
    <article className={styles.article} style={{ backgroundColor: issue.color }}>
      <header className={styles.header}>
        {!disableBadges && (
          <div className={styles.badgesMobile}>
            <div className={styles.badgeDate}>
              <FormattedDate date={article.date} lang={lang} className={styles.badgeTextDate} />
            </div>
            <div className={styles.badgeTitle}>
              <Link href={`/issues/${issue.slug}`}>
                <MonoTextLight className={styles.badgeTextTitle}>{issue.title}</MonoTextLight>
              </Link>
            </div>
          </div>
        )}
        <Link href={`/articles/${article.slug}`}>
          <H3 className={cn(styles.title, textColor)}>{article.title}</H3>
        </Link>

        <div className={styles.authorInfo}>
          <MonoTextLight className={cn(styles.authorLabel, textColor)}>
            {dict.articleCard.wordsBy}
          </MonoTextLight>
          <Link href={`/authors?author=${author.slug}`}>
            <MonoTextBold className={cn(styles.authorLink, textColor)}>{author.name}</MonoTextBold>
          </Link>
        </div>
      </header>
      <Separator className={cn(backgroundColor)} />
      <section>
        <SerifText className={cn(styles.excerpt, textColor)}>{article.excerpt}</SerifText>
        <div className={styles.readMore}>
          <Link href={`/articles/${article.slug}`}>
            <MonoTextBold className={cn(styles.readMoreLink, textColor)}>
              {dict.articleCard.readMore} →
            </MonoTextBold>
          </Link>
        </div>
      </section>
      <Separator className={cn(backgroundColor)} />
      <footer>
        <Link href={`/categories?category=${category.slug}`}>
          <div className={styles.category}>
            <MonoTextLight className={cn(styles.categoryLink, textColor)}>
              {category.name}
            </MonoTextLight>
          </div>
        </Link>
      </footer>
      <Separator className={cn(backgroundColor)} />
    </article>
  );
}
