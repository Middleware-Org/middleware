/* **************************************************
 * Imports
 **************************************************/
import { issues } from "@/.velite";

/* **************************************************
 * Issues
 **************************************************/
export const getAllIssues = () =>
  issues.filter((i) => i.published).sort((a, b) => b.date.localeCompare(a.date));

export const getIssueBySlug = (slug: string) => {
  const issue = issues.find((i) => i.slug === slug);
  return issue && issue.published ? issue : undefined;
};

