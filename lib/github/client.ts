/* **************************************************
 * Imports
 **************************************************/
import type { GitHubFile } from "./types";

/* **************************************************
 * Constants
 ************************************************** */
const GITHUB_API_URL = "https://api.github.com";

const owner = process.env.GITHUB_OWNER!;
const repo = process.env.GITHUB_REPO!;
const branch = process.env.GITHUB_BRANCH || "main";
const token = process.env.GITHUB_TOKEN!;

if (!owner || !repo || !token) {
  throw new Error("Missing GitHub env vars (GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN)");
}

/* **************************************************
 * GitHub API Helpers
 ************************************************** */
export async function githubFetch(path: string) {
  const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/${path}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("GitHub error", url, await res.text());
    throw new Error(`GitHub API error: ${res.status}`);
  }

  return res.json();
}

export async function getFileContent(path: string): Promise<string> {
  const file = await githubFetch(`contents/${path}?ref=${branch}`);

  if (!("content" in file) || !("encoding" in file)) {
    throw new Error("Unexpected GitHub response for file content");
  }

  if (file.encoding !== "base64") {
    throw new Error(`Unsupported encoding: ${file.encoding}`);
  }

  const buff = Buffer.from(file.content, "base64");
  return buff.toString("utf-8");
}

export async function listDirectoryFiles(dir: string): Promise<GitHubFile[]> {
  const files = await githubFetch(`contents/${dir}?ref=${branch}`);
  return Array.isArray(files) ? files : [];
}

