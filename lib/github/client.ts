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
const devBranch = process.env.GITHUB_DEV_BRANCH || "develop";
// All operations (read and write) use dev branch
// Only merge operations use main branch
const writeBranch = devBranch;
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
  // Read from dev branch to see latest changes
  const file = await githubFetch(`contents/${path}?ref=${writeBranch}`);

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
  // Read from dev branch to see latest changes
  const files = await githubFetch(`contents/${dir}?ref=${writeBranch}`);
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

export async function getFileSha(
  path: string,
  useDevBranch: boolean = true, // Default to dev branch for all operations
): Promise<string | null> {
  try {
    // Always use dev branch (useDevBranch is kept for backward compatibility but defaults to true)
    const file = await githubFetch(`contents/${path}?ref=${writeBranch}`);
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
  const sha = await getFileSha(path, true); // Check in dev branch
  const contentBase64 = Buffer.from(content, "utf-8").toString("base64");

  await githubPut(`contents/${path}`, {
    message,
    content: contentBase64,
    branch: writeBranch,
    ...(sha && { sha }),
  });
}

export async function deleteFile(path: string, message: string): Promise<void> {
  const sha = await getFileSha(path, true); // Check in dev branch

  if (!sha) {
    throw new Error(`File ${path} not found`);
  }

  await githubDelete(`contents/${path}`, {
    message,
    sha,
    branch: writeBranch,
  });
}

/**
 * Rinomina un file in GitHub (crea nuovo file e elimina vecchio)
 */
export async function renameFile(
  oldPath: string,
  newPath: string,
  content: string,
  message: string,
): Promise<void> {
  // Crea il nuovo file
  const contentBase64 = Buffer.from(content, "utf-8").toString("base64");
  await githubPut(`contents/${newPath}`, {
    message,
    content: contentBase64,
    branch: writeBranch,
  });

  // Elimina il vecchio file
  const oldSha = await getFileSha(oldPath, true); // Check in dev branch
  if (oldSha) {
    await githubDelete(`contents/${oldPath}`, {
      message: `Rename: ${oldPath} -> ${newPath}`,
      sha: oldSha,
      branch: writeBranch,
    });
  }
}

export async function uploadImage(imageBase64: string, filename?: string): Promise<string> {
  return uploadFile(imageBase64, filename, "image");
}

export async function uploadFile(
  fileBase64: string,
  filename?: string,
  fileType: "image" | "audio" | "json" = "image",
): Promise<string> {
  const base64Data = fileBase64.includes(",") ? fileBase64.split(",")[1] : fileBase64;

  if (!filename) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const extensions = {
      image: "jpg",
      audio: "mp3",
      json: "json",
    };
    filename = `file-${timestamp}-${random}.${extensions[fileType]}`;
  } else {
    // Ensure filename has correct extension based on file type
    const extensions = {
      image: /\.(jpg|jpeg|png|gif|webp)$/i,
      audio: /\.(mp3|wav)$/i,
      json: /\.json$/i,
    };
    if (!filename.match(extensions[fileType])) {
      const defaultExt = {
        image: "jpg",
        audio: "mp3",
        json: "json",
      };
      filename = `${filename}.${defaultExt[fileType]}`;
    }
  }

  const filePath = `public/assets/${filename}`;
  const sha = await getFileSha(filePath, true); // Check in dev branch

  await githubPut(`contents/${filePath}`, {
    message: `Upload ${fileType}: ${filename}`,
    content: base64Data,
    branch: writeBranch,
    ...(sha && { sha }),
  });

  return `/assets/${filename}`;
}
