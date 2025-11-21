/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useState } from "react";
import Button from "@/components/atoms/button";
import { MonoTextLight } from "@/components/atoms/typography";
import ArticleCard from "@/components/molecules/articleCard";
import type { Article, Author } from "@/.velite";
import { AuthorsDictionary, CommonDictionary } from "@/lib/i18n/types";
import styles from "./styles";

/* **************************************************
 * Constants
 **************************************************/
const INITIAL_ARTICLES_COUNT = 3;

/* **************************************************
 * Types
 **************************************************/
type AuthorArticlesProps = {
  articles: Article[];
  dictCommon: Pick<CommonDictionary, "articleCard">;
  dictAuthors: Pick<AuthorsDictionary, "page">;
  author: Author;
};

/* **************************************************
 * AuthorArticles Component
 **************************************************/
export default function AuthorArticles({
  articles,
  dictCommon,
  dictAuthors,
  author,
}: AuthorArticlesProps) {
  const [showAllArticles, setShowAllArticles] = useState(false);

  const visibleArticles = showAllArticles ? articles : articles.slice(0, INITIAL_ARTICLES_COUNT);
  const hasMoreArticles = articles.length > INITIAL_ARTICLES_COUNT;

  const toggleText = showAllArticles
    ? dictAuthors.page.hideAllArticles
    : dictAuthors.page.showAllArticles;

  return (
    <>
      {/* Articles grid */}
      <div className={styles.grid}>
        {visibleArticles.map((article) => (
          <ArticleCard key={article.slug} article={article} dict={dictCommon} />
        ))}
      </div>

      {/* Show more/less button */}
      {hasMoreArticles && (
        <div className={styles.buttonContainer}>
          <div className={styles.buttonWrapper}>
            <Button
              variants="unstyled"
              className="text-sm"
              onClick={() => setShowAllArticles(!showAllArticles)}
            >
              <MonoTextLight className={styles.buttonText}>
                {toggleText} {author.name}
              </MonoTextLight>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

