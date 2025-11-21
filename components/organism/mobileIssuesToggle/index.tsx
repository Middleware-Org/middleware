/* **************************************************
 * Imports
 **************************************************/
"use client";

import Button from "@/components/atoms/button";
import { MonoTextLight } from "@/components/atoms/typography";
import { useIssuesList } from "@/lib/store/issuesList";
import type { Issue } from "@/.velite";
import styles from "./styles";

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

  return (
    <Button variants="unstyled" onClick={toggleOpen} className={styles.button}>
      <MonoTextLight className={styles.buttonText}>
        {isOpen ? "Chiudi" : `Issues (${issues.length})`}
      </MonoTextLight>
    </Button>
  );
}

