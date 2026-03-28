/* **************************************************
 * Imports
 **************************************************/
import Image from "next/image";
import Link from "next/link";

import { SerifText } from "@/components/atoms/typography";
import { getGitHubImageUrl } from "@/lib/github/images";
import { withLocale } from "@/lib/i18n/path";
import { cn } from "@/lib/utils/classes";
import { lightenColor } from "@/lib/utils/color";

import type { Issue } from "@/.velite";

/* **************************************************
 * Types
 **************************************************/
type IssueCoverProps = {
  issue: Issue;
  locale: string;
  imagePriority?: boolean;
};

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  coverContainer: cn("flex flex-row items-stretch"),
  issueLabelContainer: cn("flex items-start justify-center shrink-0 relative"),
  issueLabelWrapper: cn("h-full flex items-start pt-4"),
  issueLabelLink: cn("h-full flex items-start"),
  issueLabel: cn("whitespace-nowrap text-xl md:text-2xl lg:text-2xl p-2"),
  imageWrapper: cn("relative w-full aspect-[4/3] md:aspect-square"),
  image: cn("object-cover"),
};

/* **************************************************
 * IssueCover
 **************************************************/
export default function IssueCover({ issue, locale, imagePriority = true }: IssueCoverProps) {
  const lightColor = lightenColor(issue.color);
  const issueHref = withLocale(`/issues/${issue.slug}`, locale);

  return (
    <div className={styles.coverContainer}>
      <div className={styles.issueLabelContainer} style={{ backgroundColor: lightColor }}>
        <Link
          href={issueHref}
          className={styles.issueLabelLink}
          style={{
            borderLeft: `1px solid ${issue.color}`,
            borderBottom: `1px solid ${issue.color}`,
            borderTop: `1px solid ${issue.color}`,
          }}
        >
          <SerifText
            className={styles.issueLabel}
            style={{
              color: issue.color,
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              transform: "rotate(180deg)",
            }}
          >
            {issue.title}
          </SerifText>
        </Link>
      </div>
      <div className={styles.imageWrapper} style={{ backgroundColor: issue.color }}>
        <Image
          src={getGitHubImageUrl(issue.cover)}
          alt={issue.title}
          fill
          sizes="(max-width: 768px) 100vw, 75vw"
          className={styles.image}
          priority={imagePriority}
          style={{ objectFit: "cover" }}
        />
      </div>
    </div>
  );
}
