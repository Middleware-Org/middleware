/* **************************************************
 * Slug Generation Utility
 *
 * Provides utilities for generating URL-friendly slugs
 * from text strings with support for Italian characters
 * and special characters normalization.
 **************************************************/

/**
 * Generates a URL-friendly slug from a text string
 *
 * Features:
 * - Converts to lowercase
 * - Normalizes Unicode characters (removes accents)
 * - Removes special characters
 * - Replaces spaces with hyphens
 * - Removes consecutive hyphens
 * - Trims leading/trailing hyphens
 *
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 *
 * @example
 * generateSlug("Ciao, Mondo!") // "ciao-mondo"
 * generateSlug("L'importanza dell'innovazione") // "limportanza-dellinnovazione"
 * generateSlug("Città Tecnologica 2024") // "citta-tecnologica-2024"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD") // Normalize to decomposed form for handling accents
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics (accents)
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Validates if a string is a valid slug
 *
 * A valid slug:
 * - Contains only lowercase letters, numbers, and hyphens
 * - Does not start or end with a hyphen
 * - Does not contain consecutive hyphens
 *
 * @param slug - The string to validate
 * @returns True if the string is a valid slug
 *
 * @example
 * isValidSlug("hello-world") // true
 * isValidSlug("hello--world") // false
 * isValidSlug("-hello") // false
 */
export function isValidSlug(slug: string): boolean {
  // Must contain only lowercase letters, numbers, and hyphens
  // Must not start or end with hyphen
  // Must not contain consecutive hyphens
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugPattern.test(slug);
}
