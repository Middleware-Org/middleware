"use client";

/* **************************************************
 * Imports
 **************************************************/
import { ChevronDown, ChevronUp } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import Button from "@/components/atoms/button";
import FormattedDate from "@/components/atoms/date";
import { MonoTextLight } from "@/components/atoms/typography";
import { useActiveIssue } from "@/hooks/useActiveIssue";
import { cn } from "@/lib/utils/classes";

import type { Issue } from "@/.velite";

import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
interface IssuesDropdownProps {
  issues: Issue[];
  className?: string;
}

/* **************************************************
 * IssuesDropdown
 **************************************************/
export default function IssuesDropdown({ issues, className }: IssuesDropdownProps) {
  const { locale = "it" } = useParams() as { locale: "it" };

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeIssue = useActiveIssue(issues);
  const displayIssue = activeIssue || issues[0] || null;

  /* **************************************************
   * Effects
   **************************************************/
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* **************************************************
   * Handlers
   **************************************************/
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleIssueSelect = (issue: Issue) => {
    if (typeof window === "undefined") return;

    setIsOpen(false);

    const issueElement = document.getElementById(`issue-${issue.slug}`);
    if (issueElement) {
      const stickyOffset = window.innerWidth >= 768 ? 155 : 95;
      const elementPosition = issueElement.offsetTop - stickyOffset;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
  };

  if (!displayIssue) {
    return null;
  }

  return (
    <div className={cn(styles.container, className ?? "")} ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className={styles.button}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="issues-dropdown-list"
      >
        <MonoTextLight className={styles.issueText}>{displayIssue.title}</MonoTextLight>
        {isOpen ? (
          <ChevronUp className={styles.chevron} />
        ) : (
          <ChevronDown className={styles.chevron} />
        )}
        {" | "}
        <span className={styles.issueText}>
          <FormattedDate date={displayIssue.date} lang={locale} className={styles.issueText} />
        </span>
      </button>

      {isOpen && (
        <ul id="issues-dropdown-list" role="listbox" className={styles.dropdown}>
          {issues.map((issue) => (
            <li key={issue.slug} role="option" aria-selected={displayIssue.slug === issue.slug}>
              <Button
                onClick={() => handleIssueSelect(issue)}
                className={styles.buttonIssue}
                variants="unstyled"
              >
                <MonoTextLight className={styles.issueText}>{issue.title}</MonoTextLight>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
