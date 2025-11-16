/* **************************************************
 * Imports
 **************************************************/
import Link from "next/link";
import { Article } from "@/.velite";
import Separator from "@/components/atoms/separetor";
import { H3, MonoTextBold, MonoTextLight, SerifText } from "@/components/atoms/typography";
import { getAuthorBySlug, getCategoryBySlug } from "@/lib/content/queries";
import { CommonDictionary } from "@/lib/i18n/types";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
type ArticleCardProps = {
  article: Article;
  dict: Pick<CommonDictionary, "articleCard">;
};

/* **************************************************
 * ArticleCard
 **************************************************/
export default function ArticleCard({ article, dict }: ArticleCardProps) {
  const author = getAuthorBySlug(article.author);
  const category = getCategoryBySlug(article.category);

  if (!author || !category) return null;

  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <Link href={`/articles/${article.slug}`}>
          <H3 className={styles.title}>{article.title}</H3>
        </Link>

        <div className={styles.authorInfo}>
          <MonoTextLight className={styles.authorLabel}>{dict.articleCard.wordsBy}</MonoTextLight>
          <Link href={`/authors#${author.slug}`}>
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
          <Link href={`/articles/${article.slug}`}>
            <MonoTextBold className={styles.readMoreLink}>
              {dict.articleCard.readMore} →
            </MonoTextBold>
          </Link>
        </div>
      </section>
      <footer className={styles.footer}>
        <Link href={`/categories#${category.slug}`}>
          <div className={styles.category}>
            <MonoTextLight>{category.name}</MonoTextLight>
          </div>
        </Link>
      </footer>
    </article>
  );
}
