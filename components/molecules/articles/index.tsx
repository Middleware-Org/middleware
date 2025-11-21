"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useState } from "react";
import type { Article, Issue } from "@/.velite";
import Button from "@/components/atoms/button";
import { MonoTextLight } from "@/components/atoms/typography";
import { CommonDictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils/classes";
import { getTextColor } from "@/lib/utils/color";
import ArticleCard from "../articleCard";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
type ArticlesProps = {
  articles: Article[];
  issue: Issue;
  disableShowArticles?: boolean;
  dict: Pick<CommonDictionary, "articleCard">;
};

/* **************************************************
 * Articles
 **************************************************/
export default function Articles({ articles, dict, issue, disableShowArticles }: ArticlesProps) {
  const [showArticles, setShowArticles] = useState(false);
  const { color } = getTextColor(issue.color);

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
            <ArticleCard key={article.slug} article={article} dict={dict} />
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
              <ArticleCard key={article.slug} article={article} dict={dict} />
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
            style={{ borderColor: color }}
          >
            <MonoTextLight style={{ color: `${color}!important` }}>
              {showArticles ? "Nascondi articoli" : `Mostra ${articles.length} articoli`}
            </MonoTextLight>
          </Button>
        </div>
      )}
    </>
  );
}
