/* **************************************************
 * Imports
 **************************************************/
"use client";

import Button from "@/components/atoms/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MonoTextLight } from "@/components/atoms/typography";
import Separator from "@/components/atoms/separetor";
import { cn } from "@/lib/utils/classes";
import type { Issue } from "@/.velite";
import styles from "./styles";
import { useIssuesList } from "@/lib/store/issuesList";

/* **************************************************
 * Types
 **************************************************/
type MobileIssuesToggleProps = {
  issues: Issue[];
};

/* **************************************************
 * MobileIssuesToggle Component
 **************************************************/
export default function MobileIssuesToggle({ issues }: MobileIssuesToggleProps) {
  const { isOpen, toggleOpen } = useIssuesList();
  const searchParams = useSearchParams();
  const activeIssue = searchParams.get("issue");

  const buttonText = isOpen ? "Chiudi" : "Mostra Uscite";
  const buttonVariant = isOpen ? "secondary" : "primary";
  const buttonTextClass = isOpen ? styles.buttonTextClosed : styles.buttonTextOpen;

  function handleIssueClick() {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("scrollPosition", window.scrollY.toString());
    }
    toggleOpen();
  }

  return (
    <div className={styles.wrapper}>
      <Button onClick={toggleOpen} variants={buttonVariant}>
        <MonoTextLight className={buttonTextClass}>{buttonText}</MonoTextLight>
      </Button>
      {isOpen && (
        <div className={styles.list}>
          {issues.map((issue) => {
            const isActive = activeIssue === issue.slug;
            return (
              <div key={issue.slug} className={styles.item}>
                <Link
                  href={`?issue=${issue.slug}`}
                  onClick={handleIssueClick}
                  className={styles.link}
                >
                  <MonoTextLight className={cn(styles.linkText, isActive ? "text-tertiary" : "")}>
                    {issue.title}
                  </MonoTextLight>
                </Link>
                <Separator />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
