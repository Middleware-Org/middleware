import Separator from "@/components/atoms/separetor";
import { H1, H2, MonoTextBold, MonoTextLight } from "@/components/atoms/typography";
import { cn } from "@/lib/utils/classes";
import { Article } from "@/.velite";
import HighlightedArticleContent from "./HighlightedArticleContent";
import HighlightedTextWrapper from "./HighlightedTextWrapper";
import SeparatorWithLogo from "@/components/molecules/SeparatorWithLogo";
import { formatDateByLang } from "@/lib/utils/date";
import { ArticleDictionary } from "@/lib/i18n/types";
import { getCategoryBySlug } from "@/lib/content/categories";
import { getAuthorBySlug } from "@/lib/content/authors";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMinText } from "@/lib/utils/text";
import { Book } from "lucide-react";

type ArticleProps = {
  article: Article;
  dict: Pick<ArticleDictionary, "page">;
};

export default function Article({ article, dict }: ArticleProps) {
  const author = getAuthorBySlug(article.author);
  const category = getCategoryBySlug(article.category);

  const readingTime = getMinText(article.content);

  if (!author || !category) {
    notFound();
  }

  return (
    <ArticleWithHighlighting
      article={article}
      dict={dict}
      author={author}
      category={category}
      readingTime={readingTime}
    />
  );
}

function ArticleWithHighlighting({
  article,
  dict,
  author,
  category,
  readingTime,
}: {
  article: Article;
  dict: Pick<ArticleDictionary, "page">;
  author: NonNullable<ReturnType<typeof getAuthorBySlug>>;
  category: NonNullable<ReturnType<typeof getCategoryBySlug>>;
  readingTime: string;
}) {
  return (
    <article>
      <header className="lg:px-10 md:px-4 px-4 lg:pt-10 py-[25px] w-full max-w-[1472px] mx-auto">
        <div className="flex lg:flex-row flex-col lg:justify-between">
          <div className="w-full flex flex-col">
            <div className={cn("flex gap-2.5 items-baseline")}>
              <MonoTextLight className="border-b border-secondary lg:pb-2.5 lg:text-lg text-base mb-5">
                {dict.page.wordsBy}
              </MonoTextLight>
              <Link href={`/authors#${author.slug}`}>
                <MonoTextBold className="lg:pb-2.5 lg:text-lg text-base mb-5">
                  {author.name}
                </MonoTextBold>
              </Link>
            </div>
            <H1>
              <HighlightedTextWrapper
                text={article.title}
                audioChunksUrl={article.audio_chunks}
                articleId={article.slug}
              />
            </H1>
          </div>
          <div className="flex lg:flex-col flex-row lg:justify-center justify-between lg:border-none border-t border-secondary lg:pt-5 lg:mt-0 pt-2.5 mt-2.5">
            <MonoTextLight className="lg:text-[16px] text-[14px] flex justify-end items-center gap-2.5 lg:mb-5 mb-0">
              {formatDateByLang(article.date, "it")}
            </MonoTextLight>
          </div>
        </div>
        <Separator className="lg:mt-[30px] lg:mb-2.5 mt-2.5 mb-2.5" />
        <div className="flex justify-between items-center">
          <Link href={`/categories#${category.slug}`}>
            <MonoTextLight className="hover:underline">{category.name}</MonoTextLight>
          </Link>
          <div className="lg:text-[16px] text-[12px] flex items-center gap-2 text-secondary">
            <MonoTextLight className="lg:text-[16px] text-[12px]">
              {readingTime} {dict.page.readingTime}
            </MonoTextLight>
            <Book className="w-5 h-5" />
          </div>
        </div>
      </header>
      <section className="w-full flex flex-col max-w-[1472px] mx-auto lg:px-10 md:px-4 px-4 gap-5 pb-10">
        <div className={cn("w-full lg:max-w-[75%] max-w-full")}>
          <H2 className="mb-[15px]">
            <HighlightedTextWrapper
              text={article.excerpt}
              audioChunksUrl={article.audio_chunks}
              articleId={article.slug}
            />
          </H2>
        </div>
        <div className="lg:hidden md:flex flex w-full mb-4">
          <Separator />
        </div>
        <div className={cn("flex lg:flex-row md:flex-row flex-col justify-between gap-10")}>
          <div className="lg:w-1/4 lg:flex hidden">
            <Separator />
          </div>
          <div className="lg:w-2/4 md:w-2/3 w-full relative">
            <HighlightedArticleContent
              content={article.content}
              audioChunksUrl={article.audio_chunks}
              articleId={article.slug}
            />
          </div>
          <div className="lg:w-1/4 md:w-1/3 w-full lg:flex md:flex hidden">
            <Separator />
          </div>
        </div>
      </section>
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
    </article>
  );
}
