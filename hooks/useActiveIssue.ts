"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { Issue } from "@/.velite";

export function useActiveIssue(issues: Issue[]) {
  const [activeIssueSlug, setActiveIssueSlug] = useState<string | null>(issues[0]?.slug ?? null);
  const activeIssueSlugRef = useRef<string | null>(issues[0]?.slug ?? null);
  const frameRequestRef = useRef<number | null>(null);

  const issueBySlug = useMemo(() => {
    return new Map(issues.map((issue) => [issue.slug, issue]));
  }, [issues]);

  useEffect(() => {
    if (typeof window === "undefined" || issues.length === 0) {
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px", // Considera un elemento "in vista" quando è nel 10% centrale della viewport
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      const firstVisibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

      if (!firstVisibleEntry) {
        return;
      }

      const issueId = firstVisibleEntry.target.id;
      const slug = issueId.replace("issue-", "");

      if (!issueBySlug.has(slug) || slug === activeIssueSlugRef.current) {
        return;
      }

      if (frameRequestRef.current !== null) {
        cancelAnimationFrame(frameRequestRef.current);
      }

      frameRequestRef.current = requestAnimationFrame(() => {
        activeIssueSlugRef.current = slug;
        setActiveIssueSlug(slug);
      });
    }, observerOptions);

    // Osserva tutti gli elementi delle issue
    issues.forEach((issue) => {
      const element = document.getElementById(`issue-${issue.slug}`);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      if (frameRequestRef.current !== null) {
        cancelAnimationFrame(frameRequestRef.current);
      }
      observer.disconnect();
    };
  }, [issueBySlug, issues]);

  return (activeIssueSlug ? issueBySlug.get(activeIssueSlug) : null) ?? issues[0] ?? null;
}
