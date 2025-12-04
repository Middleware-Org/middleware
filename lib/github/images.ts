/* **************************************************
 * Imports
 **************************************************/
const owner = process.env.GITHUB_OWNER!;
const repo = process.env.GITHUB_REPO!;
// All operations use dev branch (images are read from develop)
const branch = process.env.GITHUB_DEV_BRANCH || "develop";

/* **************************************************
 * GitHub Image URL Helper
 **************************************************/
/**
 * Get image URL - handles both Vercel Blob URLs and legacy GitHub paths
 * Vercel Blob URLs are returned as-is, legacy paths are converted to GitHub proxy URLs
 * @param imagePath - Full URL (Vercel Blob) or relative path (e.g., "/assets/filename.jpg")
 * @returns Full URL (Vercel Blob or GitHub proxy)
 */
export function getGitHubImageUrl(imagePath: string): string {
  // If already a full URL (Vercel Blob, data URL, or external URL), return as is
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }

  // Legacy GitHub path - convert to proxy URL for backward compatibility
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;

  // If path doesn't start with "public/", add it
  const fullPath = cleanPath.startsWith("public/") ? cleanPath : `public/${cleanPath}`;

  // Use Next.js API route as proxy for private repositories
  // This ensures authentication is handled server-side
  return `/api/github/image?path=${encodeURIComponent(fullPath)}`;
}

/**
 * Get media URL (audio, JSON, etc.) - handles both Vercel Blob URLs and legacy GitHub paths
 * Similar to getGitHubImageUrl but for non-image media files
 * @param mediaPath - Full URL (Vercel Blob) or relative path (e.g., "/assets/filename.mp3")
 * @returns Full URL (Vercel Blob or GitHub raw URL)
 */
export function getGitHubMediaUrl(mediaPath: string): string {
  // If already a full URL (Vercel Blob, data URL, or external URL), return as is
  if (
    mediaPath.startsWith("http://") ||
    mediaPath.startsWith("https://") ||
    mediaPath.startsWith("data:")
  ) {
    return mediaPath;
  }

  // Legacy GitHub path - convert to raw URL
  // Remove leading slash if present
  const cleanPath = mediaPath.startsWith("/") ? mediaPath.slice(1) : mediaPath;

  // If path doesn't start with "public/", add it
  const fullPath = cleanPath.startsWith("public/") ? cleanPath : `public/${cleanPath}`;

  // Return GitHub raw URL (for audio/JSON, we can use raw URL directly)
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${fullPath}`;
}

/**
 * Get direct GitHub raw URL (for server-side use with token)
 * @param imagePath - Relative path (e.g., "/assets/filename.jpg")
 * @returns Direct GitHub raw URL
 */
export function getGitHubRawUrl(imagePath: string): string {
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;

  // If path doesn't start with "public/", add it
  const fullPath = cleanPath.startsWith("public/") ? cleanPath : `public/${cleanPath}`;

  // Return GitHub raw URL
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${fullPath}`;
}
