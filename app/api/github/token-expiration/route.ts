/* **************************************************
 * Imports
 **************************************************/
import { NextResponse } from "next/server";

const GITHUB_API_URL = "https://api.github.com";
const token = process.env.GITHUB_TOKEN!;

/* **************************************************
 * GitHub Token Expiration API Route
 *
 * This route checks when the GitHub token will expire
 * by making a request to the GitHub API and reading
 * the github-authentication-token-expiration header.
 **************************************************/
export async function GET() {
  try {
    if (!token) {
      return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 });
    }

    const res = await fetch(`${GITHUB_API_URL}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("GitHub API error", res.status, await res.text());
      return NextResponse.json(
        { error: "Failed to check token expiration" },
        { status: res.status },
      );
    }

    const expirationHeader = res.headers.get("github-authentication-token-expiration");

    if (!expirationHeader) {
      return NextResponse.json({
        expirationDate: null,
        daysUntilExpiration: null,
        isExpiringSoon: false,
      });
    }

    const expirationDate = new Date(expirationHeader);
    const now = new Date();
    const daysUntilExpiration = Math.ceil(
      (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Consider "expiring soon" if less than 2 weeks (14 days)
    const isExpiringSoon = daysUntilExpiration < 14;

    return NextResponse.json({
      expirationDate: expirationDate.toISOString(),
      daysUntilExpiration,
      isExpiringSoon,
    });
  } catch (error) {
    console.error("Error checking GitHub token expiration:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
