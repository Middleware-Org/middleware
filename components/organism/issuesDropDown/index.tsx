"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { MonoTextLight } from "@/components/atoms/typography";
import { useActiveIssue } from "@/hooks/useActiveIssue";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils/classes";
import { formatDateByLang } from "@/lib/utils/date";
import Button from "@/components/atoms/button";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
interface IssueNode {
  id: string;
  title: string;
  date: string;
  publishedAt: string;
}

interface IssuesDropdownProps {
  issues: IssueNode[];
  className?: string;
}

/* **************************************************
 * Constants
 **************************************************/
const HEADER_HEIGHT = 115;
const ISSUE_ELEMENT_PREFIX = "issue-";

/* **************************************************
 * IssuesDropdown
 **************************************************/
export default function IssuesDropdown({ issues, className }: IssuesDropdownProps) {
  const { lang = "it" } = useParams() as { lang: "it" };
  const isMobile = useIsMobile();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeIssue = useActiveIssue(issues);
  const [userHasSelected, setUserHasSelected] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<IssueNode | null>(() => {
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

  const handleIssueSelect = (issue: IssueNode) => {
    if (typeof window === "undefined") return;

    setUserHasSelected(true);
    setSelectedIssue(issue);
    setIsOpen(false);

    const issueElement = document.getElementById(`${ISSUE_ELEMENT_PREFIX}${issue.id}`);
    if (issueElement) {
      const elementPosition = issueElement.offsetTop - HEADER_HEIGHT;

      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
  };

  /* **************************************************
   * Render
   **************************************************/
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
          <FaChevronUp className={styles.chevron} />
        ) : (
          <FaChevronDown className={styles.chevron} />
        )}
        <MonoTextLight className={styles.issueText}>
          | {formatDateByLang(displayIssue.date, lang, isMobile)}
        </MonoTextLight>
      </button>

      {isOpen && (
        <ul id="issues-dropdown-list" role="listbox" className={styles.dropdown}>
          {issues.map((issue) => (
            <li key={issue.id} role="option" aria-selected={displayIssue.id === issue.id}>
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
