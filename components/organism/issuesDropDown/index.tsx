"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MonoTextLight } from "@/components/atoms/typography";
import { useActiveIssue } from "@/hooks/useActiveIssue";
import { cn } from "@/lib/utils/classes";
import FormattedDate from "@/components/atoms/date";
import Button from "@/components/atoms/button";
import styles from "./styles";
import { Issue } from "@/.velite";

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
  const { lang = "it" } = useParams() as { lang: "it" };

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeIssue = useActiveIssue(issues);
  const [userHasSelected, setUserHasSelected] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(() => {
    return activeIssue || (issues.length > 0 ? issues[0] : null);
  });

  // Use selectedIssue if user has manually selected, otherwise use activeIssue
  const displayIssue = userHasSelected ? selectedIssue : activeIssue || selectedIssue;

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

    setUserHasSelected(true);
    setSelectedIssue(issue);
    setIsOpen(false);

    const issueElement = document.getElementById(`issue-${issue.slug}`);
    console.log(issueElement);
    if (issueElement) {
      const elementPosition = issueElement.offsetTop - 155;
      console.log(elementPosition);
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
        <MonoTextLight className={styles.issueText}>
          | <FormattedDate date={displayIssue.date} lang={lang} />
        </MonoTextLight>
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
