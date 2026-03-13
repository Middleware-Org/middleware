/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/server";
import { createLogger } from "@/lib/logger";

const logger = createLogger("API /github/merge/check");

const GITHUB_API_URL = "https://api.github.com";
const owner = process.env.GITHUB_OWNER!;
const repo = process.env.GITHUB_REPO!;
const mainBranch = process.env.GITHUB_BRANCH || "main";
const devBranch = process.env.GITHUB_DEV_BRANCH || "develop";
const token = process.env.GITHUB_TOKEN!;

/* **************************************************
 * Check if there are commits to merge from develop to main
 **************************************************/
export async function GET() {
  try {
    const user = await getAdminUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!owner || !repo || !token) {
      return NextResponse.json({ error: "GitHub configuration missing" }, { status: 500 });
    }

    // Get the latest commit SHA for both branches
    const [mainBranchData, devBranchData] = await Promise.all([
      fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/branches/${mainBranch}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
        cache: "no-store",
      }),
      fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}/branches/${devBranch}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
        cache: "no-store",
      }),
    ]);

    if (!mainBranchData.ok || !devBranchData.ok) {
      return NextResponse.json({ error: "Failed to fetch branch information" }, { status: 500 });
    }

    const mainBranchInfo = await mainBranchData.json();
    const devBranchInfo = await devBranchData.json();

    const mainSha = mainBranchInfo.commit.sha;
    const devSha = devBranchInfo.commit.sha;

    // Check if develop is ahead of main
    // Compare the two branches
    const compareUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}/compare/${mainBranch}...${devBranch}`;
    const compareRes = await fetch(compareUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    });

    if (!compareRes.ok) {
      return NextResponse.json({ error: "Failed to compare branches" }, { status: 500 });
    }

    const compareData = await compareRes.json();
    const aheadBy = compareData.ahead_by || 0;

    return NextResponse.json({
      hasChanges: aheadBy > 0,
      aheadBy,
      mainSha,
      devSha,
      status: compareData.status, // "ahead", "behind", "identical", "diverged"
    });
  } catch (error) {
    logger.error("Error checking merge status", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
