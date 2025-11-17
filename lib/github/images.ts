/* **************************************************
 * Imports
 **************************************************/
const owner = process.env.GITHUB_OWNER!;
const repo = process.env.GITHUB_REPO!;
const branch = process.env.GITHUB_BRANCH || "main";

/* **************************************************
 * GitHub Image URL Helper
 **************************************************/
/**
 * Convert a relative image path to GitHub raw URL
 * For private repositories, this will use a proxy API route
 * @param imagePath - Relative path (e.g., "/assets/filename.jpg")
 * @returns GitHub raw URL or proxy URL
 */
export function getGitHubImageUrl(imagePath: string): string {
  // If already a full URL (data URL or external URL), return as is
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }

  // Remove leading slash if present
  const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;

  // If path doesn't start with "public/", add it
  const fullPath = cleanPath.startsWith("public/") ? cleanPath : `public/${cleanPath}`;

  // Use Next.js API route as proxy for private repositories
  // This ensures authentication is handled server-side
  return `/api/github/image?path=${encodeURIComponent(fullPath)}`;
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

