/* **************************************************
 * Imports
 **************************************************/
import Link from "next/link";
import Separator from "@/components/atoms/separetor";
import { H3, MonoTextBold, MonoTextLight, SerifText } from "@/components/atoms/typography";
import { cn } from "@/lib/utils/classes";
import { getTextColor } from "@/lib/utils/color";
import FormattedDate from "@/components/atoms/date";
import styles from "./styles";
import type { Article, Issue } from "@/.velite";
import { CommonDictionary } from "@/lib/i18n/types";
import { getAuthorById, getCategoryById } from "@/lib/content";
import { withLocale } from "@/lib/i18n/path";

/* **************************************************
 * Types
 **************************************************/
type ArticleInEvidenceCardProps = {
  article: Article;
  issue: Issue;
  dict: Pick<CommonDictionary, "articleCard">;
  locale: "it" | "en";
  disableBadges?: boolean;
  orderNumber?: number;
};

/* **************************************************
 * ArticleInEvidenceCard
 **************************************************/
export default function ArticleInEvidenceCard({
  article,
  issue,
  dict,
  locale,
  disableBadges = false,
  orderNumber,
}: ArticleInEvidenceCardProps) {
  const { textColor, backgroundColor } = getTextColor(issue.color);

  const author = getAuthorById(article.authorId);
  const category = getCategoryById(article.categoryId);

  if (!author || !category) return null;

  const issueHref = withLocale(`/issues/${issue.slug}`, locale);
  const articleHref = withLocale(`/articles/${article.slug}`, locale);
  const authorHref = withLocale(`/authors?author=${author.slug}`, locale);
  const categoryHref = withLocale(`/categories?category=${category.slug}`, locale);

  return (
    <article className={styles.article} style={{ backgroundColor: issue.color }}>
      <header className={styles.header}>
        {!disableBadges && (
          <div className={styles.badgesMobile}>
            <div className={styles.badgeDate}>
              <FormattedDate date={article.date} lang={locale} className={styles.badgeTextDate} />
            </div>
            <div className={styles.badgeTitle}>
              <Link href={issueHref}>
                <MonoTextLight className={styles.badgeTextTitle}>{issue.title}</MonoTextLight>
              </Link>
            </div>
          </div>
        )}
        <Link href={articleHref}>
          <H3 className={cn(styles.title, textColor)}>
            {orderNumber !== undefined && `#${orderNumber} `}
            {article.title}
          </H3>
        </Link>

        <div className={styles.authorInfo}>
          <MonoTextLight className={cn(styles.authorLabel, textColor)}>
            {dict.articleCard.wordsBy}
          </MonoTextLight>
          <Link href={authorHref}>
            <MonoTextBold className={cn(styles.authorLink, textColor)}>{author.name}</MonoTextBold>
          </Link>
        </div>
      </header>
      <Separator className={cn(backgroundColor)} />
      <section>
        <SerifText className={cn(styles.excerpt, textColor)}>{article.excerpt}</SerifText>
        <div className={styles.readMore}>
          <Link href={articleHref}>
            <MonoTextBold className={cn(styles.readMoreLink, textColor)}>
              {dict.articleCard.readMore} →
            </MonoTextBold>
          </Link>
        </div>
      </section>
      <Separator className={cn(backgroundColor)} />
      <footer>
        <Link href={categoryHref}>
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
