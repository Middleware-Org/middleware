/* **************************************************
 * Imports
 **************************************************/
import Link from "next/link";
import type { Podcast } from "@/.velite";
import Separator from "@/components/atoms/separetor";
import { H3, MonoTextBold, MonoTextLight, SerifText } from "@/components/atoms/typography";
import { CommonDictionary } from "@/lib/i18n/types";
import styles from "../articleCard/styles";

/* **************************************************
 * Types
 **************************************************/
type PodcastCardProps = {
  podcast: Podcast;
  dict: Pick<CommonDictionary, "articleCard">;
};

/* **************************************************
 * PodcastCard
 **************************************************/
export default function PodcastCard({ podcast, dict }: PodcastCardProps) {
  const podcastLink = `/podcast/${podcast.slug}`;

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

