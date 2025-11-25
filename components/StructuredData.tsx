/* **************************************************
 * Imports
 **************************************************/
import Script from "next/script";

/* **************************************************
 * Types
 **************************************************/
type StructuredDataProps = {
  data: Record<string, unknown>;
};

/* **************************************************
 * StructuredData Component
 * Genera lo script JSON-LD per lo structured data
 **************************************************/
export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
