/* **************************************************
 * Imports
 **************************************************/
import { NextRequest, NextResponse } from "next/server";

const GITHUB_API_URL = "https://api.github.com";
const owner = process.env.GITHUB_OWNER!;
const repo = process.env.GITHUB_REPO!;
const mainBranch = process.env.GITHUB_BRANCH || "main";
const devBranch = process.env.GITHUB_DEV_BRANCH || "develop";
const token = process.env.GITHUB_TOKEN!;

/* **************************************************
 * Merge develop into main
 **************************************************/
export async function POST(request: NextRequest) {
  try {
    // First check if there are changes to merge
    const checkUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}/compare/${mainBranch}...${devBranch}`;
    const checkRes = await fetch(checkUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    });

    if (!checkRes.ok) {
      return NextResponse.json({ error: "Failed to check branch status" }, { status: 500 });
    }

    const compareData = await checkRes.json();
    const aheadBy = compareData.ahead_by || 0;

    if (aheadBy === 0) {
      return NextResponse.json(
        { error: "No changes to merge", alreadyMerged: true },
        { status: 400 },
      );
    }

    // Perform the merge using GitHub API
    const mergeUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}/merges`;
    const mergeRes = await fetch(mergeUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        base: mainBranch,
        head: devBranch,
        commit_message: `Merge ${devBranch} into ${mainBranch}`,
      }),
    });

    if (!mergeRes.ok) {
      const errorData = await mergeRes.json();
      console.error("Merge error:", errorData);

      // Check if it's a merge conflict
      if (mergeRes.status === 409) {
        return NextResponse.json(
          { error: "Merge conflict detected. Please resolve conflicts manually.", conflict: true },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { error: errorData.message || "Failed to merge branches" },
        { status: mergeRes.status },
      );
    }

    const mergeData = await mergeRes.json();

    return NextResponse.json({
      success: true,
      message: `Successfully merged ${devBranch} into ${mainBranch}`,
      sha: mergeData.sha,
      commit: mergeData.commit,
    });
  } catch (error) {
    console.error("Error merging branches:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
