"use client";

import { Article, Issue } from "@/.velite";
import Button from "@/components/atoms/button";
import { MonoTextLight } from "@/components/atoms/typography";
import { CommonDictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils/classes";
import { getTextColor } from "@/lib/utils/color";
import { useState } from "react";
import ArticleCard from "../articleCard";

type ArticlesProps = {
  articles: Article[];
  issue: Issue;
  disableShowArticles?: boolean;
  dict: Pick<CommonDictionary, "articleCard">;
};

export default function Articles({ articles, dict, issue, disableShowArticles }: ArticlesProps) {
  const [showArticles, setShowArticles] = useState(false);

  const { color } = getTextColor(issue.color);

  return (
    <>
      <div className="hidden lg:block md:block lg:p-0 md:p-0 p-4 relative">
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} dict={dict} />
          ))}
        </div>
      </div>

      {(showArticles || disableShowArticles) && (
        <div className={cn("lg:hidden md:hidden", !disableShowArticles ? "p-4" : "p-0")}>
          <div className="grid grid-cols-1 gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} dict={dict} />
            ))}
          </div>
        </div>
      )}

      {!disableShowArticles && (
        <div className="lg:hidden md:hidden p-4" style={{ backgroundColor: issue.color }}>
          <Button
            variants="unstyled"
            onClick={() => setShowArticles(!showArticles)}
            className="w-full p-4 bg-transparent border"
            style={{ borderColor: color, color }}
          >
            <MonoTextLight>
              {showArticles ? "Nascondi articoli" : `Mostra ${articles.length} articoli`}
            </MonoTextLight>
          </Button>
        </div>
      )}
    </>
  );
}
