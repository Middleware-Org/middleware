import { getArticleBySlug } from "@/lib/content";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";
import { notFound } from "next/navigation";
import Article from "./components/Article";

interface ArticlePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { locale, slug } = await params;

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.ARTICLE);

  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <div>
      <Article article={article} dict={dict} />
    </div>
  );
}
