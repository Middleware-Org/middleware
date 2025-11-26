/* **************************************************
 * Imports
 **************************************************/
import { MonoTextLight } from "@/components/atoms/typography";
import Separator from "@/components/atoms/separetor";
import { SerifTextBold } from "@/components/atoms/typography";
import type { Author } from "@/.velite";
import { AuthorsDictionary, CommonDictionary } from "@/lib/i18n/types";
import { getArticlesByAuthorSlug } from "@/lib/content";
import AuthorArticles from "../authorArticles";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
type AuthorProps = {
  author: Author;
  dictCommon: Pick<CommonDictionary, "articleCard">;
  dictAuthors: Pick<AuthorsDictionary, "page">;
  isLastAuthor: boolean;
};

/* **************************************************
 * Author Component
 **************************************************/
export default async function Author({
  author,
  dictCommon,
  dictAuthors,
  isLastAuthor,
}: AuthorProps) {
  const articles = getArticlesByAuthorSlug(author.slug);

  if (!articles || articles.length === 0) return null;

  return (
    <section id={author.slug} className={styles.section}>
      {/* Header with title and separator */}
      <div className={styles.header}>
        <SerifTextBold className={styles.title}>{author.name}</SerifTextBold>
        <Separator className={styles.separator} />
      </div>

      {/* Description */}
      {author.description && (
        <MonoTextLight className={styles.description}>{author.description}</MonoTextLight>
      )}

      {/* Articles list */}
      <AuthorArticles
        articles={articles}
        dictCommon={dictCommon}
        dictAuthors={dictAuthors}
        author={author}
      />

      {/* Bottom separator */}
      {!isLastAuthor && <Separator className={styles.separatorBottom} />}
    </section>
  );
}
