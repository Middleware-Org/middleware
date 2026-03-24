"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useState } from "react";

import Button from "@/components/atoms/button";
import { MonoTextLight } from "@/components/atoms/typography";
import type { CommonDictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils/classes";
import { getTextColor } from "@/lib/utils/color";

import type { Article, Issue } from "@/.velite";

import ArticleCard from "../articleCard";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
type ArticlesProps = {
  articles: Article[];
  issue: Issue;
  disableShowArticles?: boolean;
  dict: Pick<CommonDictionary, "articleCard" | "lists">;
  orderByArticleId?: Record<string, number>;
};

/* **************************************************
 * Articles
 **************************************************/
export default function Articles({
  articles,
  dict,
  issue,
  disableShowArticles,
  orderByArticleId,
}: ArticlesProps) {
  const [showArticles, setShowArticles] = useState(false);

  /* **************************************************
   * Handlers
   **************************************************/
  const handleToggle = () => {
    setShowArticles(!showArticles);
  };

  /* **************************************************
   * Render
   **************************************************/
  return (
    <>
      <div className={styles.desktop}>
        <div className={styles.grid}>
          {articles.map((article) => (
            <ArticleCard
              key={article.slug}
              article={article}
              dict={dict}
              orderNumber={orderByArticleId?.[article.id]}
            />
          ))}
        </div>
      </div>

      {(showArticles || disableShowArticles) && (
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
                orderNumber={orderByArticleId?.[article.id]}
              />
            ))}
          </div>
        </div>
      )}

      {!disableShowArticles && (
        <div
          className={showArticles ? styles.buttonContainerOpen : styles.buttonContainer}
          style={{
            backgroundColor: issue.color,
          }}
        >
          <Button
            variants="unstyled"
            onClick={handleToggle}
            className={styles.button}
            style={{ borderColor: `${getTextColor(issue.color).color}!important` }}
          >
            <MonoTextLight style={{ color: `${getTextColor(issue.color).color}!important` }}>
              {showArticles
                ? dict.lists.hideArticles
                : `${dict.lists.showArticles} ${articles.length} ${dict.lists.articlesSuffix}`}
            </MonoTextLight>
          </Button>
        </div>
      )}
    </>
  );
}
