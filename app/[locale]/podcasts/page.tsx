/* **************************************************
 * Imports
 **************************************************/
import IssuesList from "@/components/organism/issuesList";
import MobileIssuesToggle from "@/components/organism/mobileIssuesToggle";
import { getAllIssues, getAllPodcasts } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/utils";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import Issue from "@/components/organism/issue";
import { cn } from "@/lib/utils/classes";
import AutoScroll from "@/components/AutoScroll";

/* **************************************************
 * Types
 **************************************************/
type PodcastsPageProps = {
  params: Promise<{ locale: string }>;
};

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  container: cn("max-w-[1472px] mx-auto px-4 lg:px-10 py-0 lg:py-10"),
  mobileToggle: cn(
    "lg:hidden md:flex flex sticky top-[95px] md:top-[115px] pt-[20px] pb-[20px] bg-primary w-full",
  ),
  grid: cn("grid grid-cols-1 lg:grid-cols-[295px_auto] gap-10"),
  sidebar: cn("lg:sticky lg:top-[155px] lg:h-fit"),
  content: cn("flex flex-col gap-10"),
};

/* **************************************************
 * Podcasts Page
 **************************************************/
export default async function PodcastsPage({ params }: PodcastsPageProps) {
  const { locale } = await params;
  const dictCommon = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  const issues = getAllIssues();

  return (
    <div className={styles.container}>
      <AutoScroll paramName="issue" />
      <div className={styles.mobileToggle}>
        <MobileIssuesToggle issues={issues} />
      </div>

      <div className={styles.grid}>
        <div className={styles.sidebar}>
          <div className="hidden lg:block">
            <IssuesList issues={issues} />
          </div>
        </div>

        <div className={styles.content}>
          {issues.map((issue, index) => {
            const podcasts = getAllPodcasts();
            if (podcasts.length === 0) return null;
            return (
              <Issue
                key={issue.slug}
                issue={issue}
                dictCommon={dictCommon}
                isLastIssue={index === issues.length - 1}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
