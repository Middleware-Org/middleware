/* **************************************************
 * Imports
 **************************************************/
import matter from "gray-matter";
import { createOrUpdateFile, deleteFile, getFileContent, listDirectoryFiles } from "./client";
import type { Article } from "./types";

/* **************************************************
 * Articles
 ************************************************** */
export async function getAllArticles(): Promise<Article[]> {
  const files = await listDirectoryFiles("content/articles");
  const mdFiles = files.filter((f) => f.type === "file" && f.name.endsWith(".md"));

  const articles = await Promise.all(
    mdFiles.map(async (file) => {
      try {
        const content = await getFileContent(file.path);

        // Valida che il contenuto non sia vuoto
        if (!content || content.trim().length === 0) {
          console.warn(`File ${file.path} is empty, skipping`);
          return null;
        }

        const { data, content: markdownContent } = matter(content);

        return {
          slug: data.slug || file.name.replace(".md", ""),
          title: data.title,
          date: data.date,
          author: data.author,
          category: data.category,
          issue: data.issue,
          in_evidence: data.in_evidence ?? false,
          excerpt: data.excerpt || "",
          content: markdownContent,
        } as Article;
      } catch (error) {
        console.error(`Error parsing article file ${file.path}:`, error);
        return null;
      }
    }),
  );

  // Filtra i valori null (file non validi)
  const validArticles = articles.filter((article): article is Article => article !== null);

  return validArticles.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  try {
    const files = await listDirectoryFiles("content/articles");
    const mdFiles = files.filter((f) => f.type === "file" && f.name.endsWith(".md"));
    
    console.log(`Searching for article with slug: ${slug}`);
    console.log(`Found ${mdFiles.length} markdown files:`, mdFiles.map((f) => f.name));

    // Prima cerca per nome file esatto
    let file = mdFiles.find((f) => f.name === `${slug}.md`);
    
    // Se non trovato, cerca per slug nel frontmatter
    if (!file) {
      console.log(`File ${slug}.md not found, searching in frontmatter...`);
      for (const f of mdFiles) {
        try {
          const content = await getFileContent(f.path);
          if (!content || content.trim().length === 0) continue;
          
          const { data } = matter(content);
          if (data.slug === slug || f.name.replace(".md", "") === slug) {
            file = f;
            console.log(`Found article by frontmatter slug: ${f.name}`);
            break;
          }
        } catch (e) {
          // Skip files that can't be parsed
          continue;
        }
      }
    }

    if (!file) {
      console.warn(`Article file not found for slug: ${slug}`);
      console.warn(`Available files:`, mdFiles.map((f) => f.name));
      return undefined;
    }

    const content = await getFileContent(file.path);

    // Valida che il contenuto non sia vuoto
    if (!content || content.trim().length === 0) {
      console.warn(`Article file ${file.path} is empty`);
      return undefined;
    }

    try {
      const { data, content: markdownContent } = matter(content);

      // Valida che i campi obbligatori siano presenti (ma non bloccare se mancano, solo log)
      if (!data.title || !data.date || !data.author || !data.category || !data.issue) {
        console.warn(`Article ${slug} is missing some required fields:`, {
          title: !!data.title,
          date: !!data.date,
          author: !!data.author,
          category: !!data.category,
          issue: !!data.issue,
        });
        // Non bloccare, ma usa valori di default se mancano
      }

      return {
        slug: data.slug || slug,
        title: data.title || "Untitled",
        date: data.date || new Date().toISOString().split("T")[0],
        author: data.author || "",
        category: data.category || "",
        issue: data.issue || "",
        in_evidence: data.in_evidence ?? false,
        excerpt: data.excerpt || "",
        content: markdownContent || "",
      } as Article;
    } catch (parseError) {
      console.error(`Error parsing frontmatter for article ${slug}:`, parseError);
      return undefined;
    }
  } catch (error) {
    console.error(`Error getting article ${slug}:`, error);
    return undefined;
  }
}

export async function getArticlesByIssue(issueSlug: string): Promise<Article[]> {
  const articles = await getAllArticles();
  return articles.filter((a) => a.issue === issueSlug);
}

export async function createArticle(article: Omit<Article, "slug"> & { slug?: string }) {
  const slug = article.slug || article.title.toLowerCase().replace(/\s+/g, "-");

  // Crea il frontmatter
  const frontmatter = {
    slug,
    title: article.title,
    date: article.date,
    author: article.author,
    category: article.category,
    issue: article.issue,
    in_evidence: article.in_evidence ?? false,
    excerpt: article.excerpt || "",
  };

  // Combina frontmatter e contenuto
  const fileContent = matter.stringify(article.content, frontmatter);

  const filePath = `content/articles/${slug}.md`;
  await createOrUpdateFile(filePath, fileContent, `Create article: ${article.title}`);

  return { ...article, slug };
}

export async function updateArticle(slug: string, article: Partial<Omit<Article, "slug">>) {
  // Trova il file reale usando lo stesso metodo di getArticleBySlug
  const files = await listDirectoryFiles("content/articles");
  const mdFiles = files.filter((f) => f.type === "file" && f.name.endsWith(".md"));
  
  // Prima cerca per nome file esatto
  let file = mdFiles.find((f) => f.name === `${slug}.md`);
  
  // Se non trovato, cerca per slug nel frontmatter
  if (!file) {
    for (const f of mdFiles) {
      try {
        const content = await getFileContent(f.path);
        if (!content || content.trim().length === 0) continue;
        
        const { data } = matter(content);
        if (data.slug === slug || f.name.replace(".md", "") === slug) {
          file = f;
          break;
        }
      } catch (e) {
        continue;
      }
    }
  }

  if (!file) {
    throw new Error(`Article file not found for slug: ${slug}`);
  }

  // Usa il nome del file reale (senza estensione) come slug per il path
  const fileSlug = file.name.replace(".md", "");
  const existing = await getArticleBySlug(slug);
  
  if (!existing) {
    throw new Error(`Article ${slug} not found`);
  }

  const updated: Article = {
    slug: fileSlug, // Usa il nome del file reale
    title: article.title ?? existing.title,
    date: article.date ?? existing.date,
    author: article.author ?? existing.author,
    category: article.category ?? existing.category,
    issue: article.issue ?? existing.issue,
    in_evidence: article.in_evidence !== undefined ? article.in_evidence : existing.in_evidence,
    excerpt: article.excerpt ?? existing.excerpt,
    content: article.content ?? existing.content,
  };

  // Crea il frontmatter - mantieni lo slug del file reale
  const frontmatter = {
    slug: fileSlug, // Usa il nome del file reale
    title: updated.title,
    date: updated.date,
    author: updated.author,
    category: updated.category,
    issue: updated.issue,
    in_evidence: updated.in_evidence,
    excerpt: updated.excerpt,
  };

  // Combina frontmatter e contenuto
  const fileContent = matter.stringify(updated.content, frontmatter);

  // Usa il nome del file reale per il path
  const filePath = `content/articles/${fileSlug}.md`;
  console.log(`Updating article file: ${filePath} (original slug: ${slug}, file slug: ${fileSlug})`);
  
  await createOrUpdateFile(filePath, fileContent, `Update article: ${updated.title}`);

  return updated;
}

export async function deleteArticle(slug: string) {
  // Verifica se l'articolo esiste
  const article = await getArticleBySlug(slug);
  if (!article) {
    throw new Error(`Article ${slug} not found`);
  }

  // Se l'articolo esiste, procedi con l'eliminazione
  const filePath = `content/articles/${slug}.md`;
  await deleteFile(filePath, `Delete article: ${slug}`);
}
