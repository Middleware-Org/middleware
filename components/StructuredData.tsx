/* **************************************************
 * Imports
 **************************************************/
import Script from "next/script";

/* **************************************************
 * Types
 **************************************************/
type StructuredDataProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
  id?: string;
};

/* **************************************************
 * StructuredData Component
 * Genera lo script JSON-LD per lo structured data
 **************************************************/
export default function StructuredData({ data, id = "structured-data" }: StructuredDataProps) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
