/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useState } from "react";
import Button from "@/components/atoms/button";
import { MonoTextLight } from "@/components/atoms/typography";
import ArticleCard from "@/components/molecules/articleCard";
import { Article, Category } from "@/.velite";
import { CategoriesDictionary, CommonDictionary } from "@/lib/i18n/types";
import styles from "./styles";

/* **************************************************
 * Constants
 **************************************************/
const INITIAL_ARTICLES_COUNT = 3;

/* **************************************************
 * Types
 **************************************************/
type CategoryArticlesProps = {
  articles: Article[];
  dictCommon: Pick<CommonDictionary, "articleCard">;
  dictCategories: Pick<CategoriesDictionary, "page">;
  category: Category;
};

/* **************************************************
 * CategoryArticles Component
 **************************************************/
export default function CategoryArticles({
  articles,
  dictCommon,
  dictCategories,
  category,
}: CategoryArticlesProps) {
  const [showAllArticles, setShowAllArticles] = useState(false);

  const visibleArticles = showAllArticles ? articles : articles.slice(0, INITIAL_ARTICLES_COUNT);
  const hasMoreArticles = articles.length > INITIAL_ARTICLES_COUNT;

  const toggleText = showAllArticles
    ? dictCategories.page.hideAllArticles
    : dictCategories.page.showAllArticles;

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
                {toggleText} {category.name}
              </MonoTextLight>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
