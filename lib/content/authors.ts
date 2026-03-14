/* **************************************************
 * Imports
 **************************************************/
import { authors } from "@/.velite";

const safeAuthors = Array.isArray(authors) ? authors : [];

/* **************************************************
 * Authors
 **************************************************/
export const getAllAuthors = () => safeAuthors;

export const getAuthorBySlug = (slug: string) => safeAuthors.find((a) => a.slug === slug);

export const getAuthorById = (id: string) => safeAuthors.find((a) => a.id === id);
