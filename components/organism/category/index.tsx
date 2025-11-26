/* **************************************************
 * Imports
 **************************************************/
import { MonoTextLight } from "@/components/atoms/typography";
import Separator from "@/components/atoms/separetor";
import { SerifTextBold } from "@/components/atoms/typography";
import type { Category } from "@/.velite";
import { CategoriesDictionary, CommonDictionary } from "@/lib/i18n/types";
import { getArticlesByCategorySlug } from "@/lib/content";
import CategoryArticles from "../categoryArticles";
import styles from "./styles";

/* **************************************************
 * Types
 **************************************************/
type CategoryProps = {
  category: Category;
  dictCommon: Pick<CommonDictionary, "articleCard">;
  dictCategories: Pick<CategoriesDictionary, "page">;
  isLastCategory: boolean;
};

/* **************************************************
 * Category Component
 **************************************************/
export default async function Category({
  category,
  dictCommon,
  dictCategories,
  isLastCategory,
}: CategoryProps) {
  const articles = getArticlesByCategorySlug(category.slug);

  if (!articles || articles.length === 0) return null;

  return (
    <section id={category.slug} className={styles.section}>
      {/* Header with title and separator */}
      <div className={styles.header}>
        <SerifTextBold className={styles.title}>{category.name}</SerifTextBold>
        <Separator className={styles.separator} />
      </div>

      {/* Description */}
      {category.description && (
        <MonoTextLight className={styles.description}>{category.description}</MonoTextLight>
      )}

      {/* Articles list */}
      <CategoryArticles
        articles={articles}
        dictCommon={dictCommon}
        dictCategories={dictCategories}
        category={category}
      />

      {/* Bottom separator */}
      {!isLastCategory && <Separator className={styles.separatorBottom} />}
    </section>
  );
}
