/* **************************************************
 * Imports
 **************************************************/
import IssuesList from "@/components/organism/issuesList";
import MobileIssuesToggle from "@/components/organism/mobileIssuesToggle";
import { getAllIssues } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/utils";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import Issue from "@/components/organism/issue";
import { cn } from "@/lib/utils/classes";

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
  container: cn("max-w-[1472px] mx-auto px-4 lg:px-10 py-6 lg:py-10"),
  mobileToggle: cn("lg:hidden md:flex flex mb-6 sticky md:top-[115px] top-0"),
  grid: cn("grid grid-cols-1 lg:grid-cols-[295px_auto] gap-10"),
  sidebar: cn("lg:sticky lg:top-[115px] lg:h-fit"),
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
      <div className={styles.mobileToggle}>
        <MobileIssuesToggle issues={issues} />
      </div>

      <div className={styles.grid}>
        <div className={styles.sidebar}>
          <IssuesList issues={issues} />
        </div>

        {issues.map((issue) => (
          <Issue key={issue.slug} issue={issue} dictCommon={dictCommon} />
        ))}
      </div>
    </div>
  );
}
