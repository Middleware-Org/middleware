"use client";

import { useEffect, useState } from "react";
import { Issue } from "@/.velite";

export function useActiveIssue(issues: Issue[]) {
  const [activeIssue, setActiveIssue] = useState<Issue | null>(
    issues.length > 0 ? issues[0] : null,
  );

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px", // Considera un elemento "in vista" quando è nel 10% centrale della viewport
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const issueId = entry.target.id;
          const foundIssue = issues.find((issue) => issue.slug === issueId);

          if (foundIssue) {
            setActiveIssue(foundIssue);
          }
        }
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
      observer.disconnect();
    };
  }, [issues]);

  return activeIssue;
}
