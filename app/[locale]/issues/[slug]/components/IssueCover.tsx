/* **************************************************
 * Imports
 **************************************************/
import Image from "next/image";
import Link from "next/link";
import { SerifText } from "@/components/atoms/typography";
import { lightenColor } from "@/lib/utils/color";
import { Issue } from "@/.velite";
import { cn } from "@/lib/utils/classes";
import { getGitHubImageUrl } from "@/lib/github/images";

/* **************************************************
 * Types
 **************************************************/
type IssueCoverProps = {
  issue: Issue;
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
export default function IssueCover({ issue }: IssueCoverProps) {
  const lightColor = lightenColor(issue.color);

  return (
    <div className={styles.coverContainer}>
      <div className={styles.issueLabelContainer} style={{ backgroundColor: lightColor }}>
        <Link
          href={`/issues/${issue.slug}`}
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
          className={styles.image}
          priority
          style={{ objectFit: "cover" }}
        />
      </div>
    </div>
  );
}
