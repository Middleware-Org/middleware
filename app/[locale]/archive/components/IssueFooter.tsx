"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useParams } from "next/navigation";
import Link from "next/link";
import Separator from "@/components/atoms/separetor";
import { H3, MonoTextBold, MonoTextLight, SerifText } from "@/components/atoms/typography";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils/classes";
import { getTextColor } from "@/lib/utils/color";
import { formatDateByLang } from "@/lib/utils/date";
import { Article, Issue } from "@/.velite";
import { CommonDictionary } from "@/lib/i18n/types";
import { getAuthorBySlug, getCategoryBySlug } from "@/lib/content";
import styles from "./IssueFooterStyles";

/* **************************************************
 * Types
 **************************************************/
type IssueFooterProps = {
  issue: Issue;
  articles: Article[];
  dict: Pick<CommonDictionary, "articleCard">;
};

/* **************************************************
 * IssueFooter
 **************************************************/
export default function IssueFooter({ issue, articles, dict }: IssueFooterProps) {
  const { lang = "it" } = useParams() as { lang: "it" };
  const isMobile = useIsMobile();

  const { textColor, backgroundColor } = getTextColor(issue.color);

  return (
    <footer className={styles.footer} style={{ backgroundColor: issue.color }}>
      <div className={styles.container}>
        {/* Issue Info Section */}
        <section className={styles.issueInfo}>
          <header className={styles.header}>
            <div className={styles.badgesMobile}>
              <div className={styles.badgeDate}>
                <MonoTextLight className={styles.badgeTextDate}>
                  {formatDateByLang(issue.date, lang, isMobile)}
                </MonoTextLight>
              </div>
              <div className={styles.badgeTitle}>
                <MonoTextLight className={styles.badgeTextTitle}>{issue.title}</MonoTextLight>
              </div>
            </div>
            <H3 className={cn(styles.title, textColor)}>{issue.title}</H3>
            {issue.description && (
              <SerifText className={cn(styles.description, textColor)}>
                {issue.description}
              </SerifText>
            )}
          </header>
          <Separator className={cn(backgroundColor)} />
        </section>

        {/* Articles List Section */}
        <section className={styles.articlesSection}>
          <div className={styles.articlesHeader}>
            <MonoTextBold className={cn(styles.articlesTitle, textColor)}>Articoli</MonoTextBold>
          </div>
          <Separator className={cn(backgroundColor)} />
          <div className={styles.articlesList}>
            {articles.map((article) => {
              const author = getAuthorBySlug(article.author);
              const category = getCategoryBySlug(article.category);

              if (!author || !category) return null;

              return (
                <div key={article.slug} className={styles.articleItem}>
                  <Link href={`/articles/${article.slug}`}>
                    <MonoTextBold className={cn(styles.articleTitle, textColor)}>
                      {article.title}
                    </MonoTextBold>
                  </Link>
                  <div className={styles.articleMeta}>
                    <MonoTextLight className={cn(styles.articleAuthor, textColor)}>
                      {dict.articleCard.wordsBy}{" "}
                      <Link href={`/authors#${author.slug}`}>
                        <span className={styles.articleAuthorLink}>{author.name}</span>
                      </Link>
                    </MonoTextLight>
                    <Link href={`/categories#${category.slug}`}>
                      <MonoTextLight className={cn(styles.articleCategory, textColor)}>
                        {category.name}
                      </MonoTextLight>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </footer>
  );
}
