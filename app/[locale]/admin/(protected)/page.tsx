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
  getAuthorBySlug,
  getCategoryBySlug,
  getIssueBySlug,
} from "@/lib/github";
import styles from "./styles";

/* **************************************************
 * Admin Protected Page
 ************************************************** */
export default async function AdminProtectedPage() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  const [issues, articles, categories, authors] = await Promise.all([
    getAllIssues(),
    getAllArticles(),
    getAllCategories(),
    getAllAuthors(),
  ]);

  // Risolvi tutte le relazioni degli articoli in parallelo
  const articlesWithRelations = await Promise.all(
    articles.map(async (article) => {
      const [author, category, issue] = await Promise.all([
        getAuthorBySlug(article.author),
        getCategoryBySlug(article.category),
        getIssueBySlug(article.issue),
      ]);

      return {
        ...article,
        authorRelation: author,
        categoryRelation: category,
        issueRelation: issue,
      };
    }),
  );

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard admin</h1>
        <p className={styles.welcome}>
          Ciao {user.name ?? user.email}, benvenutə nell&apos;area riservata.
        </p>
        <nav className={styles.nav}>
          <Link href="/admin/categories" className={styles.navLink}>
            Gestisci Categorie →
          </Link>
          <Link href="/admin/authors" className={styles.navLink}>
            Gestisci Autori →
          </Link>
          <Link href="/admin/issues" className={styles.navLink}>
            Gestisci Issues →
          </Link>
          <Link href="/admin/media" className={styles.navLink}>
            Gestisci Media →
          </Link>
        </nav>
      </div>

      <div className={styles.grid}>
        {/* Issues */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Issues ({issues.length})</h2>
          <ul className={styles.list}>
            {issues.map((issue) => (
              <li key={issue.slug} className={styles.listItem}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemTitle}>{issue.title}</span>
                  <span className={styles.itemSlug}>{issue.slug}</span>
                </div>
                <p className={styles.itemDescription}>{issue.description}</p>
                <div className={styles.itemMeta}>
                  <span className={styles.itemDate}>{issue.date}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Articles */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Articles ({articlesWithRelations.length})</h2>
          <ul className={styles.list}>
            {articlesWithRelations.map((article) => {
              return (
                <li key={article.slug} className={styles.listItem}>
                  <div className={styles.itemHeader}>
                    <span className={styles.itemTitle}>{article.title}</span>
                    <span className={styles.itemSlug}>{article.slug}</span>
                  </div>
                  <p className={styles.itemDescription}>{article.excerpt}</p>
                  <div className={styles.itemMeta}>
                    <span className={styles.itemDate}>{article.date}</span>
                    {article.in_evidence && <span className={styles.badge}>In evidenza</span>}
                  </div>
                  <div className={styles.relations}>
                    <div className={styles.relation}>
                      <span className={styles.relationLabel}>Author:</span>
                      <span className={styles.relationValue}>
                        {article.authorRelation?.name ?? article.author}
                      </span>
                    </div>
                    <div className={styles.relation}>
                      <span className={styles.relationLabel}>Category:</span>
                      <span className={styles.relationValue}>
                        {article.categoryRelation?.name ?? article.category}
                      </span>
                    </div>
                    <div className={styles.relation}>
                      <span className={styles.relationLabel}>Issue:</span>
                      <span className={styles.relationValue}>
                        {article.issueRelation?.title ?? article.issue}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Categories */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Categories ({categories.length})</h2>
          <ul className={styles.list}>
            {categories.map((category) => (
              <li key={category.slug} className={styles.listItem}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemTitle}>{category.name}</span>
                  <span className={styles.itemSlug}>{category.slug}</span>
                </div>
                <p className={styles.itemDescription}>{category.description}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Authors */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Authors ({authors.length})</h2>
          <ul className={styles.list}>
            {authors.map((author) => (
              <li key={author.slug} className={styles.listItem}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemTitle}>{author.name}</span>
                  <span className={styles.itemSlug}>{author.slug}</span>
                </div>
                <p className={styles.itemDescription}>{author.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
