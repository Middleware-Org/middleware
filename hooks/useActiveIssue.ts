"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { Issue } from "@/.velite";

export function useActiveIssue(issues: Issue[]) {
  const [activeIssueSlug, setActiveIssueSlug] = useState<string | null>(issues[0]?.slug ?? null);
  const activeIssueSlugRef = useRef<string | null>(issues[0]?.slug ?? null);
  const frameRequestRef = useRef<number | null>(null);
  const lastCommitTimeRef = useRef<number>(0);
  const minCommitIntervalMs = 120;

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
      let firstVisibleEntry: IntersectionObserverEntry | null = null;

      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }

        if (
          firstVisibleEntry === null ||
          entry.boundingClientRect.top < firstVisibleEntry.boundingClientRect.top
        ) {
          firstVisibleEntry = entry;
        }
      }

      if (!firstVisibleEntry) {
        return;
      }

      const issueId = firstVisibleEntry.target.id;
      const slug = issueId.replace("issue-", "");

      if (!issueBySlug.has(slug) || slug === activeIssueSlugRef.current) {
        return;
      }

      const now = performance.now();
      if (now - lastCommitTimeRef.current < minCommitIntervalMs) {
        return;
      }

      if (frameRequestRef.current !== null) {
        cancelAnimationFrame(frameRequestRef.current);
      }

      frameRequestRef.current = requestAnimationFrame(() => {
        lastCommitTimeRef.current = performance.now();
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
