/* **************************************************
 * Imports
 **************************************************/
import Link from "next/link";

import Separator from "@/components/atoms/separetor";
import { H3, MonoTextBold, SerifText } from "@/components/atoms/typography";
import { withLocale } from "@/lib/i18n/path";
import type { CommonDictionary } from "@/lib/i18n/types";

import type { Podcast } from "@/.velite";

import styles from "../articleCard/styles";

/* **************************************************
 * Types
 **************************************************/
type PodcastCardProps = {
  podcast: Podcast;
  dict: Pick<CommonDictionary, "articleCard">;
  locale: string;
};

/* **************************************************
 * PodcastCard
 **************************************************/
export default function PodcastCard({ podcast, dict, locale }: PodcastCardProps) {
  const podcastLink = withLocale(`/podcast/${podcast.slug}`, locale);

  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <Link href={podcastLink}>
          <H3 className={styles.title}>{podcast.title}</H3>
        </Link>
      </header>
      <Separator />
      <section className={styles.section}>
        <div className={styles.excerptContainer}>
          <SerifText className={styles.excerpt}>{podcast.description}</SerifText>
        </div>
        <div className={styles.readMore}>
          <Link href={podcastLink}>
            <MonoTextBold className={styles.readMoreLink}>
              {dict.articleCard.listenPodcast} →
            </MonoTextBold>
          </Link>
        </div>
      </section>
    </article>
  );
}
