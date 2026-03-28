/* **************************************************
 * Imports
 **************************************************/
"use client";

import { useState } from "react";

import Button from "@/components/atoms/button";
import { MonoTextLight } from "@/components/atoms/typography";
import PodcastCard from "@/components/molecules/podcastCard";
import type { CommonDictionary } from "@/lib/i18n/types";

import type { Podcast, Issue } from "@/.velite";

import styles from "./styles";

/* **************************************************
 * Constants
 **************************************************/
const INITIAL_PODCASTS_COUNT = 3;

/* **************************************************
 * Types
 **************************************************/
type IssuePodcastsProps = {
  podcasts: Podcast[];
  dictCommon: Pick<CommonDictionary, "articleCard" | "lists">;
  issue: Issue;
  locale: string;
};

/* **************************************************
 * IssuePodcasts Component
 **************************************************/
export default function IssuePodcasts({ podcasts, dictCommon, issue, locale }: IssuePodcastsProps) {
  const [showAllPodcasts, setShowAllPodcasts] = useState(false);

  const visiblePodcasts = showAllPodcasts ? podcasts : podcasts.slice(0, INITIAL_PODCASTS_COUNT);
  const hasMorePodcasts = podcasts.length > INITIAL_PODCASTS_COUNT;

  const toggleText = showAllPodcasts ? dictCommon.lists.hideAll : dictCommon.lists.showAll;

  return (
    <>
      {/* Podcasts grid */}
      <div className={styles.grid}>
        {visiblePodcasts.map((podcast) => (
          <PodcastCard key={podcast.slug} podcast={podcast} dict={dictCommon} locale={locale} />
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
