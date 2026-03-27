import { Book, Play } from "lucide-react";
import Link from "next/link";

import FormattedDate from "@/components/atoms/date";
import Separator from "@/components/atoms/separetor";
import { H1, H2, MonoTextBold, MonoTextLight } from "@/components/atoms/typography";
import ArticleCard from "@/components/molecules/articleCard";
import SeparatorWithLogo from "@/components/molecules/SeparatorWithLogo";
import { getArticlesByIssue } from "@/lib/content/articles";
import { getPodcastById } from "@/lib/content/podcasts";
import { withLocale } from "@/lib/i18n/path";
import type { ArticleDictionary, CommonDictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils/classes";
import { processCitations } from "@/lib/utils/citations";
import { getMinText } from "@/lib/utils/text";

import type { Article, Author, Category, Issue } from "@/.velite";

import BookmarkManagerLazy from "./BookmarkManagerLazy";
import CitationsSection from "./CitationsSection";

/* **************************************************
 * Types
 **************************************************/
type ArticleProps = {
  article: Article;
  author: Author;
  category: Category;
  issue: Issue | undefined;
  dict: Pick<ArticleDictionary, "page">;
  commonDict: Pick<CommonDictionary, "articleCard">;
  locale: string;
};

/* **************************************************
 * Article
 **************************************************/
export default function Article({ article, author, category, issue, dict, commonDict, locale }: ArticleProps) {
  const readingTime = getMinText(article.content);

  const { processedHtml, citations } = processCitations(article.content);

  const relatedPodcast = article.podcastId ? getPodcastById(article.podcastId) : null;

  const relatedArticles = (() => {
    if (!issue) return [];
    return getArticlesByIssue(issue.slug).filter((a) => a.slug !== article.slug);
  })();

  const authorHref = withLocale(`/authors?author=${author.slug}`, locale);
  const categoryHref = withLocale(`/categories?category=${category.slug}`, locale);
  const podcastHref = relatedPodcast ? withLocale(`/podcast/${relatedPodcast.slug}`, locale) : null;

  return (
    <article>
      <header className="lg:px-10 md:px-4 px-4 lg:pt-10 py-[25px] w-full max-w-[1472px] mx-auto">
        <div className="w-full flex flex-col">
          <div className={cn("flex gap-2.5 items-baseline")}>
            <MonoTextLight className="border-b border-secondary lg:pb-2.5 lg:text-lg text-base mb-5">
              {dict.page.wordsBy}
            </MonoTextLight>
            <Link href={authorHref}>
              <MonoTextBold className="lg:pb-2.5 lg:text-lg text-base mb-5">
                {author.name}
              </MonoTextBold>
            </Link>
          </div>
          <H1>{article.title}</H1>
        </div>
        <Separator className="lg:mt-[30px] lg:mb-2.5 mt-2.5 mb-2.5" />
        <div className="flex flex-row justify-between">
          <span className="lg:text-[16px] text-[14px] flex items-center gap-2.5">
            <FormattedDate date={article.date} lang={locale} />
          </span>
          {relatedPodcast && (
            <Link href={podcastHref || "#"} className="flex items-center gap-2 hover:underline">
              <Play className="w-4 h-4" />
              <MonoTextLight className="lg:text-[16px] text-[14px]">
                Ascolta il podcast
              </MonoTextLight>
            </Link>
          )}
        </div>
        <Separator className="lg:mt-2.5 lg:mb-2.5 mt-2.5 mb-2.5" />
        <div className="flex justify-between items-center">
          <Link href={categoryHref}>
            <MonoTextLight className="hover:underline">{category.name}</MonoTextLight>
          </Link>
          <div className="lg:text-[16px] text-[12px] flex items-center gap-2 text-secondary">
            <Book className="w-5 h-5" />
            <MonoTextLight className="lg:text-[16px] text-[12px]">
              {readingTime} {dict.page.readingTime}
            </MonoTextLight>
          </div>
        </div>
        <Separator className="lg:mt-2.5 lg:mb-2.5 mt-2.5 mb-2.5" />
      </header>
      <section className="w-full flex flex-col max-w-[1472px] mx-auto lg:px-10 md:px-4 px-4 gap-5 pb-10">
        <div className={cn("w-full lg:max-w-[75%] max-w-full")}>
          <H2 className="text-[20px]! mb-[15px]">{article.excerpt}</H2>
        </div>
        <div className="lg:hidden md:flex flex w-full mb-4">
          <Separator />
        </div>
        <div className={cn("flex lg:flex-row md:flex-row flex-col justify-between gap-10")}>
          <div className="lg:w-1/4 lg:flex hidden">
            <Separator />
          </div>
          <div className="lg:w-2/4 md:w-2/3 w-full relative">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: processedHtml }}
            ></div>
            <BookmarkManagerLazy articleSlug={article.slug} contentContainerSelector=".prose" />
          </div>
          <div className="lg:w-1/4 md:w-1/3 w-full lg:flex md:flex hidden">
            <Separator className="lg:flex md:hidden hidden" />
          </div>
        </div>
      </section>
      {citations.length > 0 && <CitationsSection citations={citations} />}
      <footer className="flex flex-col max-w-[1472px] mx-auto lg:px-10 md:px-4 px-4 gap-5 pb-10">
        <div className="flex lg:flex-row md:flex-row flex-col justify-between gap-10">
          <div className="lg:w-1/4 lg:flex hidden"></div>
          <div className="lg:w-2/4 md:w-full w-full">
            <SeparatorWithLogo />
            <div className="py-[25px]">
              <MonoTextLight>{author.description}</MonoTextLight>
            </div>
          </div>
          <div className="lg:w-1/4 lg:flex hidden"></div>
        </div>
      </footer>
      {relatedArticles.length > 0 && (
        <>
          <div className="max-w-[1472px] mx-auto lg:px-10 md:px-4 px-4">
            <Separator />
          </div>
          <section className="max-w-[1472px] mx-auto lg:px-10 md:px-4 px-4 pb-0 pt-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedArticles.map((relatedArticle) => (
                <ArticleCard
                  key={relatedArticle.slug}
                  article={relatedArticle}
                  dict={commonDict}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </article>
  );
}
