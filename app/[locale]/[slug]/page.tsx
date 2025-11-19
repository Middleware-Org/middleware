import { remark } from "remark";
import remarkHtml from "remark-html";

import StaticPage from "@/components/organism/StaticPage";
import { getPageBySlug } from "@/lib/github";
import { notFound } from "next/navigation";

type Props = {
  params: {
    slug: string;
  };
};

export default async function PrivacyPolicyPage({ params }: Props) {
  const { slug } = params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const markdown = await remark().use(remarkHtml).process(page.content);

  return <StaticPage markdown={markdown} page={page} />;
}
