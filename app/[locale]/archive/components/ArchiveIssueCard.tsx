"use client";

/* **************************************************
 * Imports
 **************************************************/
import Image from "next/image";
import Link from "next/link";
import Separator from "@/components/atoms/separetor";
import { MonoTextBold, MonoTextLight, SerifText } from "@/components/atoms/typography";
import { lightenColor, getTextColor } from "@/lib/utils/color";
import { Article, Issue } from "@/.velite";
import { CommonDictionary } from "@/lib/i18n/types";
import { getAuthorBySlug, getCategoryBySlug } from "@/lib/content";
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Types
 **************************************************/
type ArchiveIssueCardProps = {
  issue: Issue;
  articles: Article[];
  dict: Pick<CommonDictionary, "articleCard">;
  index: number;
};

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  issueCoverContainer: cn("flex flex-col w-full md:w-1/2 lg:w-1/3 shrink-0 mb-10"),
  link: cn("h-full flex flex-col"),
  coverContainer: cn("flex flex-row items-stretch"),
  issueLabelContainer: cn("flex items-start justify-center shrink-0 relative"),
  issueLabelWrapper: cn("h-full flex items-start pt-4"),
  issueLabel: cn("whitespace-nowrap text-xl md:text-2xl lg:text-2xl p-2"),
  issueLabelLink: cn("h-full flex items-start"),
  imageWrapper: cn("relative w-full aspect-[4/3] md:aspect-square"),
  imageLink: cn("absolute inset-0 z-0"),
  image: cn("object-cover"),
  footer: cn("flex flex-col w-full shrink-0"),
  footerContainer: cn("flex flex-col lg:p-[30px] md:p-[30px] p-4 w-full"),
  issueInfo: cn("flex flex-col"),
  header: cn("flex flex-col pb-[10px]"),
  issueTitle: cn("text-xl md:text-2xl font-bold mb-3 hover:underline transition-all"),
  issueHeaderInfo: cn("flex flex-col gap-2 mb-4"),
  issueDate: cn("text-sm pb-3 border-b"),
  description: cn("text-[14px] leading-relaxed mt-4"),
  articlesSection: cn("flex flex-col mt-2"),
  articlesHeader: cn("pb-1"),
  articlesTitle: cn("text-sm!"),
  articlesList: cn("flex flex-col gap-0.5 mt-1"),
  articleItem: cn("flex flex-col gap-0.5 py-1"),
  articleTitle: cn("text-xs hover:underline leading-tight transition-all"),
  articleMeta: cn("flex items-center gap-2 text-[10px]"),
  articleAuthor: cn(""),
  articleAuthorLink: cn("hover:underline transition-all"),
  articleCategory: cn("hover:underline transition-all"),
};

/* **************************************************
 * ArchiveIssueCard
 **************************************************/
export default function ArchiveIssueCard({ issue, articles, dict, index }: ArchiveIssueCardProps) {
  const lightColor = lightenColor(issue.color);
  const { textColor, backgroundColor } = getTextColor(issue.color);

  return (
    <div
      key={issue.slug}
      id={`issue-${issue.slug}`}
      className={cn(styles.issueCoverContainer, index === 0 ? "" : "ml-0 md:ml-10")}
    >
      <div className={styles.link}>
        <div className={styles.coverContainer}>
          <div className={styles.issueLabelContainer} style={{ backgroundColor: lightColor }}>
            <Link
              href={`/issues/${issue.slug}`}
              className={styles.issueLabelLink}
              style={{
                borderLeft: `1px solid ${issue.color}`,
                borderBottom: `1px solid ${issue.color}`,
                borderTop: `1px solid ${issue.color}`,
              }}
            >
              <SerifText
                className={styles.issueLabel}
                style={{
                  color: issue.color,
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  transform: "rotate(180deg)",
                }}
              >
                {issue.title}
              </SerifText>
            </Link>
          </div>
          <div className={styles.imageWrapper} style={{ backgroundColor: issue.color }}>
            <Link href={`/issues/${issue.slug}`} className={styles.imageLink}>
              <Image
                src={issue.cover}
                alt={issue.title}
                fill
                className={styles.image}
                priority={index === 0}
                style={{ objectFit: "cover" }}
              />
            </Link>
          </div>
        </div>
        {/* IssueFooter content */}
        <footer className={styles.footer} style={{ backgroundColor: issue.color }}>
          <div className={styles.footerContainer}>
            <section className={styles.issueInfo}>
              <header className={styles.header}>
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
                <MonoTextBold className={cn(styles.articlesTitle, textColor)}>
                  Anteprima articoli ({articles.length} totali)
                </MonoTextBold>
              </div>
              <Separator className={cn(backgroundColor)} />
              <div className={styles.articlesList}>
                {articles.map((article, index) => {
                  const author = getAuthorBySlug(article.author);
                  const category = getCategoryBySlug(article.category);

                  if (!author || !category || index > 2) return null;

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
                          <Link href={`/authors?author=${author.slug}`}>
                            <span className={styles.articleAuthorLink}>{author.name}</span>
                          </Link>
                        </MonoTextLight>
                        <Link href={`/categories?category=${category.slug}`}>
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
      </div>
    </div>
  );
}
