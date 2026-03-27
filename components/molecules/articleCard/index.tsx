/* **************************************************
 * Imports
 **************************************************/
import Link from "next/link";

import Separator from "@/components/atoms/separetor";
import { H3, MonoTextBold, MonoTextLight, SerifText } from "@/components/atoms/typography";
import { getAuthorById, getCategoryById } from "@/lib/content";
import { withLocale } from "@/lib/i18n/path";
import type { CommonDictionary } from "@/lib/i18n/types";

import type { Article } from "@/.velite";

import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
type ArticleCardProps = {
  article: Article;
  dict: Pick<CommonDictionary, "articleCard">;
  locale: string;
  isPodcast?: boolean;
  orderNumber?: number;
};

/* **************************************************
 * ArticleCard
 **************************************************/
export default function ArticleCard({
  article,
  dict,
  locale,
  isPodcast = false,
  orderNumber,
}: ArticleCardProps) {
  const author = getAuthorById(article.authorId);
  const category = getCategoryById(article.categoryId);

  if (!author || !category) return null;

  const articleLink = withLocale(
    isPodcast ? `/podcast/${article.slug}` : `/articles/${article.slug}`,
    locale,
  );
  const authorLink = withLocale(`/authors?author=${author.slug}`, locale);
  const categoryLink = withLocale(`/categories?category=${category.slug}`, locale);

  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <Link href={articleLink}>
          <H3 className={styles.title}>
            {orderNumber !== undefined && `#${orderNumber} `}
            {article.title}
          </H3>
        </Link>

        <div className={styles.authorInfo}>
          <MonoTextLight className={styles.authorLabel}>{dict.articleCard.wordsBy}</MonoTextLight>
          <Link href={authorLink}>
            <MonoTextBold className={styles.authorLink}>{author.name}</MonoTextBold>
          </Link>
        </div>
      </header>
      <Separator />
      <section className={styles.section}>
        <div className={styles.excerptContainer}>
          <SerifText className={styles.excerpt}>{article.excerpt}</SerifText>
        </div>
        <div className={styles.readMore}>
          <Link href={articleLink}>
            <MonoTextBold className={styles.readMoreLink}>
              {isPodcast ? dict.articleCard.listenPodcast : dict.articleCard.readMore} →
            </MonoTextBold>
          </Link>
        </div>
      </section>
      <footer className={styles.footer}>
        <Link href={categoryLink}>
          <div className={styles.category}>
            <MonoTextLight className={styles.categoryText}>{category.name}</MonoTextLight>
          </div>
        </Link>
      </footer>
    </article>
  );
}
