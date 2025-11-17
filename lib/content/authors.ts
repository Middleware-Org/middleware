/* **************************************************
 * Imports
 **************************************************/
import { authors } from "@/.velite";

/* **************************************************
 * Authors
 **************************************************/
export const getAllAuthors = () => authors;

export const getAuthorBySlug = (slug: string) => authors.find((a) => a.slug === slug);

