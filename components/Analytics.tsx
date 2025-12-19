"use client";

/**
 * Analytics component with lazy loading
 * This component dynamically imports Vercel Analytics and Speed Insights
 * to reduce initial bundle size and improve performance metrics
 */

import dynamic from "next/dynamic";

// Dynamically import Analytics with no SSR (client-side only)
const VercelAnalytics = dynamic(
  () => import("@vercel/analytics/next").then((mod) => mod.Analytics),
  {
    ssr: false,
    loading: () => null,
  }
);

// Dynamically import SpeedInsights with no SSR (client-side only)
const VercelSpeedInsights = dynamic(
  () => import("@vercel/speed-insights/next").then((mod) => mod.SpeedInsights),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function Analytics() {
  return (
    <>
      <VercelAnalytics />
      <VercelSpeedInsights />
    </>
  );
}
