"use client";

/* **************************************************
 * Imports
 **************************************************/
import Image from "next/image";
import { SerifText } from "@/components/atoms/typography";
import { Podcast, Issue } from "@/.velite";
import styles from "./PodcastPlayerStyles";
import { getGitHubImageUrl } from "@/lib/github/images";

/* **************************************************
 * Types
 **************************************************/
type PodcastHeaderProps = {
  podcast: Podcast;
  issue?: Issue;
};

/* **************************************************
 * PodcastHeader
 **************************************************/
export default function PodcastHeader({ podcast, issue }: PodcastHeaderProps) {
  // Use issue cover if available, otherwise no cover
  const coverImage = issue?.cover;

  return (
    <div className={styles.headerSection}>
      {coverImage && (
        <div className={styles.coverWrapper}>
          <Image
            src={getGitHubImageUrl(coverImage)}
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
          </div>
        </div>
      </div>
    </div>
  );
}
