"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useEffect, useState } from "react";

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
  locale: string;
  disableShowArticles?: boolean;
  dict: Pick<CommonDictionary, "articleCard" | "lists">;
  orderByArticleId?: Record<string, number>;
};

const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

/* **************************************************
 * Articles
 **************************************************/
export default function Articles({
  articles,
  dict,
  issue,
  locale,
  disableShowArticles,
  orderByArticleId,
}: ArticlesProps) {
  const [showArticles, setShowArticles] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);

    const updateViewport = () => {
      setIsMobileViewport(mediaQuery.matches);
    };

    updateViewport();

    mediaQuery.addEventListener("change", updateViewport);
    return () => {
      mediaQuery.removeEventListener("change", updateViewport);
    };
  }, []);

  /* **************************************************
   * Handlers
   **************************************************/
  const handleToggle = () => {
    setShowArticles(!showArticles);
  };

  const shouldRenderDesktopList = isMobileViewport !== true;
  const shouldRenderMobileList = isMobileViewport === true && (showArticles || disableShowArticles);

  /* **************************************************
   * Render
   **************************************************/
  return (
    <>
      {shouldRenderDesktopList && (
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
      )}

      {shouldRenderMobileList && (
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
      )}

      {!disableShowArticles && isMobileViewport === true && (
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
