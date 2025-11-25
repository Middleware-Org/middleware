"use client";

/* **************************************************
 * Imports
 **************************************************/
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Separator from "@/components/atoms/separetor";
import { MonoTextBold, MonoTextLight, SerifText } from "@/components/atoms/typography";
import { lightenColor, getTextColor } from "@/lib/utils/color";
import Date from "@/components/atoms/date";
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
  locale: string;
  index: number;
};

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  issueCoverContainer: cn("flex flex-col w-full md:w-1/2 lg:w-1/3 shrink-0 mb-10"),
  link: cn("h-full flex flex-col"),
  coverContainer: cn("flex flex-row flex-1 min-h-0"),
  issueLabelContainer: cn("h-full flex items-start justify-center shrink-0 relative"),
  issueLabelWrapper: cn("h-full flex items-start pt-4"),
  issueLabel: cn("whitespace-nowrap text-xl md:text-2xl lg:text-2xl p-2"),
  imageWrapper: cn("flex flex-1 min-h-0 relative"),
  image: cn("w-full h-full object-cover"),
  readAllButton: cn(
    "absolute bottom-0 right-0 px-4 py-2",
    "hover:bg-secondary hover:text-primary transition-colors duration-150",
    "z-10",
  ),
  createdAtBadge: cn("absolute top-0 right-0 px-4 py-2"),
  createdAtBadgeText: cn("text-sm"),
  readAllButtonText: cn("text-sm"),
  // Footer styles
  footer: cn("flex flex-col w-full shrink-0"),
  footerContainer: cn("flex flex-col lg:p-[30px] md:p-[30px] p-4 w-full"),
  issueInfo: cn("flex flex-col"),
  header: cn("flex flex-col justify-end pb-[10px]"),
  badgesMobile: cn("mb-2 lg:hidden md:hidden flex"),
  badgeDate: cn("bg-secondary border-primary border py-1 px-2 w-fit"),
  badgeTitle: cn("bg-primary border-secondary border py-1 px-2 w-fit"),
  badgeTextDate: cn("text-xs! md:text-base! text-primary"),
  badgeTextTitle: cn("text-xs! md:text-base!"),
  description: cn("text-[14px] leading-relaxed"),
  articlesSection: cn("flex flex-col mt-2"),
  articlesHeader: cn("pb-1"),
  articlesTitle: cn("text-sm!"),
  articlesList: cn("flex flex-col gap-0.5 mt-1"),
  articleItem: cn("flex flex-col gap-0.5 py-1"),
  articleTitle: cn("text-xs hover:underline leading-tight"),
  articleMeta: cn("flex items-center gap-2 text-[10px]"),
  articleAuthor: cn(""),
  articleAuthorLink: cn("hover:underline"),
  articleCategory: cn("hover:underline"),
};

/* **************************************************
 * Constants
 **************************************************/
const IMAGE_WIDTH = 800;
const IMAGE_HEIGHT = 500;

/* **************************************************
 * ArchiveIssueCard
 **************************************************/
export default function ArchiveIssueCard({
  issue,
  articles,
  dict,
  locale,
  index,
}: ArchiveIssueCardProps) {
  const lightColor = lightenColor(issue.color);
  const { lang = "it" } = useParams() as { lang: "it" };
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
            <div
              className={styles.issueLabelWrapper}
              style={{
                borderLeft: `1px solid ${issue.color}`,
                borderRight: `1px solid ${issue.color}`,
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
            </div>
          </div>
          <div className={styles.imageWrapper} style={{ backgroundColor: issue.color }}>
            <Image
              src={issue.cover}
              alt={issue.title}
              width={IMAGE_WIDTH}
              height={IMAGE_HEIGHT}
              className={styles.image}
              priority={index === 0}
            />
            <div
              className={styles.createdAtBadge}
              style={{
                backgroundColor: lightColor,
                borderLeft: `1px solid ${issue.color}`,
                borderBottom: `1px solid ${issue.color}`,
              }}
            >
              <MonoTextBold
                className={styles.createdAtBadgeText}
                style={{ color: `${issue.color}!important` }}
              >
                <Date date={issue.date} lang={locale as "it"} />
              </MonoTextBold>
            </div>
            <Link
              href={`/issues/${issue.slug}`}
              className={styles.readAllButton}
              style={{
                backgroundColor: lightColor,
                borderLeft: `1px solid ${issue.color}`,
                borderTop: `1px solid ${issue.color}`,
              }}
            >
              <MonoTextBold
                className={styles.readAllButtonText}
                style={{ color: `${issue.color}!important` }}
              >
                Leggi tutti gli articoli
              </MonoTextBold>
            </Link>
          </div>
        </div>
        {/* IssueFooter content */}
        <footer className={styles.footer} style={{ backgroundColor: issue.color }}>
          <div className={styles.footerContainer}>
            <section className={styles.issueInfo}>
              <header className={styles.header}>
                <div className={styles.badgesMobile}>
                  <div className={styles.badgeDate}>
                    <Date date={issue.date} lang={lang} className={styles.badgeTextDate} />
                  </div>
                  <div className={styles.badgeTitle}>
                    <MonoTextLight className={styles.badgeTextTitle}>{issue.title}</MonoTextLight>
                  </div>
                </div>
                {issue.description && (
                  <SerifText className={cn(styles.description, textColor)}>
                    {issue.description}
                  </SerifText>
                )}
              </header>
              <Separator className={cn(backgroundColor)} />
            </section>

            <section className={styles.articlesSection}>
              <div className={styles.articlesHeader}>
                <MonoTextBold className={cn(styles.articlesTitle, textColor)}>
                  Articoli
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
