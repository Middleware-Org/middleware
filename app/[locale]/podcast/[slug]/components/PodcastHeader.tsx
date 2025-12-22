"use client";

/* **************************************************
 * Imports
 **************************************************/
import Image from "next/image";
import { SerifText } from "@/components/atoms/typography";
import { Podcast } from "@/.velite";
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
          </div>
        </div>
      </div>
    </div>
  );
}
