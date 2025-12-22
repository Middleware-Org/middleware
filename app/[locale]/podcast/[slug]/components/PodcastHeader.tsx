"use client";

/* **************************************************
 * Imports
 **************************************************/
import Image from "next/image";
import { MonoTextLight, SerifText } from "@/components/atoms/typography";
import { Podcast } from "@/.velite";
import FormattedDate from "@/components/atoms/date";
import { useParams } from "next/navigation";
import styles from "./PodcastPlayerStyles";
import { getGitHubImageUrl } from "@/lib/github/images";

/* **************************************************
 * Types
 **************************************************/
type PodcastHeaderProps = {
  podcast: Podcast;
};

/* **************************************************
 * PodcastHeader
 **************************************************/
export default function PodcastHeader({ podcast }: PodcastHeaderProps) {
  const { lang = "it" } = useParams() as { lang: "it" };

  return (
    <div className={styles.headerSection}>
      {podcast.cover && (
        <div className={styles.coverWrapper}>
          <Image
            src={getGitHubImageUrl(podcast.cover)}
            alt={podcast.title}
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
            <SerifText className={styles.textTitle}>{podcast.title}</SerifText>
            {podcast.description && (
              <MonoTextLight className={styles.textAuthor}>
                {podcast.description.length > 100
                  ? podcast.description.slice(0, 100) + "..."
                  : podcast.description}
              </MonoTextLight>
            )}
            {podcast.date && (
              <FormattedDate date={podcast.date} lang={lang} className={styles.textDate} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
