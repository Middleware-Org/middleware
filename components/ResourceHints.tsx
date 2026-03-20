/**
 * Resource Hints Component
 * Adds preconnect and dns-prefetch links for performance optimization
 */
const defaultBlobStorageHostname = "mdmdfxzts3o3uer1.public.blob.vercel-storage.com";
const blobStorageHostname = (process.env.NEXT_PUBLIC_BLOB_HOSTNAME || defaultBlobStorageHostname)
  .replace(/^https?:\/\//, "")
  .replace(/\/.*/, "");

export default function ResourceHints() {
  return (
    <>
      {/* Preconnect to external domains for faster resource loading */}
      <link rel="preconnect" href={`https://${blobStorageHostname}`} />
      <link rel="preconnect" href="https://raw.githubusercontent.com" />

      {/* DNS prefetch for analytics and monitoring */}
      <link rel="dns-prefetch" href="https://va.vercel-scripts.com" />
      <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
    </>
  );
}
