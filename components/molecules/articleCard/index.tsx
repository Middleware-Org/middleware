/* **************************************************
 * Imports
 **************************************************/
import Link from "next/link";
import type { Article } from "@/.velite";
import { Play } from "lucide-react";
import Separator from "@/components/atoms/separetor";
import { H3, MonoTextBold, MonoTextLight, SerifText } from "@/components/atoms/typography";
import { getAuthorBySlug, getCategoryBySlug } from "@/lib/content";
import { CommonDictionary } from "@/lib/i18n/types";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
type ArticleCardProps = {
  article: Article;
  dict: Pick<CommonDictionary, "articleCard">;
  isPodcast?: boolean;
};

/* **************************************************
 * ArticleCard
 **************************************************/
export default function ArticleCard({ article, dict, isPodcast = false }: ArticleCardProps) {
  const author = getAuthorBySlug(article.author);
  const category = getCategoryBySlug(article.category);

  if (!author || !category) return null;

  const articleLink = isPodcast ? `/podcast/${article.slug}` : `/articles/${article.slug}`;

  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <div className={styles.titleContainer}>
          <Link href={articleLink}>
            <H3 className={styles.title}>{article.title}</H3>
          </Link>
          {isPodcast && (
            <Link href={`/podcast/${article.slug}`} className={styles.playIcon}>
              <Play className={styles.playIconSvg} />
            </Link>
          )}
        </div>

        <div className={styles.authorInfo}>
          <MonoTextLight className={styles.authorLabel}>{dict.articleCard.wordsBy}</MonoTextLight>
          <Link href={`/authors?author=${author.slug}`}>
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
        <Link href={`/categories?category=${category.slug}`}>
          <div className={styles.category}>
            <MonoTextLight className={styles.categoryText}>{category.name}</MonoTextLight>
          </div>
        </Link>
      </footer>
    </article>
  );
}
