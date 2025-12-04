import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
      // Note: Each Vercel Blob store has a unique subdomain
      // Add your Vercel Blob domain here (you can find it in your Vercel dashboard)
      // The pathname pattern allows all paths from this domain
      {
        protocol: "https",
        hostname: "mdmdfxzts3o3uer1.public.blob.vercel-storage.com",
        pathname: "/**",
      },
      // If you have multiple Vercel Blob domains, add them here
      // Example:
      // {
      //   protocol: "https",
      //   hostname: "another-domain.public.blob.vercel-storage.com",
      // },
    ],
    // Allow unoptimized images for local API routes with query strings
    unoptimized: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
