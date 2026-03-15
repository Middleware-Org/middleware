"use client";

/* **************************************************
 * Web Vitals Reporter
 * Logs Core Web Vitals metrics in development.
 * Extend the handler to send metrics to a custom
 * analytics endpoint in production when needed.
 **************************************************/
import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[WebVitals] ${metric.name}`, {
        value: metric.value,
        rating: metric.rating,
        attribution: metric.attribution,
      });
    }
  });

  return null;
}
