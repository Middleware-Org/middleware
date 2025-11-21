/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useState } from "react";
import Button from "@/components/atoms/button";
import { MonoTextLight } from "@/components/atoms/typography";
import ArticleCard from "@/components/molecules/articleCard";
import type { Article, Issue } from "@/.velite";
import { CommonDictionary } from "@/lib/i18n/types";
import styles from "./styles";

/* **************************************************
 * Constants
 **************************************************/
const INITIAL_PODCASTS_COUNT = 3;

/* **************************************************
 * Types
 **************************************************/
type IssuePodcastsProps = {
  podcasts: Article[];
  dictCommon: Pick<CommonDictionary, "articleCard">;
  issue: Issue;
};

/* **************************************************
 * IssuePodcasts Component
 **************************************************/
export default function IssuePodcasts({ podcasts, dictCommon, issue }: IssuePodcastsProps) {
  const [showAllPodcasts, setShowAllPodcasts] = useState(false);

  const visiblePodcasts = showAllPodcasts ? podcasts : podcasts.slice(0, INITIAL_PODCASTS_COUNT);
  const hasMorePodcasts = podcasts.length > INITIAL_PODCASTS_COUNT;

  const toggleText = showAllPodcasts ? "Nascondi tutti" : "Mostra tutti";

  return (
    <>
      {/* Podcasts grid */}
      <div className={styles.grid}>
        {visiblePodcasts.map((podcast) => (
          <ArticleCard key={podcast.slug} article={podcast} dict={dictCommon} isPodcast={true} />
        ))}
      </div>

      {/* Show more/less button */}
      {hasMorePodcasts && (
        <div className={styles.buttonContainer}>
          <div className={styles.buttonWrapper}>
            <Button
              variants="unstyled"
              className="text-sm"
              onClick={() => setShowAllPodcasts(!showAllPodcasts)}
            >
              <MonoTextLight className={styles.buttonText}>
                {toggleText} {issue.title}
              </MonoTextLight>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
