/* **************************************************
 * Imports
 **************************************************/
import { authors } from "@/.velite";

/* **************************************************
 * Authors
 **************************************************/
export const getAllAuthors = () => authors;

export const getAuthorBySlug = (slug: string) => authors.find((a) => a.slug === slug);

export const getAuthorById = (id: string) => authors.find((a) => a.id === id);

