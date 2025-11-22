/* **************************************************
 * Imports
 **************************************************/
"use client";

import Link from "next/link";
import { MonoTextLight } from "@/components/atoms/typography";
import Separator from "@/components/atoms/separetor";
import { cn } from "@/lib/utils/classes";
import type { Issue } from "@/.velite";
import { useIssuesList } from "@/lib/store/issuesList";
import styles from "./styles";

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

  /* **************************************************
   * Handlers
   **************************************************/
  function handleIssueClick() {
    toggleOpen();
  }

  /* **************************************************
   * Render
   **************************************************/
  return (
    <div className={cn(styles.container, isOpen ? styles.containerOpen : styles.containerClosed)}>
      {issues.map((issue) => (
        <div key={issue.slug} className={styles.item}>
          <Link href={`#${issue.slug}`} onClick={handleIssueClick} className={styles.button}>
            <MonoTextLight className={styles.buttonText}>{issue.title}</MonoTextLight>
          </Link>
          <Separator />
        </div>
      ))}
    </div>
  );
}
