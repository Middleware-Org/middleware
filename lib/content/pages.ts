/* **************************************************
 * Imports
 **************************************************/
import { pages } from "@/.velite";

/* **************************************************
 * Pages
 **************************************************/
export const getAllPages = () => pages;

export const getPageBySlug = (slug: string) => pages.find((p) => p.slug === slug);

