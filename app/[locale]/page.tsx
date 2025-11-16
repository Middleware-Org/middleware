/* **************************************************
 * Imports
 **************************************************/

import Cover from "@/components/organism/cover";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";

/* **************************************************
 * Types
 **************************************************/
type RootPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function RootPage({ params }: RootPageProps) {
  const { locale } = await params;

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  console.log(dict);

  const issues: {
    id: string;
    articles: {
      id: string;
      in_evidence: boolean;
      title: string;
      date: string;
      cover: string;
      alt_cover: string;
      color: string;
      excerpt: string;
      author: {
        id: string;
        name: string;
      };
      category: {
        id: string;
        name: string;
      };
    }[];
    title: string;
    date: string;
    cover: string;
    alt_cover: string;
    color: string;
  }[] = [
    {
      id: "1",
      title: "Test",
      date: "2025-01-01",
      cover: "https://via.placeholder.com/150",
      alt_cover: "Test",
      color: "red",
      articles: [
        {
          id: "1",
          in_evidence: true,
          title: "Test",
          date: "2025-01-01",
          cover: "https://via.placeholder.com/150",
          alt_cover: "Test",
          color: "red",
          excerpt: "Test",
          author: {
            id: "1",
            name: "Test",
          },
          category: {
            id: "1",
            name: "Test",
          },
        },
        {
          id: "2",
          in_evidence: false,
          title: "Test",
          date: "2025-01-01",
          cover: "https://via.placeholder.com/150",
          alt_cover: "Test",
          color: "red",
          excerpt: "Test",
          author: {
            id: "1",
            name: "Test",
          },
          category: {
            id: "1",
            name: "Test",
          },
        },
      ],
    },
  ];

  return (
    <div className="max-w-[1472px] mx-auto px-0 md:px-4 lg:px-10 py-0 md:py-6 lg:py-10">
      {issues.map((issue) => {
        const articleInEvidence = issue.articles.find((article) => article.in_evidence);

        const articles = issue.articles.filter((article) => article.id !== articleInEvidence?.id);

        if (!articleInEvidence || !articles) return null;

        return (
          <div
            key={issue.id}
            id={`issue-${issue.id}`}
            className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 lg:gap-10 md:gap-4 gap-0 lg:mb-8 md:mb-8 mb-0 relative"
          >
            <div className="lg:sticky md:sticky lg:top-[115px] md:top-[115px] lg:self-start md:self-start lg:h-[calc(100dvh-180px)] md:h-[calc(100dvh-180px)] h-full">
              <Cover issue={issue} articleInEvidence={articleInEvidence} dict={dict} />
            </div>
            <div className="flex flex-col lg:min-h-screen">ARTICLES</div>
          </div>
        );
      })}
    </div>
  );
}
