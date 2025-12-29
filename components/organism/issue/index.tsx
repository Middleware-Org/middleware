/* **************************************************
 * Imports
 **************************************************/
import { MonoTextLight } from "@/components/atoms/typography";
import Separator from "@/components/atoms/separetor";
import { SerifTextBold } from "@/components/atoms/typography";
import type { Issue } from "@/.velite";
import { CommonDictionary } from "@/lib/i18n/types";
import { getPodcastsByIssue } from "@/lib/content";
import IssuePodcasts from "../issuePodcasts";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
type IssueProps = {
  issue: Issue;
  dictCommon: Pick<CommonDictionary, "articleCard">;
  isLastIssue: boolean;
};

/* **************************************************
 * Issue Component
 **************************************************/
export default async function Issue({ issue, dictCommon, isLastIssue }: IssueProps) {
  const podcasts = getPodcastsByIssue(issue.slug);

  if (!podcasts || podcasts.length === 0) return null;

  return (
    <section id={issue.slug} className={styles.section}>
      {/* Header with title and separator */}
      <div className={styles.header}>
        <SerifTextBold className={styles.title}>{issue.title}</SerifTextBold>
        <Separator className={styles.separator} />
      </div>

      {/* Description */}
      {issue.description && (
        <MonoTextLight className={styles.description}>{issue.description}</MonoTextLight>
      )}

      {/* Podcasts list */}
      <IssuePodcasts podcasts={podcasts} dictCommon={dictCommon} issue={issue} />

      {/* Bottom separator */}
      {!isLastIssue && <Separator className={styles.separatorBottom} />}
    </section>
  );
}
