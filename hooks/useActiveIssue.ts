"use client";

import { useEffect, useState } from "react";

interface IssueNode {
  id: string;
  title: string;
  date: string;
  publishedAt: string;
}

export function useActiveIssue(issues: IssueNode[]) {
  const [activeIssue, setActiveIssue] = useState<IssueNode | null>(
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
          const foundIssue = issues.find((issue) => issue.id === issueId);

          if (foundIssue) {
            setActiveIssue(foundIssue);
          }
        }
      });
    }, observerOptions);

    // Osserva tutti gli elementi delle issue
    issues.forEach((issue) => {
      const element = document.getElementById(`issue-${issue.id}`);
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
