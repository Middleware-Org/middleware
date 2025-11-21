/* **************************************************
 * Imports
 **************************************************/
"use client";

import Button from "@/components/atoms/button";
import { MonoTextLight } from "@/components/atoms/typography";
import Separator from "@/components/atoms/separetor";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils/classes";
import { scrollToElement } from "@/lib/utils/window";
import type { Issue } from "@/.velite";
import { useIssuesList } from "@/lib/store/issuesList";
import styles from "./styles";

/* **************************************************
 * Constants
 **************************************************/
const MOBILE_OFFSET = 160;
const DESKTOP_OFFSET = 120;

/* **************************************************
 * Types
 **************************************************/
type IssuesListProps = {
  issues: Issue[];
};

/* **************************************************
 * IssuesList Component
 **************************************************/
export default function IssuesList({ issues }: IssuesListProps) {
  const { isOpen, toggleOpen } = useIssuesList();
  const isMobile = useIsMobile();

  /* **************************************************
   * Handlers
   **************************************************/
  function handleIssueClick(issue: Issue) {
    const elementId = issue.slug;
    const offset = isMobile ? MOBILE_OFFSET : DESKTOP_OFFSET;
    scrollToElement(elementId, offset);
    toggleOpen();
  }

  /* **************************************************
   * Render
   **************************************************/
  return (
    <div className={cn(styles.container, isOpen ? styles.containerOpen : styles.containerClosed)}>
      {issues.map((issue) => (
        <div key={issue.slug} className={styles.item}>
          <Button
            variants="unstyled"
            onClick={() => handleIssueClick(issue)}
            className={styles.button}
          >
            <MonoTextLight className={styles.buttonText}>{issue.title}</MonoTextLight>
          </Button>
          <Separator />
        </div>
      ))}
    </div>
  );
}

