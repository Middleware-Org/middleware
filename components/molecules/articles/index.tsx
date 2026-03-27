/* **************************************************
 * Imports
 **************************************************/
import type { Article } from "@/.velite";
import type { CommonDictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils/classes";

import ArticleCard from "../articleCard";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
type ArticlesProps = {
  articles: Article[];
  locale: string;
  disableShowArticles?: boolean;
  dict: Pick<CommonDictionary, "articleCard">;
  orderByArticleId?: Record<string, number>;
};

/* **************************************************
 * Articles
 **************************************************/
export default function Articles({
  articles,
  dict,
  locale,
  disableShowArticles,
  orderByArticleId,
}: ArticlesProps) {
  return (
    <>
      <div className={styles.desktop}>
        <div className={styles.grid}>
          {articles.map((article) => (
            <ArticleCard
              key={article.slug}
              article={article}
              dict={dict}
              locale={locale}
              orderNumber={orderByArticleId?.[article.id]}
            />
          ))}
        </div>
      </div>

      <div
        className={cn(
          styles.mobile,
          !disableShowArticles ? styles.mobileWithPadding : styles.mobileWithoutPadding,
        )}
      >
        <div className={styles.mobileGrid}>
          {articles.map((article) => (
            <ArticleCard
              key={article.slug}
              article={article}
              dict={dict}
              locale={locale}
              orderNumber={orderByArticleId?.[article.id]}
            />
          ))}
        </div>
      </div>
    </>
  );
}
