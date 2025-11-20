/* **************************************************
 * Imports
 **************************************************/
import { getAllIssues, getArticlesByIssue } from "@/lib/content";
import { cn } from "@/lib/utils/classes";
import ArchiveScrollWrapper from "./components/ArchiveScrollWrapper";
import Image from "next/image";
import IssueFooter from "./components/IssueFooter";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";
import Link from "next/link";
import { MonoTextBold } from "@/components/atoms/typography";
import { lightenColor } from "@/lib/utils/color";

/* **************************************************
 * Types
 **************************************************/
type ArchivePageProps = {
  params: Promise<{ locale: string }>;
};

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  wrapper: cn("mx-auto max-w-[1472px] w-full"),
  container: cn("px-0 md:px-4 lg:px-10 py-0 md:py-6 lg:py-10"),
  innerContainer: cn("flex gap-10"),
  issueCoverContainer: cn("flex flex-col w-full md:w-1/2 lg:w-2/5 shrink-0"),
  link: cn("h-full flex flex-col"),
  coverContainer: cn("flex flex-col flex-1 min-h-0"),
  imageWrapper: cn("flex flex-1 min-h-0 lg:p-0 md:p-0 px-4 py-0 relative"),
  image: cn("w-full h-full object-cover"),
  titleContainer: cn("flex flex-col px-4 py-4 lg:px-0 lg:py-4"),
  title: cn("text-2xl font-bold"),
  description: cn("text-sm text-gray-500"),
  readAllButton: cn(
    "absolute bottom-0 right-0 px-4 py-2",
    "hover:bg-secondary hover:text-primary transition-colors duration-150",
    "z-10",
  ),
  readAllButtonText: cn("text-sm"),
};

/* **************************************************
 * Constants
 **************************************************/
const IMAGE_WIDTH = 800;
const IMAGE_HEIGHT = 500;

/* **************************************************
 * Archive Page
 **************************************************/
export default async function ArchivePage({ params }: ArchivePageProps) {
  const { locale } = await params;
  const issues = getAllIssues();
  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  return (
    <div className={styles.wrapper}>
      <ArchiveScrollWrapper
        stickyOffset={155}
        className={styles.container}
        innerClassName={styles.innerContainer}
      >
        {issues.map((issue, index) => {
          const articles = getArticlesByIssue(issue.slug);

          const lightColor = lightenColor(issue.color);

          return (
            <div key={issue.slug} id={`issue-${issue.slug}`} className={styles.issueCoverContainer}>
              <div className={styles.link}>
                <div className={styles.coverContainer}>
                  <div className={styles.imageWrapper} style={{ backgroundColor: issue.color }}>
                    <Image
                      src={issue.cover}
                      alt={issue.title}
                      width={IMAGE_WIDTH}
                      height={IMAGE_HEIGHT}
                      className={styles.image}
                      priority={index === 0}
                    />
                    <Link
                      href={`/issues/${issue.slug}`}
                      className={styles.readAllButton}
                      style={{ backgroundColor: lightColor }}
                    >
                      <MonoTextBold
                        className={styles.readAllButtonText}
                        style={{ color: issue.color }}
                      >
                        Leggi tutti gli articoli
                      </MonoTextBold>
                    </Link>
                  </div>
                </div>
                <IssueFooter issue={issue} articles={articles} dict={dict} />
              </div>
            </div>
          );
        })}
      </ArchiveScrollWrapper>
    </div>
  );
}
