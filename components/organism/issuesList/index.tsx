/* **************************************************
 * Imports
 **************************************************/
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  showVarie?: boolean;
};

/* **************************************************
 * IssuesList Component
 **************************************************/
export default function IssuesList({ issues, showVarie = false }: IssuesListProps) {
  const { isOpen, toggleOpen } = useIssuesList();
  const searchParams = useSearchParams();
  const activeIssue = searchParams.get("issue");

  /* **************************************************
   * Handlers
   **************************************************/
  function handleIssueClick() {
    // Save current scroll position before Next.js resets it
    if (typeof window !== "undefined") {
      sessionStorage.setItem("scrollPosition", window.scrollY.toString());
    }
    toggleOpen();
  }

  /* **************************************************
   * Render
   **************************************************/
  return (
    <div className={cn(styles.container, isOpen ? styles.containerOpen : styles.containerClosed)}>
      {issues.map((issue) => {
        const isActive = activeIssue === issue.slug;
        return (
          <div key={issue.slug} className={styles.item}>
            <Link
              href={`?issue=${issue.slug}`}
              onClick={handleIssueClick}
              className={styles.button}
            >
              <MonoTextLight className={cn(styles.buttonText, isActive ? "text-tertiary" : "")}>
                {issue.title}
              </MonoTextLight>
            </Link>
            <Separator />
          </div>
        );
      })}

      {/* Link Varie */}
      {showVarie && (
        <div className={styles.item}>
          <Link
            href="?issue=varie"
            onClick={handleIssueClick}
            className={styles.button}
          >
            <MonoTextLight className={cn(styles.buttonText, activeIssue === "varie" ? "text-tertiary" : "")}>
              Varie
            </MonoTextLight>
          </Link>
          <Separator />
        </div>
      )}
    </div>
  );
}
