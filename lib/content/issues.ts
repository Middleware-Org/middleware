/* **************************************************
 * Imports
 **************************************************/
import { issues } from "@/.velite";

const safeIssues = Array.isArray(issues) ? issues : [];

const publishedIssuesSorted = safeIssues
  .filter((issue) => issue.published)
  .sort((a, b) => (b.last_update || b.date).localeCompare(a.last_update || a.date));

const publishedIssueBySlug = new Map(publishedIssuesSorted.map((issue) => [issue.slug, issue]));
const publishedIssueById = new Map(publishedIssuesSorted.map((issue) => [issue.id, issue]));

/* **************************************************
 * Issues
 **************************************************/
export const getAllIssues = () => publishedIssuesSorted;

export const getIssueBySlug = (slug: string) => publishedIssueBySlug.get(slug);

export const getIssueById = (id: string) => publishedIssueById.get(id);
