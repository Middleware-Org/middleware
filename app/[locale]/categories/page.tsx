/* **************************************************
 * Imports
 **************************************************/
import AutoScroll from "@/components/AutoScroll";
import CategoriesList from "@/components/organism/categoriesList";
import Category from "@/components/organism/category";
import MobileCategoriesToggle from "@/components/organism/mobileCategoriesToogle";
import SidebarPageLayout from "@/components/organism/sidebarPageLayout";
import { getAllCategories } from "@/lib/content";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { getDictionary } from "@/lib/i18n/utils";

/* **************************************************
 * Types
 **************************************************/
type CategoriesPageProps = {
  params: Promise<{ locale: string }>;
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
    <>
      <AutoScroll paramName="category" />
      <SidebarPageLayout
        mobileToggle={<MobileCategoriesToggle dict={dictCategories} categories={categories} />}
        sidebar={<CategoriesList categories={categories} />}
      >
        {categories.map((category, index) => (
          <Category
            key={category.slug}
            category={category}
            dictCommon={dictCommon}
            dictCategories={dictCategories}
            isLastCategory={index === categories.length - 1}
            locale={locale}
          />
        ))}
      </SidebarPageLayout>
    </>
  );
}
