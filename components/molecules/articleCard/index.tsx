import { Article } from "@/.velite";
import Separator from "@/components/atoms/separetor";
import { H3, MonoTextBold, MonoTextLight, SerifText } from "@/components/atoms/typography";
import { getAuthorBySlug, getCategoryBySlug } from "@/lib/content/queries";
import { CommonDictionary } from "@/lib/i18n/types";
import Link from "next/link";

type ArticleCardProps = {
  article: Article;
  dict: Pick<CommonDictionary, "articleCard">;
};

export default function ArticleCard({ article, dict }: ArticleCardProps) {
  const author = getAuthorBySlug(article.author);
  const category = getCategoryBySlug(article.category);

  if (!author || !category) return null;

  return (
    <article className="border border-secondary flex flex-col h-full">
      <header className="flex flex-col justify-end flex-1 pt-[15px] px-[15px] pb-[10px]">
        <Link href={`/articles/${article.slug}`}>
          <H3 className="hover:underline">{article.title}</H3>
        </Link>

        <div className="flex items-center gap-2.5">
          <MonoTextLight className="text-sm">{dict.articleCard.wordsBy}</MonoTextLight>
          <Link href={`/authors#${author.slug}`}>
            <MonoTextBold className="text-sm hover:underline">{author.name}</MonoTextBold>
          </Link>
        </div>
      </header>
      <Separator />
      <section className="p-[15px] flex flex-col flex-1">
        <div className="flex flex-col flex-1">
          <SerifText className="text-xs mb-4 leading-relaxed">{article.excerpt}</SerifText>
        </div>
        <div className="flex justify-end">
          <Link href={`/articles/${article.slug}`}>
            <MonoTextBold className="text-xs hover:underline">
              {dict.articleCard.readMore} →
            </MonoTextBold>
          </Link>
        </div>
      </section>
      <footer className="border-t border-secondary">
        <Link href={`/categories#${category.slug}`}>
          <div className="border-r border-secondary hover:bg-tertiary hover:text-white transition-colors duration-150 px-2 py-1 text-xs w-fit">
            <MonoTextLight>{category.name}</MonoTextLight>
          </div>
        </Link>
      </footer>
    </article>
  );
}
