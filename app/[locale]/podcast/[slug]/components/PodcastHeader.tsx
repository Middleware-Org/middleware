"use client";

/* **************************************************
 * Imports
 **************************************************/
import Image from "next/image";
import Link from "next/link";
import { MonoTextLight, SerifText } from "@/components/atoms/typography";
import { Article } from "@/.velite";
import FormattedDate from "@/components/atoms/date";
import { useParams } from "next/navigation";
import styles from "./PodcastPlayerStyles";
import { getGitHubImageUrl } from "@/lib/github/images";

/* **************************************************
 * Types
 **************************************************/
type PodcastHeaderProps = {
  article: Article;
  issue?: { cover?: string; title: string } | null;
  author?: { slug: string; name: string } | null;
  category?: { slug: string; name: string } | null;
};

/* **************************************************
 * PodcastHeader
 **************************************************/
export default function PodcastHeader({ article, issue, author, category }: PodcastHeaderProps) {
  const { lang = "it" } = useParams() as { lang: "it" };

  return (
    <div className={styles.headerSection}>
      {issue?.cover && (
        <div className={styles.coverWrapper}>
          <Image
            src={getGitHubImageUrl(issue.cover)}
            alt={issue.title}
            fill
            className={styles.coverImage}
            priority
            style={{ objectFit: "cover" }}
          />
        </div>
      )}
      <div className={styles.infoSection}>
        <div className={styles.infoContainer}>
          <div className={styles.textContainer}>
            <SerifText className={styles.textTitle}>{article.title}</SerifText>
            <Link href={`/authors?author=${author?.slug}`}>
              <MonoTextLight className={styles.textAuthor}>{author?.name}</MonoTextLight>
            </Link>
            {category && (
              <Link href={`/categories?category=${category.slug}`}>
                <MonoTextLight className={styles.textAuthor}>{category.name}</MonoTextLight>
              </Link>
            )}
            {article.date && (
              <FormattedDate date={article.date} lang={lang} className={styles.textDate} />
            )}
            {/* <Link
              href="https://github.com/resemble-ai/chatterbox"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MonoTextLight className={styles.textTTS}>
                Podcast powered by Chatterbox-TTS by Resemble AI (2025)
              </MonoTextLight>
            </Link> */}
          </div>
        </div>
      </div>
    </div>
  );
}
