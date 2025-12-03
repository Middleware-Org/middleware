import Separator from "@/components/atoms/separetor";
import { H1, H2, MonoTextBold, MonoTextLight } from "@/components/atoms/typography";
import { cn } from "@/lib/utils/classes";
import type { Article } from "@/.velite";
import SeparatorWithLogo from "@/components/molecules/SeparatorWithLogo";
import FormattedDate from "@/components/atoms/date";
import { ArticleDictionary } from "@/lib/i18n/types";
import { getCategoryBySlug } from "@/lib/content/categories";
import { getAuthorBySlug } from "@/lib/content/authors";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMinText } from "@/lib/utils/text";
import { Book, Play } from "lucide-react";
import CitationsSection from "./CitationsSection";
import BookmarkManager from "./BookmarkManager";
import { marked } from "marked";

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

  // Estrai e processa le citazioni dal contenuto (può essere markdown o HTML già processato)
  const processCitations = (content: string) => {
    const citations: Array<{ id: string; text: string; index: number }> = [];
    const citationOrder: string[] = [];
    const citationData = new Map<string, string>();

    // Prima passata: estrai tutte le citazioni nell'ordine in cui appaiono
    // Formato: [citation:ID:text] o [citation-ID] (formato vecchio)
    const citationRegex = /\[citation:([^:]+):([^\]]+)\]/g;
    let match;

    while ((match = citationRegex.exec(content)) !== null) {
      const citationId = match[1];
      // Decodifica il testo (gestisce i due punti escapati)
      const citationText = match[2].replace(/\\:/g, ":");

      if (citationId && citationText && !citationOrder.includes(citationId)) {
        citationOrder.push(citationId);
        citationData.set(citationId, citationText);
      }
    }

    // Supporta anche il formato vecchio [citation-ID]
    const oldCitationRegex = /\[citation-([^\]]+)\]/g;
    while ((match = oldCitationRegex.exec(content)) !== null) {
      const citationId = match[1];
      if (citationId && !citationOrder.includes(citationId)) {
        citationOrder.push(citationId);
        citationData.set(citationId, ""); // Formato vecchio senza testo
      }
    }

    // Crea l'array delle citazioni con gli indici corretti
    citationOrder.forEach((citationId, index) => {
      const text = citationData.get(citationId) || "";
      if (text || citationId) {
        citations.push({
          id: citationId,
          text,
          index: index + 1,
        });
      }
    });

    // Sostituisci le citazioni con link cliccabili
    let processedContent = content;
    let currentIndex = 0;
    const indexMap = new Map<string, number>();

    // Sostituisci formato nuovo [citation:ID:text]
    processedContent = processedContent.replace(
      /\[citation:([^:]+):([^\]]+)\]/g,
      (match, citationId) => {
        if (!indexMap.has(citationId)) {
          currentIndex++;
          indexMap.set(citationId, currentIndex);
        }
        const index = indexMap.get(citationId) || 1;
        return `<a id="cit-${index}" href="#citation-${index}" class="citation-link inline text-tertiary hover:text-tertiary/80 transition-colors cursor-pointer" style="font-size: 0.7em; vertical-align: super; text-decoration: none;">${index}</a>`;
      },
    );

    // Sostituisci formato vecchio [citation-ID]
    processedContent = processedContent.replace(/\[citation-([^\]]+)\]/g, (match, citationId) => {
      if (!indexMap.has(citationId)) {
        currentIndex++;
        indexMap.set(citationId, currentIndex);
      }
      const index = indexMap.get(citationId) || 1;
      return `<a href="#citation-${index}" class="citation-link inline text-tertiary hover:text-tertiary/80 transition-colors cursor-pointer" style="font-size: 0.7em; vertical-align: super; text-decoration: none;">${index}</a>`;
    });

    // Se il contenuto non sembra essere HTML già processato, convertilo da markdown
    let processedHtml = processedContent;
    if (!processedContent.includes("<p>") && !processedContent.includes("<h")) {
      // Sembra essere ancora markdown, convertilo
      processedHtml = marked.parse(processedContent, { breaks: true }) as string;
    }

    return {
      processedHtml,
      citations,
    };
  };

  const { processedHtml, citations } = processCitations(article.content);

  return (
    <article>
      <header className="lg:px-10 md:px-4 px-4 lg:pt-10 py-[25px] w-full max-w-[1472px] mx-auto">
        <div className="w-full flex flex-col">
          <div className={cn("flex gap-2.5 items-baseline")}>
            <MonoTextLight className="border-b border-secondary lg:pb-2.5 lg:text-lg text-base mb-5">
              {dict.page.wordsBy}
            </MonoTextLight>
            <Link href={`/authors?author=${author.slug}`}>
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
            <FormattedDate date={article.date} lang="it" />
          </span>
          {article.audio && (
            <Link
              href={`/podcast/${article.slug}`}
              className="flex items-center gap-2 hover:underline"
            >
              <Play className="w-4 h-4" />
              <MonoTextLight className="lg:text-[16px] text-[14px]">
                Ascolta il podcast
              </MonoTextLight>
            </Link>
          )}
        </div>
        <Separator className="lg:mt-2.5 lg:mb-2.5 mt-2.5 mb-2.5" />
        <div className="flex justify-between items-center">
          <Link href={`/categories?category=${category.slug}`}>
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
          <H2 className="mb-[15px]">{article.excerpt}</H2>
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
            <BookmarkManager articleSlug={article.slug} contentContainerSelector=".prose" />
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
    </article>
  );
}
