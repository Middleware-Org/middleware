/* **************************************************
 * Imports
 **************************************************/
import { issues } from "@/.velite";

/* **************************************************
 * Issues
 **************************************************/
export const getAllIssues = () => issues.sort((a, b) => b.date.localeCompare(a.date));

export const getIssueBySlug = (slug: string) => issues.find((i) => i.slug === slug);

