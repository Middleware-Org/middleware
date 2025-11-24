/* **************************************************
 * Imports
 **************************************************/
import CategoriesList from "@/components/organism/categoriesList";
import MobileCategoriesToggle from "@/components/organism/mobileCategoriesToogle";
import { getAllCategories } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/utils";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import Category from "@/components/organism/category";
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Types
 **************************************************/
type CategoriesPageProps = {
  params: Promise<{ locale: string }>;
};

/* **************************************************
 * Styles
 **************************************************/
const styles = {
  container: cn("max-w-[1472px] mx-auto px-4 lg:px-10 py-6 lg:py-10"),
  mobileToggle: cn("lg:hidden md:flex flex mb-6 sticky md:top-[115px] lg:top-[115px] top-0"),
  grid: cn("grid grid-cols-1 lg:grid-cols-[295px_auto] gap-10"),
  sidebar: cn("lg:sticky lg:top-[155px] md:top-[155px] lg:top-[115px] top-[115px] lg:h-fit"),
  content: cn("flex flex-col gap-10"),
};

/* **************************************************
 * Categories Page
 **************************************************/
export default async function CategoriesPage({ params }: CategoriesPageProps) {
  const { locale } = await params;
  const dictCategories = await getDictionary(locale, TRANSLATION_NAMESPACES.CATEGORIES);
  const dictCommon = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  const categories = getAllCategories();

  return (
    <div className={styles.container}>
      <div className={styles.mobileToggle}>
        <MobileCategoriesToggle dict={dictCategories} />
      </div>

      <div className={styles.grid}>
        <div className={styles.sidebar}>
          <CategoriesList categories={categories} />
        </div>

        <div className={styles.content}>
        {categories.map((category) => (
          <Category
            key={category.slug}
            category={category}
            dictCommon={dictCommon}
            dictCategories={dictCategories}
          />
        ))}
        </div>
      </div>
    </div>
  );
}
