/* **************************************************
 * Dynamic OpenGraph Image Generation
 * Generates custom OG images for articles with title and metadata
 **************************************************/
import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Extract parameters from URL
    const title = searchParams.get("title") || "Middleware";
    const author = searchParams.get("author");
    const category = searchParams.get("category");
    const issueColor = searchParams.get("color") || "#c2081c";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            backgroundColor: "#fff7f4",
            padding: "80px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {/* Header - Middleware logo and category */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "#000000",
                letterSpacing: "-0.02em",
              }}
            >
              MIDDLEWARE
            </div>
            {category && (
              <div
                style={{
                  fontSize: 24,
                  color: issueColor,
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                {category}
              </div>
            )}
          </div>

          {/* Main content - Article title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              maxWidth: "90%",
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                color: "#000000",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                maxWidth: "100%",
                wordWrap: "break-word",
              }}
            >
              {title}
            </div>
          </div>

          {/* Footer - Author and branding */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            {author && (
              <div
                style={{
                  fontSize: 28,
                  color: "#000000",
                  fontWeight: 500,
                }}
              >
                {author}
              </div>
            )}
            <div
              style={{
                fontSize: 24,
                color: "#000000",
                opacity: 0.6,
              }}
            >
              Rivista di cultura digitale
            </div>
          </div>

          {/* Accent bar */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "16px",
              backgroundColor: issueColor,
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OG Image generation error:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
