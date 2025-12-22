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
import TokenExpirationBanner from "./components/TokenExpirationBanner";
import styles from "./styles";

/* **************************************************
 * Admin Protected Page
 ************************************************** */
export default async function AdminProtectedPage() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  const [issues, articles, categories, authors, pages, media, podcasts, users] = await Promise.all([
    getAllIssues(),
    getAllArticles(),
    getAllCategories(),
    getAllAuthors(),
    getAllPages(),
    getAllMediaFiles(),
    getAllPodcasts(),
    getAllUsers(),
  ]);

  const stats = [
    {
      title: "Articoli",
      count: articles.length,
      href: "/admin/articles",
      icon: "📝",
      description: "Numero totale",
      color: "tertiary",
    },
    {
      title: "Issues",
      count: issues.length,
      href: "/admin/issues",
      icon: "📚",
      description: "Numero totale",
      color: "tertiary",
    },
    {
      title: "Categorie",
      count: categories.length,
      href: "/admin/categories",
      icon: "📁",
      description: "Numero totale",
      color: "tertiary",
    },
    {
      title: "Autori",
      count: authors.length,
      href: "/admin/authors",
      icon: "👤",
      description: "Numero totale",
      color: "tertiary",
    },
    {
      title: "Pagine",
      count: pages.length,
      href: "/admin/pages",
      icon: "📄",
      description: "Pagine statiche",
      color: "tertiary",
    },
    {
      title: "Media",
      count: media.length,
      href: "/admin/media",
      icon: "🖼️",
      description: "File caricati",
      color: "tertiary",
    },
    {
      title: "Podcasts",
      count: podcasts.length,
      href: "/admin/podcasts",
      icon: "🎙️",
      description: "Numero totale",
      color: "tertiary",
    },
    {
      title: "Utenti",
      count: users.length,
      href: "/admin/users",
      icon: "👤",
      description: "Numero totale",
      color: "tertiary",
    },
  ];

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.welcome}>
            Ciao {user.name ?? user.email}, benvenutə nell&apos;area riservata.
          </p>
        </div>
      </div>

      <TokenExpirationBanner />

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
              <span className={styles.statLink}>Vedi tutti →</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
