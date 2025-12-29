import type { NextConfig } from "next";
import withPWA from "next-pwa";

const pwaConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  sw: "service-worker.js",
  publicExcludes: ["!robots.txt", "!sitemap.xml"],
});

const nextConfig: NextConfig = {
  images: {
    // Enable modern image formats (WebP and AVIF) for better compression
    formats: ["image/avif", "image/webp"],
    // Configure device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images for 60 seconds
    minimumCacheTTL: 60,
    // Domains allowed for remote images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "localhost",
      },
      // Vercel Blob Storage
      {
        protocol: "https",
        hostname: "mdmdfxzts3o3uer1.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
    // Enable optimization
    unoptimized: false,
  },
  // Security and performance headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' va.vercel-scripts.com vitals.vercel-insights.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' va.vercel-scripts.com vitals.vercel-insights.com mdmdfxzts3o3uer1.public.blob.vercel-storage.com raw.githubusercontent.com",
              "media-src 'self' https: blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
            ]
              .join("; ")
              .replace(/\s{2,}/g, " ")
              .trim(),
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  // Compiler optimizations
  compiler: {
    // Remove console logs in production (except error and warn)
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
    // Enable optimizeCss for better CSS performance
    optimizeCss: true,
  },
  // Compress responses
  compress: true,
  // Enable React strict mode for better development practices
  reactStrictMode: true,
  // Power by header disabled for security
  poweredByHeader: false,
};

export default pwaConfig(nextConfig);
