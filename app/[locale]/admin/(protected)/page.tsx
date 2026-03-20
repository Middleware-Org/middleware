/* **************************************************
 * Imports
 **************************************************/
import Link from "next/link";

import { getUser } from "@/lib/auth/server";
import {
  getAllIssues,
  getAllArticles,
  getAllCategories,
  getAllAuthors,
  getAllPages,
  getAllPodcasts,
  getAllUsers,
} from "@/lib/github";
import { getAllMediaFiles } from "@/lib/github/media";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { withLocale } from "@/lib/i18n/path";
import { getDictionary } from "@/lib/i18n/utils";

import TokenExpirationBanner from "./components/TokenExpirationBanner";
import styles from "./styles";

/* **************************************************
 * Admin Protected Page
 ************************************************** */
type AdminProtectedPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminProtectedPage({ params }: AdminProtectedPageProps) {
  const { locale } = await params;
  const user = await getUser();

  if (!user) {
    return null;
  }

  const [adminDict, issues, articles, categories, authors, pages, media, podcasts] =
    await Promise.all([
      getDictionary(locale, TRANSLATION_NAMESPACES.ADMIN),
      getAllIssues(),
      getAllArticles(),
      getAllCategories(),
      getAllAuthors(),
      getAllPages(),
      getAllMediaFiles(),
      getAllPodcasts(),
    ]);

  const users = user.role === "ADMIN" ? await getAllUsers() : [];

  const stats = [
    {
      title: adminDict.dashboard.stats.articles,
      count: articles.length,
      href: withLocale("/admin/articles", locale),
      icon: "📝",
      description: adminDict.dashboard.totalCount,
      color: "tertiary",
    },
    {
      title: adminDict.dashboard.stats.issues,
      count: issues.length,
      href: withLocale("/admin/issues", locale),
      icon: "📚",
      description: adminDict.dashboard.totalCount,
      color: "tertiary",
    },
    {
      title: adminDict.dashboard.stats.categories,
      count: categories.length,
      href: withLocale("/admin/categories", locale),
      icon: "📁",
      description: adminDict.dashboard.totalCount,
      color: "tertiary",
    },
    {
      title: adminDict.dashboard.stats.authors,
      count: authors.length,
      href: withLocale("/admin/authors", locale),
      icon: "👤",
      description: adminDict.dashboard.totalCount,
      color: "tertiary",
    },
    {
      title: adminDict.dashboard.stats.pages,
      count: pages.length,
      href: withLocale("/admin/pages", locale),
      icon: "📄",
      description: adminDict.dashboard.staticPages,
      color: "tertiary",
    },
    {
      title: adminDict.dashboard.stats.media,
      count: media.length,
      href: withLocale("/admin/media", locale),
      icon: "🖼️",
      description: adminDict.dashboard.uploadedFiles,
      color: "tertiary",
    },
    {
      title: adminDict.dashboard.stats.podcasts,
      count: podcasts.length,
      href: withLocale("/admin/podcasts", locale),
      icon: "🎙️",
      description: adminDict.dashboard.totalCount,
      color: "tertiary",
    },
    ...(user.role === "ADMIN"
      ? [
          {
            title: adminDict.dashboard.stats.users,
            count: users.length,
            href: withLocale("/admin/users", locale),
            icon: "👤",
            description: adminDict.dashboard.totalCount,
            color: "tertiary",
          },
        ]
      : []),
  ];

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{adminDict.dashboard.title}</h1>
          <p className={styles.welcome}>
            {adminDict.dashboard.welcome.replace("{{name}}", user.name ?? user.email)}
          </p>
        </div>
      </div>

      <TokenExpirationBanner locale={locale} dict={adminDict.tokenBanner} />

      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <Link key={stat.href} href={stat.href} className={styles.statCard}>
            <div className={styles.statCardHeader}>
              <span className={styles.statIcon}>{stat.icon}</span>
              <div className={styles.statCardInfo}>
                <h3 className={styles.statTitle}>{stat.title}</h3>
                <p className={styles.statDescription}>{stat.description}</p>
              </div>
            </div>
            <div className={styles.statCardFooter}>
              <span className={styles.statCount}>{stat.count}</span>
              <span className={styles.statLink}>{adminDict.dashboard.viewAll} →</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
