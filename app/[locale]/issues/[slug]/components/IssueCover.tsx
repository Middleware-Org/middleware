/* **************************************************
 * Imports
 **************************************************/
import Image from "next/image";
import { SerifText } from "@/components/atoms/typography";
import { lightenColor } from "@/lib/utils/color";
import { Issue } from "@/.velite";
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Types
 **************************************************/
type IssueCoverProps = {
  issue: Issue;
  locale: string;
};

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  coverContainer: cn("flex flex-row items-stretch"),
  issueLabelContainer: cn(
    "flex items-start justify-center shrink-0 relative aspect-[4/3] md:aspect-square",
  ),
  issueLabelWrapper: cn("h-full flex items-start pt-4"),
  issueLabel: cn("whitespace-nowrap text-xl md:text-2xl lg:text-2xl p-2"),
  imageWrapper: cn("relative w-full aspect-[4/3] md:aspect-square"),
  image: cn("object-cover"),
};

/* **************************************************
 * IssueCover
 **************************************************/
export default function IssueCover({ issue, locale }: IssueCoverProps) {
  const lightColor = lightenColor(issue.color);

  return (
    <div className={styles.coverContainer}>
      <div className={styles.issueLabelContainer} style={{ backgroundColor: lightColor }}>
        <div
          className={styles.issueLabelWrapper}
          style={{
            borderLeft: `1px solid ${issue.color}`,
            borderRight: `1px solid ${issue.color}`,
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
        </div>
      </div>
      <div className={styles.imageWrapper} style={{ backgroundColor: issue.color }}>
        <Image
          src={issue.cover}
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

