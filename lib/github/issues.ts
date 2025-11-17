/* **************************************************
 * Imports
 **************************************************/
import { getFileContent, listDirectoryFiles } from "./client";
import type { Issue } from "./types";

/* **************************************************
 * Issues
 ************************************************** */
export async function getAllIssues(): Promise<Issue[]> {
  const files = await listDirectoryFiles("content/issues");
  const jsonFiles = files.filter((f) => f.type === "file" && f.name.endsWith(".json"));

  const issues = await Promise.all(
    jsonFiles.map(async (file) => {
      const content = await getFileContent(file.path);
      const issue = JSON.parse(content) as Issue;
      issue.slug = file.name.replace(".json", "");
      return issue;
    }),
  );

  return issues.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getIssueBySlug(slug: string): Promise<Issue | undefined> {
  try {
    const content = await getFileContent(`content/issues/${slug}.json`);
    const issue = JSON.parse(content) as Issue;
    issue.slug = slug;
    return issue;
  } catch {
    return undefined;
  }
}

