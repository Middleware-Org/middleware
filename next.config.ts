import type { NextConfig } from "next";

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

export default nextConfig;
