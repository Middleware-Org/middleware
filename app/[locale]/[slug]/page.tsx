/* **************************************************
 * Imports
 **************************************************/
import StaticPage from "@/components/organism/StaticPage";
import { getPageBySlug } from "@/lib/content";
import { notFound } from "next/navigation";

/* **************************************************
 * Types
 **************************************************/
type Props = {
  params: Promise<{ slug: string }>;
};

/* **************************************************
 * Page
 **************************************************/
export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  const page = getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return <StaticPage page={page} />;
}
