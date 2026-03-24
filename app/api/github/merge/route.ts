/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";

import { setNoStoreHeaders } from "@/lib/api/cache";
import { getAdminUser } from "@/lib/auth/server";
import { fetchWithTimeout } from "@/lib/github/client";
import { createLogger } from "@/lib/logger";
import { checkRateLimit, createRateLimitResponse, getClientIp } from "@/lib/security/rateLimit";

const logger = createLogger("API /github/merge");

const GITHUB_API_URL = "https://api.github.com";
const owner = process.env.GITHUB_OWNER!;
const repo = process.env.GITHUB_REPO!;
const mainBranch = process.env.GITHUB_BRANCH || "main";
const devBranch = process.env.GITHUB_DEV_BRANCH || "develop";
const token = process.env.GITHUB_TOKEN!;

function noStoreJson(body: unknown, init?: ResponseInit): NextResponse {
  return setNoStoreHeaders(NextResponse.json(body, init));
}

/* **************************************************
 * Merge develop into main
 **************************************************/
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit(`github:merge:${ip}`, {
      windowMs: 60_000,
      maxRequests: 5,
    });

    if (!rateLimit.allowed) {
      return setNoStoreHeaders(createRateLimitResponse(rateLimit));
    }

    const user = await getAdminUser();
    if (!user) {
      return noStoreJson({ error: "Unauthorized" }, { status: 401 });
    }

    if (!owner || !repo || !token) {
      return noStoreJson({ error: "GitHub configuration missing" }, { status: 500 });
    }

    // First check if there are changes to merge
    const checkUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}/compare/${mainBranch}...${devBranch}`;
    const checkRes = await fetchWithTimeout(checkUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    });

    if (!checkRes.ok) {
      return noStoreJson({ error: "Failed to check branch status" }, { status: 500 });
    }

    const compareData = await checkRes.json();
    const aheadBy = compareData.ahead_by || 0;

    if (aheadBy === 0) {
      return noStoreJson({ error: "No changes to merge", alreadyMerged: true }, { status: 400 });
    }

    // Perform the merge using GitHub API
    const mergeUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}/merges`;
    const mergeRes = await fetchWithTimeout(mergeUrl, {
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
      logger.error("Merge error", { status: mergeRes.status, message: errorData?.message });

      // Check if it's a merge conflict
      if (mergeRes.status === 409) {
        return noStoreJson(
          { error: "Merge conflict detected. Please resolve conflicts manually.", conflict: true },
          { status: 409 },
        );
      }

      return noStoreJson({ error: "Failed to merge branches" }, { status: mergeRes.status });
    }

    const mergeData = await mergeRes.json();

    return noStoreJson(
      {
        success: true,
        message: `Successfully merged ${devBranch} into ${mainBranch}`,
        sha: mergeData.sha,
        commit: mergeData.commit,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("Error merging branches", error);
    return noStoreJson({ error: "Internal server error" }, { status: 500 });
  }
}
