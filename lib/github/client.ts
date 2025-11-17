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

  if (!file.content || file.content.trim().length === 0) {
    return "";
  }

  const buff = Buffer.from(file.content, "base64");
  return buff.toString("utf-8");
}

export async function listDirectoryFiles(dir: string): Promise<GitHubFile[]> {
  const files = await githubFetch(`contents/${dir}?ref=${branch}`);
  return Array.isArray(files) ? files : [];
}

export async function githubPut(path: string, body: unknown) {
  const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/${path}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("GitHub PUT error", url, errorText);
    throw new Error(`GitHub API error: ${res.status} - ${errorText}`);
  }

  return res.json();
}

export async function githubDelete(path: string, body: unknown) {
  const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/${path}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("GitHub DELETE error", url, errorText);
    throw new Error(`GitHub API error: ${res.status} - ${errorText}`);
  }

  return res.json();
}

export async function getFileSha(path: string): Promise<string | null> {
  try {
    const file = await githubFetch(`contents/${path}?ref=${branch}`);
    return (file.sha as string) || null;
  } catch {
    return null;
  }
}

export async function createOrUpdateFile(
  path: string,
  content: string,
  message: string,
): Promise<void> {
  const sha = await getFileSha(path);
  const contentBase64 = Buffer.from(content, "utf-8").toString("base64");

  await githubPut(`contents/${path}`, {
    message,
    content: contentBase64,
    branch,
    ...(sha && { sha }),
  });
}

export async function deleteFile(path: string, message: string): Promise<void> {
  const sha = await getFileSha(path);

  if (!sha) {
    throw new Error(`File ${path} not found`);
  }

  await githubDelete(`contents/${path}`, {
    message,
    sha,
    branch,
  });
}

export async function uploadImage(imageBase64: string, filename?: string): Promise<string> {
  const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;

  if (!filename) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    filename = `image-${timestamp}-${random}.jpg`;
  }

  if (!filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    filename = `${filename}.jpg`;
  }

  const imagePath = `public/assets/${filename}`;
  const sha = await getFileSha(imagePath);

  await githubPut(`contents/${imagePath}`, {
    message: `Upload image: ${filename}`,
    content: base64Data,
    branch,
    ...(sha && { sha }),
  });

  return `/assets/${filename}`;
}
